'use server';

import { prisma } from '@/lib/prisma';
export async function addExperienceAction(formDataRaw: any, _: any) {
  try {
    // Parse panelSize (fallback to 2 if empty or invalid)
    let panelSize = parseInt(formDataRaw.panelSize, 10);
    if (isNaN(panelSize)) {
      panelSize = 2;
    }

    // Parse date (fallback to current date if empty or invalid)
    let interviewDate = new Date(formDataRaw.date);
    if (!formDataRaw.date || isNaN(interviewDate.getTime())) {
      interviewDate = new Date();
    }

    const newTranscript = await prisma.transcript.create({
      data: {
        collegeId: formDataRaw.collegeId,
        category: formDataRaw.category || 'NA',
        gradField: formDataRaw.gradField || 'NA',
        gender: formDataRaw.gender || 'NA',
        catPercentile: formDataRaw.catPercentile || 'NA',
        workExperience: formDataRaw.workExperience || 'NA',
        panelSize: panelSize,
        date: interviewDate,
        verdict: formDataRaw.verdict || 'Unknown',
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
