'use server';

import { prisma } from '@/lib/prisma';
export async function addExperienceAction(formDataRaw: any, _: any) {
  try {
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
        fullText: formDataRaw.fullText || null
      }
    });

    return { success: true, id: newTranscript.id };
  } catch (error: any) {
    console.error('Error adding experience:', error);
    return { error: `Submission failed: ${error.message || 'Database error'}` };
  }
}
