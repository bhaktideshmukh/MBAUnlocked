import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDb() {
  const transcripts = await prisma.transcript.findMany({
    where: {
      OR: [
        { fullText: { contains: '\\*' } },
        { fullText: { contains: '\\-' } },
        { fullText: { contains: '\\[' } },
      ]
    }
  });

  console.log(`Found ${transcripts.length} transcripts with escaped characters.`);

  let updated = 0;
  for (const t of transcripts) {
    if (!t.fullText) continue;
    
    // Use the same regex from unescapeMarkdown
    const cleaned = t.fullText.replace(/\\([!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])/g, '$1');
    
    if (cleaned !== t.fullText) {
      await prisma.transcript.update({
        where: { id: t.id },
        data: { fullText: cleaned }
      });
      updated++;
    }
  }

  console.log(`Updated ${updated} transcripts.`);
}

cleanDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
