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
    date: new Date().toISOString().split('T')[0],
    workExperience: '',
    fullText: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // We send an empty questions array because we deleted the QA model usage for the form
    const result = await addExperienceAction(formData, []);
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
              <input type="text" name="catPercentile" className="input-field" value={formData.catPercentile} onChange={handleChange} placeholder="e.g. 99.5 or NA" />
            </div>
            <div className={styles.formGroup}>
              <label>Work Experience (Months or 0 if fresher)</label>
              <input type="text" name="workExperience" className="input-field" value={formData.workExperience} onChange={handleChange} placeholder="e.g. 0 for Fresher, or 24" />
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
              <label>College <span style={{ color: 'var(--accent-secondary)' }}>*</span></label>
              <select name="collegeId" className="input-field" value={formData.collegeId} onChange={handleChange} required>
                <option value="">Select College</option>
                {COLLEGES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Verdict</label>
              <select name="verdict" className="input-field" value={formData.verdict} onChange={handleChange}>
                <option value="Converted">Converted</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Unknown">Still Waiting</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Panel Size (Number of Interviewers)</label>
              <input type="number" min="1" max="10" name="panelSize" className="input-field" value={formData.panelSize} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Interview Date</label>
              <input type="date" name="date" className="input-field" value={formData.date} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Full Text Transcript Section */}
        <section className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <h3>3. Full Transcript <span style={{ color: 'var(--accent-secondary)' }}>*</span></h3>
            <p className={styles.sectionHint}>Share your complete interview experience as a story. Paste it exactly as it happened.</p>
          </div>

          <details className={styles.transcriptGuide}>
            <summary className={styles.guideSummary}>
              💡 View Sample Transcript Format
            </summary>
            <div className={styles.guideContent}>
              <p>A valid transcript typically includes your academic profile, the interview panel, the exact questions and answers, and the final verdict. You can use this format as a reference:</p>
              <pre className={styles.sampleTranscriptText}>
{`IIM Ahmedabad Feb-15 2025 Transcript.

**IIM Ahmedabad PGP**

15th Feb 2025

10th - 96.17

12th - 97.40

Grad- 86.90

CAT - 99.77

B. Tech. Mechanical Engineering(Male)

5 Months of experience as a System Engineer(Backend Developer)

Location: Radisson Blu Plaza, Mahipalpur

Timing: 1:15PM

AWT: AI has brought about huge progress in healthcare services. However, AI itself is a reason for higher unemployment. This causes a deficiency of resources to access the medical advancements.

I was 4th in my panel, so had to wait for almost a couple of hours after the AWT.

Interview:

2 panelists, 1M-1F

F: Tell me in brief about your company.

Me: Told

F: About your role there.

Me: Told about the initial training program and thereafter the current task provided. Also, told about the specific technologies i have worked on.

F: What are Kafka and FastApi as mentioned by you?

Me: Told about Kafka.

F: What exactly is a distributed event management system?

Me: Told indepth about the working of Kafka, as a distributed event management system. Gave an example and tried to explain.

F(still slightly unconvinced): But how is it an event management system?

Me: Told about the consumer, producer concept and how data is managed in real time. (Finally, she felt slightly convinced)

F: What about FastApi? What is it?

Me: Told

F: So you have written that you’ve increased the operational efficiency. How?

Me: Told that how i replaced RabbitMQ with Kafka, the advantage of Kafka, how it increases throughput, scalability and reliability. Also about the replication factor and how it makes the system safer. Then told the advantages of FastApi.

(She was convinced and asked the other interviewer to take the charge)

M: You’ve studied Mechanical Engineer and now working as System Engineer. Why?

Me: Told them about the first two years being online and how mechanical engineering requires practical exposure. Thereby shift of interest from Mechanical to coding.

M: How much of mechanical Engineering do you use in your job?

Me: Told him that there is no direct use of mechanical concepts but the systematic and analytical problem solving approach used in mechanical has helped me tackle many issues with ease.

M: What are your hobbies?

Me: Badminton and Swimming. Also, i have performed as lead singer at many events.

M: Tell me the No. 1 players in Badminton both men and women.

Me: Told the men no. 1, didn’t remember the name of the female player(It’s hard to remember Korean names), took the name of couple of famous ones.

M: What about the Olympics? Who won the golds?

Me: Again told the men gold medalist, remembered the name of one of the two women finalists.

M: So your college was in dhanbad, right?

Me: Yes, sir!

M: Tell me the name of the cities that you’ll visit when travelling from Vizag to Dhanbad.

Me(Trying to remember but could not recall): Took 10 seconds, Sir I haven't been to those areas, so i don't have much idea.

M: Do you know where Vizag is?

Me: Yes sir, it is a coastal city in Andhra Pradesh.

M: What about Bangalore to Dhanbad?

Me: Again sir i haven’t been to bangalore by train.

M: How can you say that, haven’t you ever studied Indian map?

Me: Sir, certainly i have studied the Indian Map. But then i have studied about the states and not the cities within every state.

M: Okay, then tell me about the states.

Me: Sir, the states that we may come across are Karnataka, AP, Telangana, Orissa, Maharashtra, Madhya Pradesh

M: Huh, Orissa and Maharashtra, how can you say both, aren’t they so far away?

Me: Yes sir, they are far. So what i was saying is that, if we travel from the western side, we’ll go through Mah. MP and then Jharkhand and if from eastern side, AP, Telangana, Orissa and Jharkhand.

M(More Geography): How many states are there in India?

Me: 28 sir.

M: Are you sure, aren’t there 29?

Me: Sir as far as i know there are 28.

M: What about the UTs?

Me: Sir 8.

M: Again, aren’t there 7 UTs.

Me: I have studied that there are 8 currently.

M: Name all the 7(he was probably testing)

Me: Named all 8.

M: Thats all 7 right?

Me: All 8 sir.

M: But, Delhi is not a UT(Again testing)

Me: Sir Delhi is a UT from my knowledge.

M: Okay Sahil, that’s it from our side. You can take a candy and leave!

Me: Thank you, it was a pleasure.

Hadn’t slept well last night, eyes were all red. The guy next to me, was like, “Bhai bohot grill krrhe kya? aankhein puri laal hain” . I was like no the panel is chill and so was it.

I expected the interview to be lengthier and more grilling. But the panelists were sweet. It was a decent experience.

Verdict: Awaited.`}
              </pre>
            </div>
          </details>

          <div className={styles.qaList}>
            <textarea
              name="fullText"
              className={styles.textarea}
              placeholder="Start typing your interview experience..."
              value={formData.fullText}
              onChange={handleChange}
              required
              rows={12}
              style={{ padding: '1rem' }}
            />
          </div>
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
