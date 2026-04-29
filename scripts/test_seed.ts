import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyB_tOlxnwAg6mSnXCISqAI2yO5w-jNQlG0";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(text: string): Promise<any> {
  const systemPrompt = `You are a structured data extractor for IIM interview transcripts.
Return ONLY valid JSON.
Fields: catPercentile (string), gender (Male/Female/NA), category (General/OBC/NC-OBC/SC/ST/EWS/NA), 
gradField (Engineer/Commerce/Arts/Science/Medical/Law/NA), workExperience (months as string), 
verdict (Converted/Waitlisted/Rejected/NA), 
qna: array of {q: string, a: string}.

Rules:
- Extract ALL M1/M2/P1/P2 question-answer dialogue turns.
- workExperience: convert years to months (e.g. 2.5 years = 30). Fresher = 0.`;

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API failed: ${err}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(raw);
}

async function run() {
  const title = "IIM Ahmedabad PGP Interview Transcript";
  const selftext = `
Profile: 99.35/9/8/9, NC-OBC, Male, Engineer.
Workex: 54 months.

Interviewers: M1 and M2.

M1: Why MBA?
Me: Answered about leadership and management skills.
M1: But you have 4.5 years of experience. Why not PGPX?
Me: Explained the desire for a 2-year immersive program and diverse cohort.
M2: Tell me about market leader in 2W industry.
Me: Hero MotoCorp in commuter, Royal Enfield in mid-size.

Verdict: Converted.
  `;

  console.log("Processing hardcoded seed...");
  const extracted = await callGemini(`Title: ${title}\n\n${selftext}`);
  console.log("Extracted Data:", JSON.stringify(extracted, null, 2));

  // Save to DB
  const postId = "test_seed_123";
  await prisma.questionAnswer.deleteMany({ where: { transcript: { contactInfo: `reddit:${postId}` } } });
  await prisma.transcript.deleteMany({ where: { contactInfo: `reddit:${postId}` } });

  const created = await prisma.transcript.create({
    data: {
      collegeId: 'iima',
      category: extracted.category || 'General',
      gradField: extracted.gradField || 'NA',
      gender: extracted.gender || 'NA',
      catPercentile: extracted.catPercentile || 'NA',
      workExperience: extracted.workExperience || 'NA',
      panelSize: 2,
      date: new Date(),
      verdict: extracted.verdict || 'NA',
      anonymous: true,
      contactInfo: `reddit:${postId}`,
      fullText: `${title}\n\n${selftext}`,
      questions: {
        create: extracted.qna?.map((q: any) => ({ q: q.q, a: q.a })) || []
      }
    }
  });

  console.log("Test Seed Saved ID:", created.id);
  console.log("Success!");
}

run().catch(console.error).finally(() => prisma.$disconnect());