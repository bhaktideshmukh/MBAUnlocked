import Link from 'next/link';
import { COLLEGES } from '@/lib/data';
import styles from './dashboard.module.css';
import { BookOpen, Sparkles, Share, ChevronRight, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function CollegeDashboardPage({ params }: { params: Promise<{ collegeId: string }> }) {
  const { collegeId } = await params;
  const college = COLLEGES.find(c => c.id === collegeId);

  if (!college) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <Link href="/colleges" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Colleges
      </Link>
      
      <div className={styles.header}>
        <h1 className={styles.title}>{college.name}</h1>
        <p className={styles.subtitle}>Welcome to the {college.id.toUpperCase()} dashboard. Choose an action below.</p>
      </div>

      <div className={styles.grid}>
        <Link href={`/colleges/${collegeId}/explore`} className={styles.card} style={{ animationDelay: '0s' }}>
          <div className={styles.cardIcon}>
            <BookOpen size={32} />
          </div>
          <div className={styles.cardContent}>
            <h2>Explore Transcripts</h2>
            <p>Read real interview experiences matching your profile.</p>
          </div>
          <ChevronRight className={styles.cardArrow} />
        </Link>

        <Link href={`/colleges/${collegeId}/ai-mock`} className={styles.card} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardIcon}>
            <Sparkles size={32} />
          </div>
          <div className={styles.cardContent}>
            <h2>AI Predict Questions</h2>
            <p>Generate highly probable interview questions for your profile using AI.</p>
          </div>
          <ChevronRight className={styles.cardArrow} />
        </Link>

        <Link href={`/add-experience?collegeId=${collegeId}`} className={styles.card} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardIcon}>
            <Share size={32} />
          </div>
          <div className={styles.cardContent}>
            <h2>Share Transcript</h2>
            <p>Help future candidates by adding your own interview experience.</p>
          </div>
          <ChevronRight className={styles.cardArrow} />
        </Link>
      </div>
    </div>
  );
}
