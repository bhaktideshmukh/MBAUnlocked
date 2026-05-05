import styles from './page.module.css';
import HeroSection from '@/components/HeroSection';
import CampusGallery from '@/components/CampusGallery';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.heroGlow}></div>
      
      <HeroSection />

      <CampusGallery />
    </div>
  );
}
