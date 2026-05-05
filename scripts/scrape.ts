/**
 * MBAUnlocked — Reddit Interview Transcript Scraper
 * Targets: IIM Ahmedabad (iima) and IIM Bangalore (iimb) ONLY.
 *
 * Pipeline:
 *  1. collectCandidatePosts()  — Reddit JSON search API + PullPush (historical)
 *  2. isLikelyTranscript()     — keyword + signal gate (no API cost)
 *  3. detectCollege()          — strict hardcoded alias matching
 *  4. extractWithGemini()      — Gemini Flash (free), fallback → regex
 *  5. saveTranscript()         — Prisma → SQLite, stores Q&A rows too
 */

import { PrismaClient } from '@prisma/client';
import { SUPPORTED_COLLEGES, GLOBAL_NOISE } from './config';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REDDIT_UA = 'mbaunlocked-scraper/1.0 (educational project)';
const MAX_RETRIES = 1;           // fail fast on 429 — open circuit quickly
const REDDIT_DELAY_MS = 2000;   // between Reddit requests
const GEMINI_DELAY_MS = 4500;   // ~13 RPM — within free-tier 15 RPM limit
const MIN_CHARS = 200;    // minimum body length — transcripts are always long
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const RESET_BEFORE_SCRAPE = process.env.RESET_BEFORE_SCRAPE === 'true';
const REDDIT_CIRCUIT_429_THRESHOLD = 2;
const ADDITIONAL_REDDIT_URLS = (process.env.ADDITIONAL_REDDIT_URLS ?? '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

// ---------------------------------------------------------------------------
// Blacklist Logic
// ---------------------------------------------------------------------------

interface Blacklist {
  excluded_titles: string[];
}

const BLACKLIST_PATH = path.join(__dirname, 'blacklist.json');
let blacklist: Blacklist = { excluded_titles: [] };

try {
  if (fs.existsSync(BLACKLIST_PATH)) {
    blacklist = JSON.parse(fs.readFileSync(BLACKLIST_PATH, 'utf-8'));
    console.log(`[Blacklist] Loaded ${blacklist.excluded_titles.length} excluded titles.`);
  }
} catch (err) {
  console.warn(`[Blacklist] Failed to load blacklist: ${err}`);
}

function isBlacklisted(title: string): boolean {
  const normalizedTitle = title.trim().toLowerCase();
  return blacklist.excluded_titles.some(
    t => t.trim().toLowerCase() === normalizedTitle
  );
}

async function cleanupBlacklistedTranscripts() {
  if (blacklist.excluded_titles.length === 0) return;
  console.log('[Blacklist] Running auto-cleanup...');
  
  let deletedCount = 0;
  for (const title of blacklist.excluded_titles) {
    // Search for transcripts where fullText starts with this title
    const searchPattern = `${title.trim()}\n\n%`;
    const transcripts = await prisma.transcript.findMany({
      where: {
        fullText: {
          startsWith: title.trim(),
        }
      },
      select: { id: true, contactInfo: true }
    });

    if (transcripts.length > 0) {
      for (const t of transcripts) {
        await prisma.transcript.delete({ where: { id: t.id } });
        console.log(`[Blacklist] Deleted: ${t.contactInfo} ("${title.slice(0, 50)}...")`);
        deletedCount++;
      }
    }
  }
  if (deletedCount > 0) console.log(`[Blacklist] Cleanup complete. Removed ${deletedCount} transcripts.`);
}

// ---------------------------------------------------------------------------
// Supported colleges — Imported from config.ts
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RedditPost {
  id: string;
  title: string;
  selftext?: string;
  author?: string;
  permalink?: string;
  created_utc?: number;
}

interface QnAPair { q: string; a: string; }

interface ExtractedProfile {
  catPercentile: string;
  gender: string;
  gradField: string;
  category: string;
  workExperience: string;
  verdict: string;
  qna: QnAPair[];
}

class RedditRateLimitedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RedditRateLimitedError';
  }
}

let redditConsecutive429 = 0;
let redditCircuitOpen = false;

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function normalise(s: string) { return s.replace(/\s+/g, ' ').trim(); }

/**
 * Removes unnecessary backslashes before special characters often added by 
 * markdown escaping (e.g., \[ -> [, \_ -> _).
 */
function unescapeMarkdown(text: string): string {
  if (!text) return text;
  // Unescape common markdown escapes: \ followed by a punctuation character
  return text.replace(/\\([!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])/g, '$1');
}

/**
 * Escape a string for use inside a RegExp, then replace any whitespace run
 * with `\s+` so "iim bangalore" also matches "iim  bangalore".
 */
function toWordBoundaryRegex(alias: string, flags = 'i'): RegExp {
  const escaped = alias
    .replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    .replace(/\s+/g, '[\\s\\-]*'); // Allow space, hyphen, or nothing between words
  return new RegExp(`(?<![a-z])${escaped}(?![a-z])`, flags);
}

// ---------------------------------------------------------------------------
// College detection
// ---------------------------------------------------------------------------

function hasNoise(text: string): boolean {
  const lower = text.toLowerCase();
  return GLOBAL_NOISE.some(n => toWordBoundaryRegex(n).test(lower));
}

/**
 * Returns the collegeId if one — and only one — supported college is
 * positively identified. Returns null on ambiguity or no match.
 */
function detectCollege(title: string, body: string): string | null {
  const lowerTitle = title.toLowerCase();
  const lowerFull = lowerTitle + ' ' + body.toLowerCase();

  // ── Step 0: Generic "Other College" Title Check ────────────────────────────
  // If the title mentions "IIM [X]" or "IIT [X]" and it's not a supported college, reject.

  // Check for any IIM [letter/name]
  const iimMatch = lowerTitle.match(/\biim\s*([a-z]+)\b/);
  if (iimMatch) {
    const name = iimMatch[1].trim();
    const isSupportedIIM = SUPPORTED_COLLEGES.some(c => c.aliases.some(a => a.includes(name)));
    if (!isSupportedIIM && name.length > 0) return null;
  }

  // Check for any IIT [name]
  if (lowerTitle.match(/\biit\b/)) {
    // Unless it explicitly mentions a supported college in the title too, reject IIT titles
    const hasSupported = SUPPORTED_COLLEGES.some(c => c.aliases.some(a => toWordBoundaryRegex(a).test(lowerTitle)));
    if (!hasSupported) return null;
  }

  // ── Step 1: title-level strict match ──────────────────────────────────────
  const titleHits = new Set<string>();
  for (const col of SUPPORTED_COLLEGES) {
    const noise = col.noiseAliases.some(n => toWordBoundaryRegex(n).test(lowerTitle));
    if (noise) continue;
    if (col.aliases.some(a => toWordBoundaryRegex(a).test(lowerTitle))) {
      titleHits.add(col.id);
    }
  }
  // Any global noise in title → reject immediately
  if (hasNoise(lowerTitle)) return null;
  if (titleHits.size === 1) return [...titleHits][0];

  // ── Step 2: frequency count over full text ─────────────────────────────────
  const counts = new Map<string, number>(SUPPORTED_COLLEGES.map(c => [c.id, 0]));
  let noiseScore = 0;

  // Count noise mentions to avoid false positives (e.g. FMS transcripts mentioning IIM A rejects)
  for (const n of GLOBAL_NOISE) {
    const hits = lowerFull.match(toWordBoundaryRegex(n, 'gi'));
    if (hits) noiseScore += hits.length;
  }

  for (const col of SUPPORTED_COLLEGES) {
    const noise = col.noiseAliases.some(n => toWordBoundaryRegex(n, 'gi').test(lowerFull));
    if (noise) continue;
    for (const alias of col.aliases) {
      const hits = lowerFull.match(toWordBoundaryRegex(alias, 'gi'));
      if (hits) counts.set(col.id, (counts.get(col.id) ?? 0) + (hits?.length ?? 0));
    }
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [topId, topCount] = sorted[0];

  if (topCount === 0) return null;

  // If noise mentions are more frequent than supported college mentions, reject.
  if (noiseScore > topCount) return null;

  // ── Step 3: Specific "Converted" / "Rejected" Sentiment Check ───────────────
  // If a noise college is mentioned as "converted" or "joined", and the top supported 
  // college is NOT, reject. (Example: "IIM A reject, FMS convert")
  const noiseConverted = GLOBAL_NOISE.some(n =>
    new RegExp(`(?:converted|into|joined|in at|finalized)\\s+${n}`, 'i').test(lowerFull) ||
    new RegExp(`${n}\\s+(?:converted|convert)`, 'i').test(lowerFull)
  );

  if (noiseConverted) {
    const topSupportedConverted = new RegExp(`(?:converted|into|joined|in at|finalized)\\s+${topId}`, 'i').test(lowerFull) ||
      new RegExp(`${topId}\\s+(?:converted|convert)`, 'i').test(lowerFull);
    if (!topSupportedConverted) return null;
  }

  const [, secondCount] = sorted[1] ?? ['', 0];
  // Strict: only return if top college is unambiguously dominant
  if (topCount === secondCount) return null;
  return topId;
}

// ---------------------------------------------------------------------------
// Transcript quality gate
// ---------------------------------------------------------------------------

const TRANSCRIPT_KEYWORDS = [
  'interview transcript', 'pi transcript', 'interview experience',
  'pi experience', 'gdpi experience', 'gdpi transcript',
  'transcript', 'interview', 'gdpi', 'pi round',
];

const BODY_SIGNALS: RegExp[] = [
  /\bm1\b/i, /\bm2\b/i, /\bm3\b/i,
  /\bawt\b/i, /\bwat\b/i,
  /document\s*verif/i,
  /why\s+mba/i,
  /waitlist(?:ed)?/i, /reject(?:ed)?/i, /convert(?:ed)?/i,
  /\bpanel\b/i,
  /percentile/i,
  /\bfresher\b/i,
  /work\s*ex(?:perience)?/i,
  /\bcat\s*\d{4}\b/i,
  /\binterview\b/i,
  /\bgdpi\b/i,
  /\bpi\b/i,
  /told\s+(?:me|them|him|her)/i,
  /\bquestion(?:ed|s)?\b/i,
  /panelist/i,
  /p1\s*:/i, /p2\s*:/i, /p3\s*:/i,   // common panelist notation
  /m1\s*:/i, /m2\s*:/i,
  /f1\s*:/i, /f2\s*:/i,
  /m\s*:/i, /f\s*:/i,
  /bad\s*cop/i, /good\s*cop/i,
];

const STRONG_TRANSCRIPT_LINE_PATTERNS: RegExp[] = [
  /^\s*(?:p|m|f|me|i|interviewer|panelist|panel|bad cop|good cop)\d*\s*[-:)]/gim,
  /^\s*(?:date|cat percentile|percentile|workex|work experience|ug stream|awt|wat)\s*:/gim,
];
const MIN_INTERVIEWER_TURNS = 2;
const MIN_QNA_PAIRS = 4;

function countRegexMatches(text: string, regex: RegExp) {
  let count = 0;
  const withGlobalFlag = regex.global
    ? regex
    : new RegExp(regex.source, `${regex.flags}g`);
  withGlobalFlag.lastIndex = 0;
  let match = withGlobalFlag.exec(text);
  while (match) {
    count++;
    match = withGlobalFlag.exec(text);
  }
  return count;
}

function transcriptStructureScore(title: string, body: string) {
  const full = `${title}\n${body}`;
  const lineHits = STRONG_TRANSCRIPT_LINE_PATTERNS.reduce(
    (acc, pattern) => acc + countRegexMatches(full, pattern),
    0,
  );

  // Common transcript section separators in CAT interview posts
  const sectionHits = [
    /\b(document verification|doc verification)\b/i,
    /\b(awt|wat)\b/i,
    /\b(why mba)\b/i,
    /\b(questions asked|cross[- ]?questioning)\b/i,
  ].reduce((acc, pattern) => acc + (pattern.test(full) ? 1 : 0), 0);

  return lineHits + sectionHits;
}

function interviewerTurnCount(text: string) {
  return countRegexMatches(text, /^\s*(?:p|m|i|f|me|interviewer|panelist|panel|bad cop|good cop)\d*\s*[-:)]/gim);
}

/**
 * Hard gate: the body must contain actual dialogue lines like "M1 -", "M2:", "P1:", "Me -"
 * This eliminates celebration posts, advice posts, and short mention posts.
 */
function hasDialogueLines(body: string): boolean {
  const patterns = [
    /^\s*(?:m\d+|p\d+|me|i|c|a|x|interviewer|panelist|panel|bad cop|good cop)\s*[-:)]/gim,
    /\b(interviewer|panelist|they asked|he asked|she asked|asked me|told me|replied)\b/i,
    /^\s*[•*-]\s*(?:m\d+|p\d+|me|i|c|a|x|interviewer|panelist)/gim, // bullet points
  ];

  return patterns.some(p => p.test(body));
}

/**
 * Identifies high-confidence titles that should bypass some signal checks.
 * Handles variations like "IIM A PGDM Transcript", "FABM", "Score my IIM A interview".
 */
function isPotentialTranscriptTitle(title: string): boolean {
  const lower = title.toLowerCase();
  if (hasNoise(lower)) return false;

  const keywords = [
    'transcript', 'experience', 'pi ', ' pi', 'gdpi', 'wat', 'awt', 'interview',
    'pgp', 'fabm', 'stress', 'score'
  ];
  const hasKeyword = keywords.some(kw => lower.includes(kw));

  const isSupported = SUPPORTED_COLLEGES.some(c => c.aliases.some(a =>
    toWordBoundaryRegex(a).test(lower)
  ));

  return hasKeyword && isSupported;
}

function isStrongTitle(title: string): boolean {
  const lower = title.toLowerCase();
  if (hasNoise(lower)) return false;

  // Very specific transcript indicators
  const explicitKeywords = [
    'transcript', 'detailed transcript', 'pi transcript', 'interview transcript',
    'gdpi transcript', 'transcript converted', 'interview experience'
  ];
  const hasExplicitKeyword = explicitKeywords.some(kw => lower.includes(kw));

  const isSupported = SUPPORTED_COLLEGES.some(c => c.aliases.some(a =>
    toWordBoundaryRegex(a).test(lower)
  ));

  if (!isSupported) return false;

  // Negative indicators for titles that look like transcripts but are actually queries
  const noiseKeywords = [
    'form', 'letter', 'document', 'doc ', 'help', 'query', 'marks', 'score',
    'percentile', 'profile', 'chance', 'convert?', 'join?', 'which one',
    'suggest', 'request', 'anyone', 'ppl', 'people', 'advice'
  ];
  if (noiseKeywords.some(kw => lower.includes(kw))) return false;

  // If it has an explicit transcript keyword, it's strong
  if (hasExplicitKeyword) return true;

  // Handle "[College] Interview" or "Score my [College] interview"
  const interviewKeywords = ['interview', 'pi ', ' pi', 'gdpi'];
  const hasInterview = interviewKeywords.some(kw => lower.includes(kw));

  // Require interview keyword + some detail indicator
  const detailIndicators = ['detailed', 'gone bad', 'stress', 'experience', 'questions'];
  const hasDetail = detailIndicators.some(d => lower.includes(d));

  return (hasInterview && hasDetail);
}

function isLikelyTranscript(title: string, body: string): boolean {
  if (isBlacklisted(title)) return false;

  const combined = `${title}\n${body}`;
  const textWithoutUrls = combined.replace(/https?:\/\/[^\s]+/g, '').trim();
  if (textWithoutUrls.length < MIN_CHARS) return false;

  if (isStrongTitle(title)) return true;

  const lowerTitle = title.toLowerCase();
  const lowerBody = body.toLowerCase();

  const hasKeyword = TRANSCRIPT_KEYWORDS.some(
    kw => lowerTitle.includes(kw) || lowerBody.includes(kw),
  );

  const signalHits = BODY_SIGNALS.reduce(
    (n, re) => n + (re.test(lowerBody) ? 1 : 0), 0,
  );

  // Loose filter: just need a keyword or a few signals
  return (hasKeyword || signalHits >= 2);
}

// ---------------------------------------------------------------------------
// Regex-based profile extraction (fallback when Gemini unavailable)
// ---------------------------------------------------------------------------

function regexExtractProfile(text: string, collegeId: string): ExtractedProfile {
  // Gender
  let gender = 'NA';
  const codeMatch = text.match(/\b(GEM|GEF|GNEM|GNEF)\b/i);
  if (codeMatch) {
    gender = /F/i.test(codeMatch[0]) ? 'Female' : 'Male';
  } else if (/\b(female|woman|girl)\b/i.test(text)) {
    gender = 'Female';
  } else if (/\b(male|man|boy)\b/i.test(text)) {
    gender = 'Male';
  }

  // Grad field
  let gradField = 'NA';
  if (/\b(GEM|GEF)\b/i.test(text)) gradField = 'Engineer';
  else if (/\bb\.?tech\b|\bmtech\b|\bbtech\b|computer\s*science|electrical|mechanical|civil\s*eng|electronics/i.test(text)) gradField = 'Engineer';
  else if (/\bmbbs\b|\bdoctor\b|\bpharmacy\b|\bmedicine\b/i.test(text)) gradField = 'Medical';
  else if (/\bllb\b|\blaw\b|\bba\s*llb\b/i.test(text)) gradField = 'Law';
  else if (/\bb\.?com\b|\bca\b|\bchartered\s*accountant\b|\bcommerce\b|\beconomics\b/i.test(text)) gradField = 'Commerce';
  else if (/\bb\.?sc\b|\bphysics\b|\bchemistry\b|\bstatistics\b|\bbiology\b/i.test(text)) gradField = 'Science';
  else if (/\bb\.?a\b|\barts\b|\bhumanities\b|\bsociology\b|\bhistory\b/i.test(text)) gradField = 'Arts';

  // Category
  let category = 'General';
  if (/\b(nc-?obc|obc-ncl|non-creamy)\b/i.test(text)) category = 'NC-OBC';
  else if (/\b(obc|other\s*backward)\b/i.test(text)) category = 'OBC';
  else if (/\bsc\b|\bscheduled\s*caste\b/i.test(text)) category = 'SC';
  else if (/\bst\b|\bscheduled\s*tribe\b/i.test(text)) category = 'ST';
  else if (/\bews\b|\beconomically\s*weaker\b/i.test(text)) category = 'EWS';

  // CAT percentile
  let catPercentile = 'NA';
  const percentilePatterns = [
    /\b(100(?:\.0+)?|[0-9]{1,2}(?:\.[0-9]{1,2})?)\s*(?:%ile|percentile)\b/i,
    /\bcat\s*[:\-=]?\s*([0-9]{2,3}(?:\.[0-9]{1,2})?)\s*(?:%ile|percentile)/i,
    /percentile\s*(?:of\s*)?([0-9]{2,3}(?:\.[0-9]{1,2})?)\b/i,
    /\b([0-9]{2,3}(?:\.[0-9]{1,2})?)\/\s*[0-9]\/[0-9]\/[0-9]\b/i, // 99.35/9/8/9 format
  ];
  for (const p of percentilePatterns) {
    const m = text.match(p);
    if (m) {
      const val = parseFloat(m[1]);
      if (!isNaN(val) && val >= 50 && val <= 100) { catPercentile = String(val); break; }
    }
  }

  // Work experience (normalised to months)
  let workExperience = 'NA';
  if (/\bfresher\b/i.test(text)) {
    workExperience = '0';
  } else {
    const wexPatterns = [
      /(?:work\s*ex(?:perience)?|wex)\s*(?:of\s*|[:\-=])?\s*(\d+(?:\.\d+)?)\s*(months?|yrs?|years?)/i,
      /(\d+(?:\.\d+)?)\s*months?\s*(?:of\s*)?(?:work\s*ex(?:perience)?|wex)/i,
      /(\d+(?:\.\d+)?)\s*(?:yrs?|years?)\s*(?:of\s*)?(?:work\s*ex(?:perience)?|experience)/i,
    ];
    for (const p of wexPatterns) {
      const m = text.match(p);
      if (m) {
        const num = parseFloat(m[1]);
        const unit = (m[2] ?? 'months').toLowerCase();
        workExperience = unit.startsWith('y') ? String(Math.round(num * 12)) : String(Math.round(num));
        break;
      }
    }
  }

  // Verdict — check last 600 chars first
  let verdict = 'NA';
  const tail = text.slice(-600).toLowerCase();
  const full = text.toLowerCase();
  const checkVerdict = (t: string) => {
    if (/\bconvert(?:ed)?\b/.test(t) && !/\bnot\s+convert/.test(t)) return 'Converted';
    if (/\bwaitlist(?:ed)?\b/.test(t)) return 'Waitlisted';
    if (/\breject(?:ed)?\b/.test(t)) return 'Rejected';
    return null;
  };
  verdict = checkVerdict(tail) ?? checkVerdict(full) ?? 'NA';

  return {
    catPercentile,
    gender,
    gradField,
    category,
    workExperience,
    verdict,
    qna: [],  // regex can't extract Q&A reliably
  };
}

// ---------------------------------------------------------------------------
// Gemini extraction
// ---------------------------------------------------------------------------

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const GEMINI_SYSTEM_PROMPT = `You are a high-precision structured data extractor for IIM interview transcripts posted on Reddit (r/CATpreparation, r/IndiaMBA, etc.).

These posts contain:
1. A PROFILE HEADER (free text, may be unordered, abbreviated, or noisy)
2. A DIALOGUE SECTION (interview Q&A)

Your task is to extract structured data and return ONLY valid JSON (no markdown, no explanation).

-----------------------------------
OUTPUT JSON FORMAT
-----------------------------------
{
  "catPercentile": "<string: e.g. '99.35' or 'NA'>",
  "gender": "<Male | Female | NA>",
  "category": "<General | OBC | NC-OBC | SC | ST | EWS | NA>",
  "gradField": "<Engineer | Commerce | Arts | Science | Medical | Law | NA>",
  "tenthPercent": "<string or 'NA'>",
  "twelfthPercent": "<string or 'NA'>",
  "gradPercent": "<string or 'NA'>",
  "workExperience": "<months as string e.g. '36', '0', or 'NA'>",
  "verdict": "<Converted | Waitlisted | Rejected | NA>",
  "qna": [
    {
      "q": "<normalized interviewer question with label>",
      "a": "<candidate answer>"
    }
  ]
}

-----------------------------------
STRICT EXTRACTION RULES
-----------------------------------

GENERAL:
- Return ONLY JSON. No explanation.
- If any field is missing → return "NA"
- Do NOT infer or hallucinate values

-----------------------------------
PROFILE HEADER EXTRACTION
-----------------------------------

CAT Percentile:
- Extract ONLY the CAT percentile (range: 50–100)
- Ignore sectionals (e.g. 99.35/98/97/96 → take 99.35)
- Accept formats like:
  - "CAT: 99.35"
  - "99.35 percentile"
  - "99.35/9/8/9"

Gender:
- Map:
  - Male → Male
  - Female → Female
- If unclear → NA

Category:
- Normalize to:
  - General, OBC, NC-OBC, SC, ST, EWS
- If "OBC-NCL" → NC-OBC
- If missing → NA

Graduation Field:
Map degrees to:
- Engineer → BTech, BE, IIT, NIT, etc.
- Commerce → BCom, CA, etc.
- Arts → BA, Humanities
- Science → BSc, MSc
- Medical → MBBS, BDS
- Law → LLB
- Else → NA

Academics:
- Extract 10th, 12th, Graduation percentages or CGPA
- Convert CGPA to string as-is (do NOT normalize)
- Accept patterns:
  - "10th: 95%"
  - "X: 9.5 CGPA"
  - "9/8/7 profile"
- Mapping rule for "9/8/7":
  - 10th → 9
  - 12th → 8
  - Grad → 7
- If not present → NA

Work Experience:
- Convert all experience to MONTHS
  - "2 years" → 24
  - "2.5 years" → 30
  - "30 months" → 30
- "Fresher" → 0
- If unclear → NA

-----------------------------------
VERDICT EXTRACTION
-----------------------------------

- Look at:
  - End of post
  - "EDIT:" updates
  - Comments within post
- Normalize:
  - Converted → Converted
  - Waitlisted / WL → Waitlisted
  - Rejected → Rejected
- If not found → NA

-----------------------------------
Q&A EXTRACTION (MOST IMPORTANT)
-----------------------------------

Extract ALL interview dialogue turns.

Interviewer labels include:
- M1, M2, M3
- P1, P2
- F1, F2
- I1, I2
- M, F
- M
- F
- "Interviewer", "Panelist", "Prof", "Professor"
- Numeric (1, 2)
- Mixed formats (e.g. "M1:", "P2 -", "M:")
- Real names or initials (e.g. "Rahul:", "Dr. Singh:", "AB:")

Candidate labels include:
- Me, A, Ans, Candidate, X
- Author's real name

Rules:
- Each Q must be paired with its correct answer
- Preserve sequence strictly
- DO NOT merge multiple Qs into one
- DO NOT skip any Q&A pair

Normalization:
- Prefix each question with interviewer label if identifiable:
  Example:
    "M1: Why MBA?"
- If label unclear → use "Interviewer:"

Answer:
- Capture full answer text until next question starts

Ignore:
- Narration outside Q&A
- Thoughts like "I was nervous"
- Meta commentary

-----------------------------------
ROBUSTNESS RULES
-----------------------------------

- Handle messy formatting:
  - Missing colons
  - Multi-line answers
  - Bullet points
  - Mixed casing
- Do NOT hallucinate missing Q&A
- Do NOT fabricate profile fields

-----------------------------------
FINAL OUTPUT
-----------------------------------

- Return ONLY valid JSON
- Ensure proper escaping of quotes
- Ensure no trailing commas
- CRITICAL: Do NOT escape brackets, underscores, or other characters with backslashes (e.g., use "[text]" NOT "\[text\]")`;

async function callGemini(postText: string): Promise<ExtractedProfile | null> {
  if (!GEMINI_API_KEY) return null;

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: postText.slice(0, 30_000) }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  let waitMs = 2000;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(30_000),
      });

      if (res.status === 429) {
        console.warn(`[Gemini] Rate limited, waiting ${waitMs}ms...`);
        await sleep(waitMs);
        waitMs *= 2;
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        console.warn(`[Gemini] HTTP ${res.status}: ${err.slice(0, 200)}`);
        return null;
      }

      const data = await res.json() as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!raw) return null;

      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned) as ExtractedProfile;

      // Post-process: Unescape any leftover markdown escapes Gemini might have added
      parsed.catPercentile = unescapeMarkdown(parsed.catPercentile);
      parsed.gender = unescapeMarkdown(parsed.gender);
      parsed.category = unescapeMarkdown(parsed.category);
      parsed.gradField = unescapeMarkdown(parsed.gradField);
      parsed.verdict = unescapeMarkdown(parsed.verdict);
      if (Array.isArray(parsed.qna)) {
        parsed.qna = parsed.qna.map(pair => ({
          q: unescapeMarkdown(pair.q),
          a: unescapeMarkdown(pair.a)
        }));
      }

      // Validate minimal shape
      if (typeof parsed !== 'object' || !('verdict' in parsed)) return null;
      if (!Array.isArray(parsed.qna)) parsed.qna = [];

      return parsed;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      const cause = err?.cause ? ` (Cause: ${err.cause})` : '';
      console.warn(`[Gemini] Parse/network error: ${msg}${cause}`);

      // Retry on common transient network errors
      if (attempt < 3 && (msg.includes('fetch failed') || msg.includes('timeout') || err.name === 'AbortError')) {
        console.log(`[Gemini] Retrying transient error (attempt ${attempt + 1})...`);
        await sleep(waitMs);
        waitMs *= 2;
        continue;
      }
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Reddit & PullPush fetching helpers
// ---------------------------------------------------------------------------

async function redditFetch(url: string): Promise<unknown> {
  if (redditCircuitOpen) {
    throw new RedditRateLimitedError(`[Reddit] Circuit open, skipping ${url}`);
  }
  let waitMs = 3000;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': REDDIT_UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      redditConsecutive429 = 0; // success — reset counter
      return res.json();
    }
    if (res.status === 429) {
      redditConsecutive429++;
      if (redditConsecutive429 >= REDDIT_CIRCUIT_429_THRESHOLD) {
        redditCircuitOpen = true;
        console.warn(`[Reddit] Circuit opened after ${redditConsecutive429} consecutive 429s. Falling back to PullPush-only mode.`);
        throw new RedditRateLimitedError(`Circuit opened — ${url}`);
      }
      if (attempt === MAX_RETRIES) throw new Error(`Reddit still 429 after ${MAX_RETRIES} retries — ${url}`);
      console.warn(`[Reddit] 429 — waiting ${waitMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(waitMs);
      waitMs *= 2;
      continue;
    }
    throw new Error(`Reddit HTTP ${res.status} — ${url}`);
  }
  throw new Error('Reddit fetch failed after retries');
}

async function redditSearch(
  query: string,
  after?: string,
): Promise<{ posts: RedditPost[]; after?: string }> {
  const p = new URLSearchParams({
    q: query, restrict_sr: '1', sort: 'new', limit: '100', t: 'all', type: 'link', raw_json: '1',
  });
  if (after) p.set('after', after);
  const data = await redditFetch(
    `https://www.reddit.com/r/CATpreparation/search.json?${p}`,
  ) as { data?: { children?: { data: RedditPost }[]; after?: string } };
  return {
    posts: data?.data?.children?.map(e => e.data) ?? [],
    after: data?.data?.after ?? undefined,
  };
}

async function redditSubredditPage(
  sort: 'new' | 'top',
  after?: string,
): Promise<{ posts: RedditPost[]; after?: string }> {
  const p = new URLSearchParams({ limit: '100', t: 'all', raw_json: '1' });
  if (after) p.set('after', after);
  const data = await redditFetch(
    `https://www.reddit.com/r/CATpreparation/${sort}.json?${p}`,
  ) as { data?: { children?: { data: RedditPost }[]; after?: string } };
  return {
    posts: data?.data?.children?.map(e => e.data) ?? [],
    after: data?.data?.after ?? undefined,
  };
}

/** PullPush — community Pushshift mirror for historical data */
async function pullpushSearch(
  query: string,
  before?: number,
): Promise<RedditPost[]> {
  try {
    const p = new URLSearchParams({
      subreddit: 'CATpreparation',
      q: query,
      size: '100',
      sort: 'desc',
      sort_type: 'created_utc',
    });
    if (before) p.set('before', String(before));
    const res = await fetch(`https://api.pullpush.io/reddit/search/submission/?${p}`, {
      headers: { 'User-Agent': REDDIT_UA },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: RedditPost[] };
    return data?.data ?? [];
  } catch {
    // PullPush is unreliable — silently fall back
    return [];
  }
}

// ---------------------------------------------------------------------------
// Collect all candidate posts
// ---------------------------------------------------------------------------

async function collectCandidatePosts(): Promise<RedditPost[]> {
  const all = new Map<string, RedditPost>();

  const add = (posts: RedditPost[]) => posts.forEach(p => p.id && all.set(p.id, p));

  // ── 1. Browse subreddit new/top ───────────────────────────────────────────
  if (!redditCircuitOpen) {
    for (const sort of ['new', 'top'] as const) {
      let after: string | undefined;
      for (let page = 0; page < 8; page++) {
        console.log(`[Collect] r/CATpreparation ${sort} page ${page + 1}/8`);
        try {
          const { posts, after: next } = await redditSubredditPage(sort, after);
          const filtered = posts.filter(p => isPotentialTranscriptTitle(p.title ?? ''));
          if (posts.length > filtered.length) {
            console.log(`[Collect] Filtered ${posts.length - filtered.length} noisy posts from page`);
          }
          add(filtered);
          if (!next) break;
          after = next;
        } catch (err) {
          console.warn(`[Collect] Listing failed: ${err instanceof Error ? err.message : err}`);
          break;
        }
        await sleep(REDDIT_DELAY_MS);
      }
    }
  } else {
    console.warn('[Collect] Skipping Reddit listing phase due to active rate-limit circuit.');
  }

  // ── 2. Targeted Reddit search queries ─────────────────────────────────────
  // Dynamically generate search queries for all supported colleges
  const searchQueries: string[] = [];
  for (const c of SUPPORTED_COLLEGES) {
    const mainAlias = c.aliases[0] || c.name;
    const shortAlias = c.id.toUpperCase(); // e.g., IIMA, IIMB, XLRI
    searchQueries.push(`${c.name} interview transcript`);
    searchQueries.push(`${shortAlias} interview transcript`);
    searchQueries.push(`${mainAlias} pi transcript`);
    searchQueries.push(`${shortAlias} pi experience`);
    searchQueries.push(`${c.name} gdpi experience`);
    searchQueries.push(`${c.name} interview experience`);
    searchQueries.push(`${shortAlias} transcript`);
    searchQueries.push(`${shortAlias} Detailed Transcript`);
    searchQueries.push(`My ${c.name} Interview Transcript`);
    searchQueries.push(`${shortAlias} Interview Experience`);
  }
  
  // Deduplicate and filter empty queries
  const uniqueSearchQueries = [...new Set(searchQueries)].filter(Boolean);

  if (!redditCircuitOpen) {
    for (const query of uniqueSearchQueries) {
      if (redditCircuitOpen) {
        console.warn('[Collect] Stopping Reddit search phase due to active rate-limit circuit.');
        break;
      }
      try {
        let after: string | undefined;
        for (let page = 0; page < 3; page++) {
          console.log(`[Collect] Reddit search: "${query}" page ${page + 1}`);
          const { posts, after: next } = await redditSearch(query, after);
          add(posts);
          if (!next) break;
          after = next;
          await sleep(REDDIT_DELAY_MS);
        }
      } catch (err) {
        console.warn(`[Collect] Reddit search failed: "${query}" — ${err instanceof Error ? err.message : err}`);
      }
      await sleep(REDDIT_DELAY_MS);
    }
  } else {
    console.warn('[Collect] Skipping Reddit search phase due to active rate-limit circuit.');
  }

  // ── 3. PullPush historical search ─────────────────────────────────────────
  const pullpushQueries: string[] = [];
  for (const c of SUPPORTED_COLLEGES) {
    const shortAlias = c.id.toUpperCase();
    pullpushQueries.push(`${shortAlias} interview transcript`);
    pullpushQueries.push(`${c.name} interview`);
    pullpushQueries.push(`${shortAlias} pi transcript`);
    pullpushQueries.push(`${c.name} interview experience`);
    pullpushQueries.push(`${shortAlias.toLowerCase()} gdpi`);
    pullpushQueries.push(`${c.name} transcript`);
  }
  const uniquePullpushQueries = [...new Set(pullpushQueries)].filter(Boolean);

  console.log('[Collect] Fetching historical data via PullPush...');
  for (const query of uniquePullpushQueries) {
    const posts = await pullpushSearch(query);
    if (posts.length) {
      console.log(`[Collect] PullPush "${query}": ${posts.length} posts`);
      add(posts);
    }
    await sleep(800);
  }

  // ── 4. Explicit URLs (manual seeds) ───────────────────────────────────────
  for (const rawUrl of ADDITIONAL_REDDIT_URLS) {
    try {
      const permalink = new URL(rawUrl).pathname.replace(/\/+$/, '');
      const jsonUrl = `https://www.reddit.com${permalink}.json?limit=1`;
      // Bypass circuit breaker for explicit seeds — use fetch directly
      const res = await fetch(jsonUrl, {
        headers: { 'User-Agent': REDDIT_UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        console.warn(`[Collect] Seed URL HTTP ${res.status}: ${rawUrl}`);
        continue;
      }
      const data = await res.json() as unknown[];
      const post = (data?.[0] as { data?: { children?: { data?: RedditPost }[] } })
        ?.data?.children?.[0]?.data;
      if (post?.id) {
        all.set(post.id, post);
        console.log(`[Collect] Seed URL added: ${post.id}`);
      }
    } catch (err) {
      console.warn(`[Collect] Seed URL failed: ${rawUrl} — ${err instanceof Error ? err.message : err}`);
    }
    await sleep(800);
  }

  console.log(`[Collect] Total unique candidate posts: ${all.size}`);
  return [...all.values()];
}

// ---------------------------------------------------------------------------
// Fetch full post text (Reddit search often returns empty selftext)
// ---------------------------------------------------------------------------

async function fetchFullPost(permalink: string): Promise<string> {
  if (redditCircuitOpen) return '';
  try {
    const url = `https://www.reddit.com${permalink}.json?limit=1&raw_json=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': REDDIT_UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 429) {
      // Open circuit immediately — don't retry hydration calls
      redditConsecutive429++;
      if (redditConsecutive429 >= REDDIT_CIRCUIT_429_THRESHOLD) {
        redditCircuitOpen = true;
        console.warn('[Reddit] Circuit opened during hydration. Skipping all further Reddit fetches.');
      }
      return '';
    }
    if (!res.ok) return '';
    const data = await res.json() as unknown[];
    const selftext = (data?.[0] as { data?: { children?: { data?: { selftext?: string } }[] } })
      ?.data?.children?.[0]?.data?.selftext ?? '';
    redditConsecutive429 = 0; // reset on success
    return selftext;
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

/** Unique key for deduplication — prefer Reddit post ID over content hash */
function postKey(postId: string): string {
  return `reddit:${postId}`;
}

async function saveTranscript(
  collegeId: string,
  post: RedditPost,
  profile: ExtractedProfile,
): Promise<boolean> {
  const title = unescapeMarkdown((post.title ?? '').trim());
  const selftext = unescapeMarkdown((post.selftext ?? '').trim());
  const fullText = `${title}\n\n${selftext}`;
  const key = postKey(post.id);

  // Deduplicate: if we've already stored this Reddit post, skip
  const exists = await prisma.transcript.findFirst({
    where: { contactInfo: key },
  });
  if (exists) return false;

  const created = await prisma.transcript.create({
    data: {
      collegeId,
      category: profile.category || 'General',
      gradField: profile.gradField || 'NA',
      gender: profile.gender || 'NA',
      catPercentile: profile.catPercentile || 'NA',
      workExperience: profile.workExperience || 'NA',
      panelSize: 2,
      date: post.created_utc ? new Date(post.created_utc * 1000) : new Date(),
      verdict: profile.verdict || 'NA',
      anonymous: true,
      contactInfo: key,   // used as dedup key
      fullText,
    },
  });

  // Save Q&A pairs extracted by Gemini
  if (profile.qna.length > 0) {
    await prisma.questionAnswer.createMany({
      data: profile.qna
        .filter(pair => pair.q?.trim() && pair.a?.trim())
        .map(pair => ({
          q: pair.q.trim(),
          a: pair.a.trim(),
          transcriptId: created.id,
        })),
    });
  }

  return true;
}

function hasValidSavedTranscriptShape(fullText: string, profile: ExtractedProfile) {
  const turns = interviewerTurnCount(fullText);
  if (turns < MIN_INTERVIEWER_TURNS) return false;

  // Prefer LLM-extracted QnA density for final quality gate.
  if ((profile.qna ?? []).filter(pair => pair.q?.trim() && pair.a?.trim()).length >= MIN_QNA_PAIRS) {
    return true;
  }

  // Regex fallback path: require rich metadata + interviewer turns.
  const hasProfileFields =
    profile.catPercentile !== 'NA'
    || profile.workExperience !== 'NA'
    || profile.gradField !== 'NA';
  return hasProfileFields && turns >= MIN_INTERVIEWER_TURNS + 1;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function startScraping() {
  console.log('='.repeat(60));
  console.log(' MBAUnlocked — IIM-A & IIM-B Transcript Scraper');
  console.log('='.repeat(60));
  console.log(`[Config] Gemini: ${GEMINI_API_KEY ? '✅ enabled (Flash free tier)' : '❌ disabled — regex only'}`);
  console.log(`[Config] Reset DB: ${RESET_BEFORE_SCRAPE}`);

  if (RESET_BEFORE_SCRAPE) {
    console.log('[DB] Clearing previously scraped data...');
    await prisma.questionAnswer.deleteMany();
    await prisma.transcript.deleteMany({ where: { contactInfo: { startsWith: 'reddit:' } } });
    console.log('[DB] Done.');
  }

  // ── Auto-Cleanup Blacklisted ──────────────────────────────────────────────
  await cleanupBlacklistedTranscripts();

  // ── Collect ────────────────────────────────────────────────────────────────
  const candidates = await collectCandidatePosts();

  // ── Filter → detect → extract → save ──────────────────────────────────────
  const counts = {
    filtered: 0,
    noCollege: 0,
    geminiUsed: 0,
    saved: 0,
    rejectedQuality: 0,
    byCollege: Object.fromEntries(SUPPORTED_COLLEGES.map(c => [c.id, 0]))
  };

  for (const post of candidates) {
    const title = (post.title ?? '').trim();
    let selftext = (post.selftext ?? '').trim();

    // Hydrate full body for posts where listing/search payload is truncated/empty.
    if (selftext.length < MIN_CHARS && post.permalink) {
      const fetched = (await fetchFullPost(post.permalink)).trim();
      if (fetched.length > selftext.length) {
        selftext = fetched;
        post.selftext = fetched;
      }
    }

    // ── Gate 1: candidate filter ────────────────────────────────────────────
    if (isBlacklisted(title)) {
      console.log(`[Blacklist] Skip: ${title.slice(0, 50)}...`);
      continue;
    }
    if (!isLikelyTranscript(title, selftext)) continue;
    counts.filtered++;

    // ── Gate 2: college detection ────────────────────────────────────────────
    const fullBody = selftext;
    const collegeId = detectCollege(title, fullBody);
    if (!collegeId) { counts.noCollege++; continue; }

    const postText = `Title: ${title}\n\n${fullBody}`;

    // ── Gate 2.5: Deduplicate early to save Gemini API calls ─────────────────
    const key = postKey(post.id);
    const exists = await prisma.transcript.findFirst({
      where: { contactInfo: key },
    });
    if (exists) {
      console.log(`[Skip] Already in DB: ${post.id} — ${title.slice(0, 40)}`);
      continue; // Skip already processed posts to save time
    }

    // ── Gate 3: Gemini extraction (ALWAYS for candidates) ────────────────────
    let profile: ExtractedProfile;

    const geminiResult = await callGemini(postText);
    if (geminiResult) {
      profile = geminiResult;
      counts.geminiUsed++;
      console.log(
        `[Gemini] ✅ [${collegeId}] verdict=${profile.verdict} qna=${profile.qna.length}q — ${title.slice(0, 60)}`,
      );
      await sleep(GEMINI_DELAY_MS);
    } else {
      profile = regexExtractProfile(postText, collegeId);
      console.log(
        `[Regex] [${collegeId}] verdict=${profile.verdict} — ${title.slice(0, 60)}`,
      );
    }

    // ── Gate 4: validation (light check after extraction) ───────────────────
    if (!hasValidSavedTranscriptShape(postText, profile)) {
      // If title is strong, we should save even if extraction found nothing
      // We no longer require dialogue turns if the title is strong.
      if (isStrongTitle(title)) {
        console.log(`[Save/StrongTitle] [${collegeId}] keeping because title is high-confidence — ${title.slice(0, 70)}`);
      } else {
        counts.rejectedQuality++;
        console.log(`[Skip] [${collegeId}] weak transcript shape/no dialogue — ${title.slice(0, 70)}`);
        continue;
      }
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    try {
      if (await saveTranscript(collegeId, post, profile)) {
        counts.saved++;
        if (counts.byCollege[collegeId] !== undefined) {
          counts.byCollege[collegeId]++;
        } else {
          counts.byCollege[collegeId] = 1;
        }
        console.log(`[Saved] [${collegeId}] #${counts.saved}`);
      }
    } catch (err) {
      console.warn(`[Save] Failed for ${post.id}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(' Scraping Complete');
  console.log('='.repeat(60));
  console.log(`  Candidates collected : ${candidates.length}`);
  console.log(`  Passed quality gate  : ${counts.filtered}`);
  console.log(`  College not detected : ${counts.noCollege}`);
  console.log(`  Gemini extractions   : ${counts.geminiUsed}`);
  console.log(`  Rejected by quality  : ${counts.rejectedQuality}`);
  console.log(`  Total saved          : ${counts.saved}`);
  for (const [colId, count] of Object.entries(counts.byCollege)) {
    if (count > 0) {
      console.log(`  └─ ${colId.toUpperCase().padEnd(16)} : ${count}`);
    }
  }
  console.log('='.repeat(60));
}

startScraping()
  .catch(err => { console.error('[Fatal]', err); process.exit(1); })
  .finally(() => prisma.$disconnect());