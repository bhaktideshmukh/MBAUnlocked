import Link from 'next/link';
import Image from 'next/image';
import styles from '@/app/page.module.css';
import { ArrowRight, PlusCircle } from 'lucide-react';

const COLLEGES = [
  '/images/colleges/fms.png',
  '/images/colleges/iima.png',
  '/images/colleges/iimb.png',
  '/images/colleges/iimc.png',
  '/images/colleges/iimi.png',
  '/images/colleges/iimk.png',
  '/images/colleges/iiml.png',
  '/images/colleges/iimm.png',
  '/images/colleges/iimnagpur.png',
  '/images/colleges/iimshillong.png',
  '/images/colleges/iimudaipur.png',
  '/images/colleges/iitb.png',
  '/images/colleges/iitd.png',
  '/images/colleges/isb.png',
  '/images/colleges/mdig.png',
  '/images/colleges/spjimr.png',
  '/images/colleges/xlri.png',
];

const midPoint = Math.ceil(COLLEGES.length / 2);
const ROLL_1 = COLLEGES.slice(0, midPoint);
const ROLL_2 = COLLEGES.slice(midPoint);

export default function HeroSection() {
  return (
    <section className={styles.heroSplit}>
      {/* Single high-quality campus background */}
      <div className={styles.heroBackground}>
        <Image 
          src="https://upload.wikimedia.org/wikipedia/commons/3/37/Indian_Institute_of_Management_Ahmedabad%2C_panorama.jpg" 
          alt="IIM Ahmedabad Campus"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className={styles.heroLeft}>
        <h1 className={styles.title}>
          Real Stories.<br />
          Real Interviews.<br />
          <span className={styles.titleHighlight}>Real Converts.</span>
        </h1>
        
        <p className={styles.subtitle}>
          Learn from the experiences of aspirants who've been in your shoes.
        </p>
        
        <div className={styles.ctaGroup}>
          <Link href="/colleges" className={styles.btnPrimary}>
            Explore Transcripts <ArrowRight size={20} />
          </Link>
          <Link href="/add-experience" className={styles.btnSecondary}>
            <PlusCircle size={20} /> Share Experience
          </Link>
        </div>
      </div>

      <div className={styles.heroRight}>
        <div className={styles.filmRollContainer}>
          <div className={`${styles.filmRoll} ${styles.filmRollUp}`}>
            {[...ROLL_1, ...ROLL_1].map((img, i) => (
              <div key={`roll1-${i}`} className={styles.filmCard}>
                <Image src={img} alt="College Campus" fill className={styles.filmImage} />
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.filmRollContainer}>
          <div className={`${styles.filmRoll} ${styles.filmRollDown}`}>
            {[...ROLL_2, ...ROLL_2].map((img, i) => (
              <div key={`roll2-${i}`} className={styles.filmCard}>
                <Image src={img} alt="College Campus" fill className={styles.filmImage} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
