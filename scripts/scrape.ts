import { PrismaClient } from '@prisma/client';
import { COLLEGES } from '../src/lib/data'; // Import dynamic colleges list

const prisma = new PrismaClient();

// Helper to use rough Regex guessing for structured fields
function parseRawBody(text: string, fallbackCollegeId: string) {
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

  const verdictMatch = text.match(/(converted|waitlisted|rejected)/i);
  let verdict = 'Unknown';
  if (verdictMatch) {
    verdict = verdictMatch[0].charAt(0).toUpperCase() + verdictMatch[0].slice(1).toLowerCase();
  }

  return { category, gender, gradField, catPercentile, collegeId: fallbackCollegeId, verdict };
}

async function scrapeRedditForCollege(collegeId: string, queryStr: string) {
  const url = `https://www.reddit.com/r/CATpreparation/search.json?q=${encodeURIComponent(queryStr)}&restrict_sr=1&sort=new&limit=15`;
  console.log(`[Scrape] Fetching from Reddit for ${collegeId}: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const data = await response.json();
    const posts = data.data.children;
    console.log(`[Scrape] ${collegeId}: Sourced ${posts.length} potential transcripts.`);

    for (const post of posts) {
      const { title, selftext, author } = post.data;
      
      // Filter out posts that don't have enough text
      if (!selftext || selftext.length < 300) continue;
      
      const parsed = parseRawBody(`${title} ${selftext}`, collegeId);

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
          fullText: `${title}\n\n${selftext}`
        }
      });
      console.log(`[Scrape] ✅ Inserted Transcript from ${author}`);
    }
  } catch (err: any) {
    console.error(`[Scrape] Failed to scrape ${collegeId}:`, err.message);
  }
}

async function startScraping() {
  console.log('--- Initiating Global Mined Transcript Pipeline ---');
  
  // Wipe current to refresh logic
  console.log('Clearing old entries to reflect dynamic global fetch...');
  await prisma.questionAnswer.deleteMany();
  await prisma.transcript.deleteMany();

  // Loop dynamically through all COLLEGES exported by the app
  for (const college of COLLEGES) {
    const searchString = `${college.name} transcript`; // e.g., "IIM Bangalore transcript"
    await scrapeRedditForCollege(college.id, searchString);
    // Add artificial delay to avoid hitting Reddit Rate Limits
    await new Promise(resolve => setTimeout(resolve, 2000));
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
