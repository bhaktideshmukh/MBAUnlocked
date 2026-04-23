'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, User, PlusCircle } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <BookOpen className={styles.logoIcon} />
          <span className={styles.logoText}>MBA<span className="text-gradient">Unlocked</span></span>
        </Link>
        <nav className={styles.navLinks}>
          <Link 
            href="/colleges" 
            className={`${styles.link} ${pathname.includes('/colleges') ? styles.active : ''}`}
          >
            Explore Transcripts
          </Link>
          <Link 
            href="/add-experience" 
            className={`${styles.link} ${pathname.includes('/add-experience') ? styles.active : ''}`}
          >
            <PlusCircle size={18} />
            Share Experience
          </Link>
        </nav>
        <div className={styles.authActions}>
          <Link href="/auth" className="btn btn-secondary">Login</Link>
          <Link href="/auth" className="btn btn-primary">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
