import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add targeted subreddits or API endpoints here
const DATA_SOURCES = [
  'https://www.reddit.com/r/CATpreparation/search.json?q=transcript&restrict_sr=1&sort=new',
  // You can easily plug in a pagalguy, insideiim API endpoint or a completely generic fetching proxy below in the future.
];

// Helper to use rough Regex guessing for structured fields based on raw texts from the internet
function parseRawBody(text: string) {
  const profileMatch = text.match(/(GEM|GEF|GNEM|GNEF|\d{1,2}\/\d{1,2}\/\d{1,2})/i);
  let category = 'General';
  let gender = 'Non-binary';
  let gradField = 'Other';

  if (profileMatch) {
    const p = profileMatch[0].toUpperCase();
    if (p.includes('M')) gender = 'Male';
    if (p.includes('F')) gender = 'Female';
    if (p.includes('E')) gradField = 'Engineer';
  }

  const percentileMatch = text.match(/9\d\.\d{1,2}/);
  const catPercentile = percentileMatch ? parseFloat(percentileMatch[0]) : 95.0;

  let collegeId = 'iima'; // Fallback
  if (text.toLowerCase().includes('bangalore') || text.toLowerCase().includes('iimb')) collegeId = 'iimb';
  if (text.toLowerCase().includes('calcutta') || text.toLowerCase().includes('iimc')) collegeId = 'iimc';
  if (text.toLowerCase().includes('fms')) collegeId = 'fms';

  const verdictMatch = text.match(/(converted|waitlisted|rejected)/i);
  let verdict = 'Unknown';
  if (verdictMatch) {
    verdict = verdictMatch[0].charAt(0).toUpperCase() + verdictMatch[0].slice(1).toLowerCase();
  }

  // Very naive Q&A extraction - trying to grab sentences ending with ? and the immediate sentence after.
  const qs = text.match(/([^\.?!]+)\?/g) || [];
  const questionsPart = qs.slice(0, 4).map(q => ({
    q: q.trim(),
    a: 'Data abstracted automatically from forum context.' // Due to complexity of unstructured forums, full extraction of 'A' usually requires LLMs
  }));

  return { category, gender, gradField, catPercentile, collegeId, verdict, questionsPart };
}


async function scrapeReddit(url: string) {
  console.log(`[Scrape] Fetching from Reddit: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const data = await response.json();
    const posts = data.data.children;
    console.log(`[Scrape] Sourced ${posts.length} potential transcripts.`);

    for (const post of posts) {
      const { title, selftext, author } = post.data;
      
      // Filter out posts that don't have enough text to be a transcript
      if (!selftext || selftext.length < 300) continue;
      
      const parsed = parseRawBody(`${title} ${selftext}`);

      if (parsed.questionsPart.length === 0) {
        parsed.questionsPart.push({ q: "What was your interview experience like?", a: "See the original poster's full Reddit response." })
      }

      await prisma.transcript.create({
        data: {
          collegeId: parsed.collegeId,
          category: parsed.category,
          gradField: parsed.gradField,
          gender: parsed.gender,
          catPercentile: parsed.catPercentile,
          panelSize: 2,
          date: new Date(),
          verdict: parsed.verdict,
          anonymous: false,
          contactInfo: `reddit.com/u/${author}`,
          questions: {
            create: parsed.questionsPart
          }
        }
      });
      console.log(`[Scrape] ✅ Inserted Transcript from ${author}`);
    }

  } catch (err: any) {
    console.error(`[Scrape] Failed to scrape:`, err.message);
  }
}

async function startScraping() {
  console.log('--- Initiating Global Mined Transcript Pipeline ---');
  for (const source of DATA_SOURCES) {
    if (source.includes('reddit.com')) {
      await scrapeReddit(source);
    } else {
      // You can add parseQuora(source), parseInsideIIM(source), etc here.
      console.log(`[Scrape] Target source domain unrecognized for direct API fetch: ${source}`);
    }
  }
  console.log('--- Scraping Complete ---');
}

startScraping()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
