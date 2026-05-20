'use client';

import { useState } from 'react';
import { COLLEGES, CATEGORIES, GRAD_FIELDS, GENDERS } from '@/lib/data';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function GlobalAIMockInterviewPage() {
  const [formData, setFormData] = useState({
    collegeId: '',
    category: '',
    gradField: '',
    gender: '',
    workEx: '',
    companyName: '',
    location: '',
    familyBackground: '',
    catPercentile: '',
    stream: '',
    ugCollege: '',
    academicScores: '',
    sop: ''
  });

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQuestions([]);

    const college = COLLEGES.find(c => c.id === formData.collegeId);
    if (!college) {
      setError('Please select a valid college.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/ai-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeId: college.id,
          targetCollege: college.name,
          ...formData
        })
      });

      if (!res.ok) {
        throw new Error('Failed to generate questions. Please try again.');
      }

      const data = await res.json();
      
      if (data.limitReached) {
        alert('You have reached your daily limit of 3 AI predictions. Here are some excellent fallback questions based on typical interview patterns!');
      }

      if (data.questions) {
        setQuestions(data.questions);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 1.5rem', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Sparkles style={{ color: 'var(--accent-primary)' }} /> AI Interview Predictor
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Enter your profile details and select a target college to generate highly probable interview questions based on real past transcripts.
        </p>
      </div>

      {!questions.length && !loading && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface-1)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>Target College *</label>
            <select name="collegeId" className="input-field" value={formData.collegeId} onChange={handleChange} required>
              <option value="">Select College</option>
              {COLLEGES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
              <select name="category" className="input-field" value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Graduation Field</label>
              <select name="gradField" className="input-field" value={formData.gradField} onChange={handleChange}>
                <option value="">Select Field</option>
                {GRAD_FIELDS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Gender</label>
              <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Work Experience (months)</label>
              <input type="text" name="workEx" className="input-field" placeholder="e.g. 24 or Fresher" value={formData.workEx} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Company Name (if worked)</label>
              <input type="text" name="companyName" className="input-field" placeholder="e.g. TCS, Deloitte" value={formData.companyName} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CAT Percentile</label>
              <input type="text" name="catPercentile" className="input-field" placeholder="e.g. 99.5" value={formData.catPercentile} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>12th/Graduation Stream</label>
              <input type="text" name="stream" className="input-field" placeholder="e.g. PCM, BBA, CS" value={formData.stream} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Undergrad College Name</label>
              <input type="text" name="ugCollege" className="input-field" placeholder="e.g. IIT Delhi, SRCC" value={formData.ugCollege} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Academic Scores (10/12/Grad)</label>
              <input type="text" name="academicScores" className="input-field" placeholder="e.g. 95/92/88" value={formData.academicScores} onChange={handleChange} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Hometown / Current Location</label>
            <input type="text" name="location" className="input-field" placeholder="e.g. Mumbai, Maharashtra" value={formData.location} onChange={handleChange} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Family Background (Optional)</label>
            <textarea name="familyBackground" className="input-field" placeholder="e.g. Father is a businessman, mother is a homemaker. Have a family business in textiles." value={formData.familyBackground} onChange={handleChange} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Statement of Purpose / Form Answers (Optional)</label>
            <textarea name="sop" className="input-field" placeholder="Paste snippets from your college application essays or SOP here. The AI will generate questions challenging your stated goals." value={formData.sop} onChange={handleChange} style={{ minHeight: '120px', resize: 'vertical' }} />
          </div>

          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>🔒</span>
            <p style={{ margin: 0 }}><strong>Privacy Disclaimer:</strong> All information provided above is strictly confidential. We do not store, sell, or collect your personal data for tracking. This information is processed ephemerally solely to generate highly personalized, custom interview questions for you.</p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Sparkles size={18} style={{ marginRight: '0.5rem' }} /> Generate Questions
          </button>
        </form>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Loader2 size={40} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
          <p>Analyzing profile and past transcripts...</p>
          <style>{`
            .spin { animation: spin 1s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {questions.length > 0 && !loading && (
        <div style={{ animation: 'fadeUp 0.5s ease-out forwards' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Predicted Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {questions.map((q, idx) => (
              <div key={idx} style={{ padding: '1.5rem', background: 'var(--surface-1)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
                <p style={{ margin: 0, fontSize: '1.125rem', lineHeight: 1.5 }}>{q}</p>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setQuestions([])} className="btn btn-secondary">
              Generate Again
            </button>
            <Link href={`/colleges/${formData.collegeId}/explore`} className="btn btn-primary">
              <BookOpen size={18} style={{ marginRight: '0.5rem' }} /> View Real Transcripts
            </Link>
          </div>
          
          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
