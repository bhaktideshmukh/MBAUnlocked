'use client';

import { useState } from 'react';
import { User, Calendar, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import styles from '@/app/colleges/[collegeId]/transcripts/transcripts.module.css';

export default function TranscriptCard({ t, highlight = false }: { t: any, highlight?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format link safely
  let linkHref = t.contactInfo;
  if (linkHref && !linkHref.startsWith('http')) {
    linkHref = 'https://' + linkHref;
  }

  return (
    <div className={`${styles.card} ${highlight ? styles.cardHighlight : ''}`}>
      <div 
        className={styles.cardHeader} 
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.profileInfo}>
          <User size={24} className={styles.userIcon} />
          <div>
            <h3>
              {t.anonymous ? 'Anonymous' : (
                t.contactInfo ? (
                  <a href={linkHref} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--accent-primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Candidate Profile <LinkIcon size={14} />
                  </a>
                ) : 'Candidate'
              )} 
              <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span> 
              {t.catPercentile}%ile
            </h3>
            <p>{t.category} • {t.gradField} • {t.gender}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className={styles.verdictBadge} data-verdict={t.verdict}>
            {t.verdict === 'Converted' && <CheckCircle size={16} />}
            {t.verdict === 'Waitlisted' && <Clock size={16} />}
            {t.verdict === 'Rejected' && <XCircle size={16} />}
            <span>{t.verdict}</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', background: 'transparent', border: 'none' }}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      <div className={styles.meta}>
        <span><Calendar size={14} /> Panel Size: {t.panelSize}</span>
        <span>Date: {new Date(t.date).toLocaleDateString()}</span>
      </div>

      {isExpanded && (
        <div className={styles.qaSection} style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '1rem' }}>
          {t.fullText && (
            <div className={styles.fullTextContainer} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {t.fullText}
            </div>
          )}
          {!t.fullText && t.questions && t.questions.map((q: any, idx: number) => (
            <div key={q.id || idx} className={styles.qaItem}>
              <p className={styles.question}><strong>Q:</strong> {q.q}</p>
              <p className={styles.answer}><strong>A:</strong> {q.a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
