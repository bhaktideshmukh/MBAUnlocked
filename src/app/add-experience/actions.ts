'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function addExperienceAction(formDataRaw: any, _: any) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { error: 'Authentication required' };
  }

  const userId = session.userId as string;

  try {
    // Verify user exists in DB (to avoid foreign key violation if DB was reset)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { error: 'User not found. Please log out and log in again.' };
    }

    // Validate and parse numeric fields
    const panelSize = parseInt(formDataRaw.panelSize, 10);
    if (isNaN(panelSize)) {
      return { error: 'Invalid panel size.' };
    }

    const interviewDate = new Date(formDataRaw.date);
    if (isNaN(interviewDate.getTime())) {
      return { error: 'Invalid interview date.' };
    }

    const newTranscript = await prisma.transcript.create({
      data: {
        collegeId: formDataRaw.collegeId,
        category: formDataRaw.category,
        gradField: formDataRaw.gradField,
        gender: formDataRaw.gender,
        catPercentile: formDataRaw.catPercentile,
        workExperience: formDataRaw.workExperience || 'NA',
        panelSize: panelSize,
        date: interviewDate,
        verdict: formDataRaw.verdict,
        anonymous: formDataRaw.anonymous === 'yes' || formDataRaw.anonymous === true,
        contactInfo: formDataRaw.contactInfo || null,
        userId: userId,
        fullText: formDataRaw.fullText || null
      }
    });

    return { success: true, id: newTranscript.id };
  } catch (error: any) {
    console.error('Error adding experience:', error);
    return { error: `Submission failed: ${error.message || 'Database error'}` };
  }
}
