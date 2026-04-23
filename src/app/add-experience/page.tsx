'use client';

import { useState } from 'react';
import { COLLEGES, CATEGORIES, GRAD_FIELDS, GENDERS } from '@/lib/data';
import styles from './addexperience.module.css';
import { Share2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { addExperienceAction } from './actions';

export default function AddExperiencePage() {
  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
    category: '',
    gradField: '',
    gender: '',
    catPercentile: '',
    contactInfo: '',
    anonymous: false,
    verdict: 'Unknown',
    panelSize: 2,
    date: new Date().toISOString().split('T')[0]
  });

  const [questions, setQuestions] = useState([{ q: '', a: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index: number, field: 'q' | 'a', value: string) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const addQuestion = () => setQuestions([...questions, { q: '', a: '' }]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await addExperienceAction(formData, questions);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h2>Thank You! 🎉</h2>
          <p>Your experience has been securely submitted and will help thousands of MBA aspirants.</p>
          <Link href="/colleges" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Browse Transcripts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Share Your Experience</h1>
        <p>Give back to the community by sharing your MBA interview transcript.</p>
        {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* Personal Details Section */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3>1. Personal Details (Optional)</h3>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="anonymous" checked={formData.anonymous} onChange={handleChange} />
              Stay Anonymous
            </label>
          </div>

          {!formData.anonymous && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="John Doe" />
              </div>
              <div className={styles.formGroup}>
                <label>Contact Info (LinkedIn/Email)</label>
                <input type="text" name="contactInfo" className="input-field" value={formData.contactInfo} onChange={handleChange} placeholder="linkedin.com/in/johndoe" />
              </div>
            </div>
          )}

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" className="input-field" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Graduation Field</label>
              <select name="gradField" className="input-field" value={formData.gradField} onChange={handleChange} required>
                <option value="">Select Field</option>
                {GRAD_FIELDS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Gender</label>
              <select name="gender" className="input-field" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>CAT Percentile</label>
              <input type="number" step="0.01" name="catPercentile" className="input-field" value={formData.catPercentile} onChange={handleChange} required placeholder="e.g. 99.5" />
            </div>
          </div>
        </section>

        {/* Interview Details Section */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3>2. Interview Details</h3>
          </div>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>College</label>
              <select name="collegeId" className="input-field" value={formData.collegeId} onChange={handleChange} required>
                <option value="">Select College</option>
                {COLLEGES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Verdict</label>
              <select name="verdict" className="input-field" value={formData.verdict} onChange={handleChange} required>
                <option value="Converted">Converted</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Unknown">Still Waiting</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Panel Size (Number of Interviewers)</label>
              <input type="number" min="1" max="10" name="panelSize" className="input-field" value={formData.panelSize} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Interview Date</label>
              <input type="date" name="date" className="input-field" value={formData.date} onChange={handleChange} required />
            </div>
          </div>
        </section>

        {/* Q&A Section */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3>3. Transcript (Q&A)</h3>
            <p className={styles.sectionHint}>Add the questions you were asked and how you answered them.</p>
          </div>

          <div className={styles.qaList}>
            {questions.map((item, idx) => (
              <div key={idx} className={styles.qaBox}>
                <div className={styles.qaHeader}>
                  <h4>Question {idx + 1}</h4>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(idx)} className={styles.removeBtn}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="What was asked?" 
                  value={item.q} 
                  onChange={(e) => handleQuestionChange(idx, 'q', e.target.value)} 
                  required 
                />
                <textarea 
                  className={styles.textarea} 
                  placeholder="Your answer..." 
                  value={item.a} 
                  onChange={(e) => handleQuestionChange(idx, 'a', e.target.value)} 
                  required 
                  rows={3}
                />
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addQuestion} className={`btn btn-secondary ${styles.addBtn}`}>
            <Plus size={16} /> Add Another Question
          </button>
        </section>

        <div className={styles.submitSection}>
          <button type="submit" className="btn btn-primary">
            Submit Transcript <Share2 size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
