import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SEED_URL = "https://www.reddit.com/r/CATpreparation/comments/1qyk9jn/iim_ahemdabad_interview_transcript/";
const REDDIT_UA = 'mbaunlocked-scraper/1.0 (educational project)';

const GEMINI_SYSTEM_PROMPT = `You are a structured data extractor for IIM interview transcripts posted on Reddit India.

These posts are in a dialogue format where interviewers are labelled M1, M2, P1, P2 etc. and the candidate is labelled "Me" or "A" or "X".

Extract the following and return ONLY valid JSON — no markdown fences, no commentary.

JSON shape:
{
  "catPercentile": "<CAT percentile as string e.g. '99.35', or 'NA'>",
  "gender": "<Male | Female | NA>",
  "gradField": "<Engineer | Commerce | Arts | Science | Medical | Law | NA>",
  "category": "<General | OBC | NC-OBC | SC | ST | EWS>",
  "workExperience": "<total months as string e.g. '54' for 4.5 years, or '0' for fresher, or 'NA'>",
  "verdict": "<Converted | Waitlisted | Rejected | NA>",
  "qna": [
    { "q": "<interviewer question — attribute to M1/M2/P1/P2 if clear>", "a": "<candidate answer>" }
  ]
}

Rules:
- The profile header (before dialogue starts) contains: percentile, gender, category, B.tech/degree, workex years.
- Extract ALL M1/M2/P1/P2 question-answer dialogue turns — do not skip any.
- workExperience: convert years to months (e.g. 4.5 years = 54 months). Fresher = '0'.
- catPercentile: must be 50–100 range. Look for patterns like '99.35' or '99.35/ 9/8/9' (only first number is percentile).
- verdict: look at end of post for 'converted', 'waitlisted', 'rejected', or in a comment like 'EDIT: Converted'.
- category: look for NC-OBC, OBC, SC, ST, EWS, General. NC-OBC is a subtype of OBC — store as 'NC-OBC'.
- Return ONLY the JSON object.`;

async function run() {
  console.log("Processing Seed URL:", SEED_URL);

  const title = "IIM Ahemdabad interview transcript";
  const selftext = `07/02/26, Mumbai 

Profile - NCOBC Engineer Male, 99.35/ 9/8/9

B.tech - Mechanical form Old iits 

Workex - Around 4.5 years

AWT  - International artists and performers should not come to India as the management and audience are not good.  
Strength and weaken the argument

interview experience - coversational and grilling slightly, question answered type mainly.

Time - 20mins

M1 and M2 panelist ( both 35-40 years old)

Me - Good afternoon 

M1 - Good afternoon take a seat

M1 - why pgp, not pgpx. Gave some supportive arguments for pgpx then asked me to start.

Me - answered about details and systematic learning.

M1 - interrupted said very generic answer and more time never mean more learning.

Me - talk about summer internship and opportunities to explore other industries also apart from automobiles then i can decide which one beat fit for me. also mentioned about batch strength % with 3+ experience.

M1 - 20% is more than 3 years, but you have more than 4

Me - taklked about breakup of 20 per as cat exam happen once in year so chances are very distribution will be like 12 per and 8 per. It will be not like most of 20% less than 4 years.

M1- but you can pivot your role in pgpx course also, do you know anyone who have competed pgpx from IIM A, what is their feedback 

Me - he said pgpx it is possible to pivot you have to have very strong profile as you have to compete with people with workex larger range otherwise mostly you will be in same domain.

M1 - do you know any pgp students who have more workex 

Me - yes, he is from Bajaj auto joined iimA after 5 year worex, have also completed m.tech, joining intern at McKinsey.

M1 - you have to start from zero

Me - yes, i will recover quickly as growth will be faster and will reach in leadership role in 10 years.

M1 - what will be your designation and growth if you workin current organization for next 10 years.

Me - talked about company internal hierarchy and i will be at manager only after 10-15 years will be doing same execution type of task, similar to.other manager are doing. As in my company very lean hierarchy ex - execution, Lx - leaders. Head - platform, CTO.. He was surprised after seeing only few hierarchy.

M2 - tell me about market leader in 2W industry.

Me - Initially tried to answer wrt to.my project  with cc wise but then he asked about my company market share. Then i answered hero ans mentioned, it dominant is mainly in commuter segment. For higher cc royal Enfield and for higher cc sports mentioned about ktm.

M2 - due to ev revolution. Craze for E bicycle is increasing in Europe do you think bicycle will take motorcycle in india also

Me - answered bicycle will not take, but motorcycle will be replaced with scooter for commuter purpose and women can also ride. Trend for higher cc bike is rising in india so both will be there but commuter will be replaced by ev scooter instead of bicycle. ( Could have answered in better, didn't think in depth about bicycle its customer in india).

M2 - hobbies 

Me - Playing and watching cricket 

M2 - state or national player you have

Me - no

M2 - Is cricket included in Olympics 

Me - yes from next Olympics, t20 format

M2 - why it was not included before 

Me - gave very vague,. illogical answer. He countered with another sports,.I said don't know sir.

M2 - tell me the sportsperson who won medal for india

Me - Neeraj Chopra 

M2 - which medal and in which sports 

Me - silver, last Olympics and gold before that. Javelin throw

Me - who won gold

Me - i am not able to recall the name. But he is from Pakistan.

M1 - so you are from Bihar, tell me some famous kingdom and its king

Me - Mauryan empire, Ashoka the great 

M1 - was he the first king of Mauryan empy

Me - no. Chandragupta Maurya 

M1 - unique about Mauryan empire, he gave hint like, did Chandragupta get his throne from Ancestors 

Me - no, Chankanya identified a boy. Returned to Magadh and conquered and become king.

M1 and M2 - we are done, any questions for us

M1 and M2 - it was nice to talk with you with smile asked me to take toffees.

Overall it was good experience.`;
  
  const postId = "1qyk9jn";
  const postText = `Title: ${title}\n\n${selftext}`;

  console.log("Calling Gemini for extraction...");
  
  const geminiRes = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: postText }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    console.error("Gemini API failed:", err);
    return;
  }

  const geminiData = await geminiRes.json();
  const rawJson = geminiData.candidates[0].content.parts[0].text;
  const profile = JSON.parse(rawJson);

  console.log("Extracted Profile:", JSON.stringify(profile, null, 2));

  // Save to DB
  console.log("Saving to Database...");
  
  // Clear previous if exists
  await prisma.questionAnswer.deleteMany({
    where: { transcript: { contactInfo: `reddit:${postId}` } }
  });
  await prisma.transcript.deleteMany({
    where: { contactInfo: `reddit:${postId}` }
  });

  const created = await prisma.transcript.create({
    data: {
      collegeId: 'iima',
      category: profile.category || 'General',
      gradField: profile.gradField || 'NA',
      gender: profile.gender || 'NA',
      catPercentile: profile.catPercentile || 'NA',
      workExperience: profile.workExperience || 'NA',
      panelSize: 2,
      date: new Date(), // Hardcoded for test
      verdict: profile.verdict || 'NA',
      anonymous: true,
      contactInfo: `reddit:${postId}`,
      fullText: postText,
      questions: {
        create: profile.qna.map((qna: any) => ({
          q: qna.q,
          a: qna.a
        }))
      }
    }
  });

  console.log("Saved Transcript ID:", created.id);
  console.log("Done!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
