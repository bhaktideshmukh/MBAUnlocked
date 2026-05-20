import { COLLEGES } from '@/lib/data';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from './transcripts.module.css';

import TranscriptCard from '@/components/TranscriptCard';

export default async function TranscriptsPage({
  params,
  searchParams,
}: {
  params: Promise<{ collegeId: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collegeId } = await params;
  const college = COLLEGES.find(c => c.id === collegeId);

  if (!college) {
    return <div className="p-8 text-center">College not found</div>;
  }

  const sp = (await Promise.resolve(searchParams || {})) as Record<string, string | string[] | undefined>;

  const cat = typeof sp.category === 'string' ? sp.category.trim() : '';
  const grad = typeof sp.gradField === 'string' ? sp.gradField.trim() : '';
  const gen = typeof sp.gender === 'string' ? sp.gender.trim() : '';
  const percentileStr = typeof sp.catPercentile === 'string' ? sp.catPercentile.trim() : '';

  const hasProfile = Boolean(cat || grad || gen || percentileStr);
  const userPercentile = percentileStr && !isNaN(parseFloat(percentileStr)) ? parseFloat(percentileStr) : null;

  // DB Fetch
  const dbTranscripts = await prisma.transcript.findMany({
    where: { collegeId: college.id },
    include: { questions: true }
  });

  let scoredTranscripts = dbTranscripts.map(t => {
    let score = 0;
    if (hasProfile) {
      if (cat && t.category === cat) score += 10;
      if (grad && t.gradField === grad) score += 10;
      if (gen && t.gender === gen) score += 10;
      if (userPercentile && t.catPercentile !== 'NA' && !isNaN(parseFloat(t.catPercentile)) && Math.abs(parseFloat(t.catPercentile) - userPercentile) <= 2) score += 5;
    }
    return { transcript: t, score };
  });

  // Sort by score descending
  scoredTranscripts.sort((a, b) => b.score - a.score);

  const exactMatches = scoredTranscripts.filter(s => s.score >= 30).map(s => s.transcript);
  const similarMatches = scoredTranscripts.filter(s => s.score > 0 && s.score < 30).map(s => s.transcript);
  const allOther = scoredTranscripts.filter(s => s.score === 0).map(s => s.transcript);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={`/colleges/${collegeId}`} className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Profile
        </Link>
        <h1>{college.name} Transcripts</h1>
        {hasProfile && <p>Showing matched results for your profile.</p>}
        {!hasProfile && <p>Showing all available transcripts.</p>}
      </header>

      <div className={styles.feed}>
        {hasProfile && exactMatches.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🎯 Exact Matches</h2>
            {exactMatches.map(t => <TranscriptCard key={t.id} t={t} highlight={true} />)}
          </section>
        )}

        {hasProfile && similarMatches.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🔍 Similar Profiles</h2>
            {similarMatches.map(t => <TranscriptCard key={t.id} t={t} highlight={false} />)}
          </section>
        )}

        {(!hasProfile || (exactMatches.length === 0 && similarMatches.length === 0) || allOther.length > 0) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {hasProfile ? 'Other Transcripts' : 'All Transcripts'}
            </h2>
            {allOther.length > 0 ? allOther.map(t => <TranscriptCard key={t.id} t={t} highlight={false} />) : (
              !hasProfile && dbTranscripts.map(t => <TranscriptCard key={t.id} t={t} highlight={false} />)
            )}
            {dbTranscripts.length === 0 && (
              <div className={styles.empty}>No transcripts available yet. Be the first to add one!</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
