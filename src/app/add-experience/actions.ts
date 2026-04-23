'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function addExperienceAction(formDataRaw: any, questions: {q: string, a: string}[]) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Authentication required' };
  }

  const userId = session.userId as string;

  try {
    const newTranscript = await prisma.transcript.create({
      data: {
        collegeId: formDataRaw.collegeId,
        category: formDataRaw.category,
        gradField: formDataRaw.gradField,
        gender: formDataRaw.gender,
        catPercentile: parseFloat(formDataRaw.catPercentile),
        panelSize: parseInt(formDataRaw.panelSize, 10),
        date: new Date(formDataRaw.date),
        verdict: formDataRaw.verdict,
        anonymous: formDataRaw.anonymous === 'yes' || formDataRaw.anonymous === true,
        contactInfo: formDataRaw.contactInfo || null,
        userId: userId,
        questions: {
          create: questions.map(q => ({ q: q.q, a: q.a }))
        }
      }
    });

    return { success: true, id: newTranscript.id };
  } catch (error: any) {
    console.error('Error adding experience:', error);
    return { error: 'Failed to submit transcript to the database.' };
  }
}
