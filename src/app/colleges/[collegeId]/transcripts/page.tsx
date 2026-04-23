import { COLLEGES } from '@/lib/data';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import styles from './transcripts.module.css';

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

  const sp = await Promise.resolve(searchParams || {});

  const cat = sp.category as string;
  const grad = sp.gradField as string;
  const gen = sp.gender as string;
  const percentileStr = sp.catPercentile as string;
  
  const hasProfile = Boolean(cat || grad || gen || percentileStr);
  const userPercentile = percentileStr ? parseFloat(percentileStr) : null;

  // DB Fetch
  const dbTranscripts = await prisma.transcript.findMany({
    where: { collegeId: college.id },
    include: { questions: true }
  });

  let scoredTranscripts = dbTranscripts.map(t => {
    let score = 0;
    if (hasProfile) {
      if (t.category === cat) score += 10;
      if (t.gradField === grad) score += 10;
      if (t.gender === gen) score += 10;
      if (userPercentile && Math.abs(t.catPercentile - userPercentile) <= 2) score += 5;
    }
    return { transcript: t, score };
  });

  // Sort by score descending
  scoredTranscripts.sort((a, b) => b.score - a.score);

  const exactMatches = scoredTranscripts.filter(s => s.score >= 30).map(s => s.transcript);
  const similarMatches = scoredTranscripts.filter(s => s.score > 0 && s.score < 30).map(s => s.transcript);
  const allOther = scoredTranscripts.filter(s => s.score === 0).map(s => s.transcript);

  const renderTranscriptCard = (t: any, highlight: boolean = false) => (
    <div key={t.id} className={`${styles.card} ${highlight ? styles.cardHighlight : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.profileInfo}>
          <User size={24} className={styles.userIcon} />
          <div>
            <h3>{t.anonymous ? 'Anonymous' : (t.contactInfo || 'Candidate')} • {t.catPercentile}%ile</h3>
            <p>{t.category} • {t.gradField} • {t.gender}</p>
          </div>
        </div>
        <div className={styles.verdictBadge} data-verdict={t.verdict}>
          {t.verdict === 'Converted' && <CheckCircle size={16} />}
          {t.verdict === 'Waitlisted' && <Clock size={16} />}
          {t.verdict === 'Rejected' && <XCircle size={16} />}
          <span>{t.verdict}</span>
        </div>
      </div>
      
      <div className={styles.meta}>
        <span><Calendar size={14} /> Panel Size: {t.panelSize}</span>
        <span>Date: {new Date(t.date).toLocaleDateString()}</span>
      </div>

      <div className={styles.qaSection}>
        {t.fullText && (
          <div className={styles.fullTextContainer} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {t.fullText}
          </div>
        )}
        {!t.fullText && t.questions.map((q: any, idx: number) => (
          <div key={q.id || idx} className={styles.qaItem}>
            <p className={styles.question}><strong>Q:</strong> {q.q}</p>
            <p className={styles.answer}><strong>A:</strong> {q.a}</p>
          </div>
        ))}
      </div>
    </div>
  );

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
            {exactMatches.map(t => renderTranscriptCard(t, true))}
          </section>
        )}

        {hasProfile && similarMatches.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🔍 Similar Profiles</h2>
            {similarMatches.map(t => renderTranscriptCard(t, false))}
          </section>
        )}

        {(!hasProfile || (exactMatches.length === 0 && similarMatches.length === 0) || allOther.length > 0) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {hasProfile ? 'Other Transcripts' : 'All Transcripts'}
            </h2>
            {allOther.length > 0 ? allOther.map(t => renderTranscriptCard(t, false)) : (
              !hasProfile && dbTranscripts.map(t => renderTranscriptCard(t, false))
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
