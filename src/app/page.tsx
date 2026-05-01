import styles from './page.module.css';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.heroGlow}></div>
      
      <HeroSection />

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
