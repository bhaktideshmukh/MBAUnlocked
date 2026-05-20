import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collegeId, category, gradField, gender, workEx, location, familyBackground, targetCollege, sop } = body;

    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId is required' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const rateLimit = await prisma.ipRateLimit.upsert({
      where: { ip },
      update: {},
      create: { ip }
    });

    // Rate Limiting Logic: 3 per day per IP
    const now = new Date();
    const lastReset = rateLimit.lastResetAt;
    const isSameDay = now.toDateString() === lastReset.toDateString();

    let currentGenerations = isSameDay ? rateLimit.generations : 0;

    if (currentGenerations >= 3) {
      console.log('AI Rate limit reached for IP:', ip);
      return NextResponse.json({
        limitReached: true,
        questions: [
          "Tell me about yourself and walk me through your resume.",
          `Why do you want to join ${targetCollege}?`,
          `How does your background in ${gradField || 'your field'} help you in an MBA?`,
          "Can you explain a time you faced a difficult challenge at work or in college?",
          "Where do you see yourself in 5 years?",
          "Why MBA and why now?",
          "Who is the current CEO of the company you work for, and what are their major challenges?",
          "What is your opinion on the recent economic policies in India?"
        ]
      });
    }

    // 1. Profile Caching
    // Create a deterministic hash/string of the profile to check if we already generated questions for this exact profile.
    const profileString = `${collegeId}_${category}_${body.catPercentile}_${body.ugCollege}_${gradField}_${body.stream}_${body.academicScores}_${gender}_${workEx}_${body.companyName}_${sop}`.toLowerCase().replace(/\s+/g, '');

    // Simple hash function (or just use the string if it's small enough, but let's hash it)
    const crypto = require('crypto');
    const profileHash = crypto.createHash('sha256').update(profileString).digest('hex');

    const cachedPrediction = await prisma.aiPredictionCache.findUnique({
      where: { profileHash }
    });

    if (cachedPrediction) {
      console.log('Serving from AI Cache!', profileHash);
      return NextResponse.json({ questions: cachedPrediction.questions });
    }

    // Fetch some recent questions for context
    const previousTranscripts = await prisma.transcript.findMany({
      where: { collegeId },
      include: { questions: true },
      take: 5,
      orderBy: { date: 'desc' }
    });

    let contextQuestions = '';
    if (previousTranscripts.length > 0) {
      const allQs = previousTranscripts.flatMap(t => t.questions.map(q => q.q));
      // Shuffle and pick 15
      const selectedQs = allQs.sort(() => 0.5 - Math.random()).slice(0, 15);
      contextQuestions = `Here are some actual past interview questions from ${targetCollege} for context:\n- ` + selectedQs.join('\n- ');
    }

    const systemPrompt = `You are a highly experienced MBA Interview Panelist for ${targetCollege}.
Your task is to generate 8-10 highly probable, challenging interview questions tailored precisely to the candidate's profile.

CRITICAL INSTRUCTIONS FOR QUESTION MIX:
1. Academic Deep-Dive (2-3 Qs): Ask rigorous questions based on their Undergraduate Stream/Major (${gradField} / ${body.stream}). If they are engineers, ask application-based tech questions; if commerce, ask finance/econ questions.
2. Work Experience / Internships (2-3 Qs): If they have work experience (${workEx}), ask highly specific situational questions about their industry or company (${body.companyName}).
3. SOP / Application Answers (1-2 Qs): If provided, challenge their stated goals and motivations in their Statement of Purpose.
4. Current Affairs / General Awareness (1-2 Qs): Ask about recent global or Indian economic/business news relevant to their background or the MBA.
5. HR & Out-of-the-box (1-2 Qs): Ask behavioral, ethical dilemmas, or curveball questions designed to test their presence of mind.
6. Questions on family background and location / hobbies / extracurriculars / interests (1-2 Qs)
7. Core MBA subject questions: Finance, Marketing, Organizational Behavior, Operations, Economics, and Strategy (2 Qs)

Candidate Profile:
- Target College: ${targetCollege}
- Category: ${category || 'NA'}
- CAT Percentile: ${body.catPercentile || 'NA'}
- Undergrad College: ${body.ugCollege || 'NA'}
- Graduation Field / Stream: ${gradField || 'NA'} (${body.stream || 'NA'})
- Past Academic Scores (10th/12th/Grad): ${body.academicScores || 'NA'}
- Gender: ${gender || 'NA'}
- Work Experience: ${workEx || 'NA'} (Company: ${body.companyName || 'NA'})
- Hometown/Location: ${location || 'NA'}
- Family Background: ${familyBackground || 'NA'}
- Statement of Purpose (SOP) snippets: ${sop || 'Not provided'}

CONTEXT FROM PAST TRANSCRIPTS:
Below are actual past interview questions asked at ${targetCollege}. You MUST analyze the stylistic patterns, difficulty level, and typical topics from these past questions, and ensure your generated questions match this exact level of rigor and style.
${contextQuestions}

Return ONLY a valid JSON array of strings, where each string is a question. Example format:
["Tell me about yourself.", "Why MBA after engineering?", "Explain the impact of the recent RBI monetary policy on your industry."]`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback if no API key is set
      return NextResponse.json({
        questions: [
          "Tell me about yourself.",
          `Why do you want to join ${targetCollege}?`,
          `How does your background in ${gradField || 'your field'} help you in an MBA?`,
          "What is your biggest weakness?",
          "Where do you see yourself in 5 years?",
          "Why MBA and why now?",
          "Who is the current CEO of the company you work for, and what are their major challenges?",
          "What is your opinion on the recent economic policies in India?",
          "What is your opinion on the recent RBI monetary policy?",
          "What is your opinion on the recent inflation?",
          "What is your opinion on the recent recession?",
          "What is your opinion on the recent employment rate?",
          "What is your opinion on the recent global economy?",
          "What is your opinion on the recent geopolitical situation?",
          "What is your opinion on the recent climate change?",
          "What is your opinion on the recent social issues?",
          "What is your opinion on the recent political situation?",
          "What is your opinion on the recent technological advancements?"
        ]
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: "Generate the questions based on the profile." }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json({
        questions: [
          "Tell me about yourself and walk me through your profile.",
          `Why do you want to join ${targetCollege}?`,
          `How does your background in ${gradField || 'your field'} help you in an MBA?`,
          "Can you explain a time you faced a difficult challenge at work or in college?",
          "What are your strengths and weaknesses?",
          "Where do you see yourself in 5 years?",
          "Why MBA and why now?",
          "Who is the current CEO of the company you work for, and what are their major challenges?",
          "What is your opinion on the recent economic policies in India?",
          "What is your opinion on the recent RBI monetary policy?",
          "What is your opinion on the recent inflation?",
          "What is your opinion on the recent recession?",
          "What is your opinion on the recent employment rate?",
          "What is your opinion on the recent global economy?",
          "What is your opinion on the recent geopolitical situation?",
          "What is your opinion on the recent climate change?",
          "What is your opinion on the recent social issues?",
          "What is your opinion on the recent political situation?",
          "What is your opinion on the recent technological advancements?"
        ]
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No output from Gemini');
    }

    // Clean up markdown block if present
    const cleanedText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const questions = JSON.parse(cleanedText);

    // Save to cache before returning
    try {
      await prisma.aiPredictionCache.create({
        data: { profileHash, collegeId, questions: questions }
      });

      // Increment IP quota
      await prisma.ipRateLimit.update({
        where: { ip },
        data: {
          generations: currentGenerations + 1,
          lastResetAt: isSameDay ? undefined : now
        }
      });
      console.log('Saved to AI Cache and incremented quota for IP:', ip);
    } catch (cacheErr) {
      console.error('Failed to save cache/quota:', cacheErr);
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('AI Predict API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
