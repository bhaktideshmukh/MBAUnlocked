import Link from 'next/link';
import { COLLEGES } from '@/lib/data';
import styles from './colleges.module.css';
import { Building2, ChevronRight } from 'lucide-react';

export default function CollegesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Select Your College</h1>
        <p className={styles.subtitle}>Choose your dream B-School to view specific interview transcripts.</p>
      </div>

      <div className={styles.grid}>
        {COLLEGES.map((college, index) => (
          <Link href={`/colleges/${college.id}`} key={college.id} className={styles.card} style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={styles.cardIcon}>
              <Building2 size={32} />
            </div>
            <div className={styles.cardContent}>
              <h2>{college.name}</h2>
              <p>Explore Transcripts</p>
            </div>
            <ChevronRight className={styles.cardArrow} />
          </Link>
        ))}
      </div>
    </div>
  );
}
