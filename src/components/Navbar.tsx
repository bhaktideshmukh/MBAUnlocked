'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, User, PlusCircle } from 'lucide-react';
import styles from './Navbar.module.css';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

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
            href="/ai-mock" 
            className={`${styles.link} ${pathname.includes('/ai-mock') ? styles.active : ''}`}
          >
            AI Predictor
          </Link>
          <Link 
            href="/add-experience" 
            className={`${styles.link} ${pathname.includes('/add-experience') ? styles.active : ''}`}
          >
            <PlusCircle size={18} />
            Share Experience
          </Link>
        </nav>
      </div>
    </header>
  );
}
