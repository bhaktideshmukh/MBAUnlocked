'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { COLLEGES, CATEGORIES, GRAD_FIELDS, GENDERS } from '@/lib/data';
import styles from '../questionnaire.module.css';
import { ArrowRight, SkipForward } from 'lucide-react';

export default function QuestionnairePage({ params }: { params: Promise<{ collegeId: string }> }) {
  const { collegeId } = use(params);
  const router = useRouter();
  const college = COLLEGES.find(c => c.id === collegeId);
  
  const [formData, setFormData] = useState({
    category: '',
    gradField: '',
    gender: '',
    catPercentile: ''
  });

  if (!college) {
    return <div className={styles.error}>College not found</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkip = () => {
    router.push(`/colleges/${collegeId}/transcripts`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams(formData as any).toString();
    router.push(`/colleges/${collegeId}/transcripts?${query}`);
  };

  return (
    <div 
      className={styles.container} 
      onClick={() => router.push(`/colleges/${collegeId}`)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', background: 'rgba(0,0,0,0.5)', zIndex: 100 }}
    >
      <div 
        className={styles.formCard}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>Profile Questionnaire</h2>
          <p>Help us find the best interview transcripts for {college.name} based on your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select name="category" className="input-field" value={formData.category} onChange={handleChange}>
              <option value="">Select Category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Graduation Field</label>
            <select name="gradField" className="input-field" value={formData.gradField} onChange={handleChange}>
              <option value="">Select Field</option>
              {GRAD_FIELDS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Gender</label>
            <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>CAT Percentile</label>
            <input 
              type="text" 
              name="catPercentile" 
              placeholder="e.g. 99.5 or NA" 
              className="input-field" 
              value={formData.catPercentile} 
              onChange={handleChange} 
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={handleSkip}>
              Skip <SkipForward size={18} />
            </button>
            <button type="submit" className="btn btn-primary">
              Find Matches <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
