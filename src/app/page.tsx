import Link from 'next/link';
import styles from './page.module.css';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.heroGlow}></div>
      
      <section className={styles.hero}>
        <div className={styles.badge}>
          <Sparkles size={16} className={styles.badgeIcon} />
          <span>The ultimate MBA interview database</span>
        </div>
        
        <h1 className={styles.title}>
          Unlock Your Future.<br />
          Nail The <span className="text-gradient">Interview.</span>
        </h1>
        
        <p className={styles.subtitle}>
          Read interview transcripts from India's top B-Schools tailored to your specific profile.
          Whether you are an engineer or an arts grad, we have insights for you.
        </p>
        
        <div className={styles.ctaGroup}>
          <Link href="/colleges" className="btn btn-primary">
            Find Your Match <ArrowRight size={18} />
          </Link>
          <Link href="/add-experience" className="btn btn-secondary">
            <LockKeyhole size={18} /> Share Your Experience
          </Link>
        </div>
      </section>

      <section className={styles.stats}>
        <div className="glass-panel">
          <h2>10K+</h2>
          <p>Transcripts</p>
        </div>
        <div className="glass-panel">
          <h2>20+</h2>
          <p>Top B-Schools</p>
        </div>
        <div className="glass-panel">
          <h2>99%</h2>
          <p>Confidence Boost</p>
        </div>
      </section>
    </div>
  );
}
