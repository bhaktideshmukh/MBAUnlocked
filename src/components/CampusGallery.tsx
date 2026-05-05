import Image from 'next/image';
import styles from './CampusGallery.module.css';

const CAMPUS_IMAGES = [
  { src: '/images/campus/convocation.png', alt: 'Convocation Ceremony', label: 'Life-Long Achievements' },
  { src: '/images/campus/classroom.png', alt: 'Classroom Discussion', label: 'World-Class Learning' },
  { src: '/images/campus/friends.png', alt: 'Campus Life', label: 'Lasting Friendships' },
  { src: '/images/campus/exchange.png', alt: 'Exchange Program', label: 'Global Exposure' },
  { src: '/images/campus/fest.png', alt: 'College Fest', label: 'Cultural Vibrancy' },
  { src: '/images/campus/library.png', alt: 'Library Study', label: 'Academic Excellence' },
];

export default function CampusGallery() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Journey <span className="text-gradient">Starts Here</span></h2>
        <p className={styles.subtitle}>From late-night prep to the convocation stage, every story counts.</p>
      </div>

      <div className={styles.galleryWrapper}>
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {CAMPUS_IMAGES.map((img, i) => (
              <div key={`track1-${i}`} className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image src={img.src} alt={img.alt} fill className={styles.image} />
                  <div className={styles.overlay}>
                    <span>{img.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.marqueeTrack}>
            {CAMPUS_IMAGES.map((img, i) => (
              <div key={`track2-${i}`} className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image src={img.src} alt={img.alt} fill className={styles.image} />
                  <div className={styles.overlay}>
                    <span>{img.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
