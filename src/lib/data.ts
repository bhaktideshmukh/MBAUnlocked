export const COLLEGES = [
  { id: 'iima', name: 'IIM Ahmedabad' },
  { id: 'iimb', name: 'IIM Bangalore' },
  { id: 'iimc', name: 'IIM Calcutta' },
  { id: 'iiml', name: 'IIM Lucknow' },
  { id: 'iimk', name: 'IIM Kozhikode' },
  { id: 'iimi', name: 'IIM Indore' },
  { id: 'iimshillong', name: 'IIM Shillong' },
  { id: 'iimm', name: 'IIM Mumbai' },
  { id: 'iimudaipur', name: 'IIM Udaipur' },
  { id: 'iimnagpur', name: 'IIM Nagpur' },
  { id: 'iimv', name: 'IIM Visakhapatnam' },
  { id: 'xlri', name: 'XLRI Jamshedpur' },
  { id: 'fms', name: 'FMS Delhi' },
  { id: 'isb', name: 'ISB Hyderabad' },
  { id: 'spjimr', name: 'SPJIMR Mumbai' },
  { id: 'mdig', name: 'MDI Gurgaon' },
  { id: 'iift', name: 'IIFT' },
  { id: 'sjmsom', name: 'IIT Bombay (SJMSOM)' },
  { id: 'tiss', name: 'TISS Mumbai' },
  { id: 'vgsom', name: 'IIT Kharagpur (VGSOM)' },
  { id: 'sibmp', name: 'SIBM Pune' },
  { id: 'ximb', name: 'XIMB' },
  { id: 'iimraipur', name: 'IIM Raipur' },
  { id: 'iimrohtak', name: 'IIM Rohtak' },
  { id: 'imid', name: 'IMI Delhi' },
  { id: 'imtg', name: 'IMT Ghaziabad' },
  { id: 'bitsom', name: 'BITSoM' },
  { id: 'iimamritsar', name: 'IIM Amritsar' },
  { id: 'iimsambalpur', name: 'IIM Sambalpur' },
  { id: 'cap', name: 'IIM CAP' },
  { id: 'jap', name: 'IIM JAP / SAP' },
  { id: 'gim', name: 'GIM Goa' },
  { id: 'glim', name: 'Great Lakes Chennai' },
  { id: 'iimkashipur', name: 'IIM Kashipur' },
  { id: 'tapmi', name: 'TAPMI' },
  { id: 'kjsomaiya', name: 'K J Somaiya' },
  { id: 'nmims', name: 'NMIMS Mumbai' },
  { id: 'iitk', name: 'IIT Kanpur' },
  { id: 'iitm', name: 'IIT Madras' }
];

export const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
export const GRAD_FIELDS = ['Engineer', 'Commerce', 'Arts', 'Science', 'Medical', 'Other'];
export const GENDERS = ['Male', 'Female', 'Non-binary'];

export type Transcript = {
  id: string;
  collegeId: string;
  category: string;
  gradField: string;
  gender: string;
  catPercentile: string;
  panelSize: number;
  date: string;
  verdict: 'Converted' | 'Waitlisted' | 'Rejected' | 'Unknown' | 'NA';
  workExperience?: string;
  questions: { q: string; a: string }[];
  anonymous?: boolean;
  contactInfo?: string;
};

export const TRANSCRIPTS: Transcript[] = [
  {
    id: 't1',
    collegeId: 'iimb',
    category: 'General',
    gradField: 'Engineer',
    gender: 'Male',
    catPercentile: '99.8',
    panelSize: 3,
    date: '2025-02-15',
    verdict: 'Converted',
    questions: [
      { q: "Introduce yourself.", a: "Talked about my work at a tech startup, my engineering background, and my passion for product management." },
      { q: "Why MBA after a good tech job?", a: "Explained how I want to move from executing product features to defining the strategic vision of a product." },
      { q: "What is your opinion on AI replacing coders?", a: "Gave a balanced view. AI will augment developers, but strategic problem-solving will remain human-centric." },
      { q: "Any questions for us?", a: "Asked about the entrepreneurial ecosystem at IIM B." }
    ]
  },
  {
    id: 't2',
    collegeId: 'iimb',
    category: 'OBC',
    gradField: 'Commerce',
    gender: 'Female',
    catPercentile: '97.5',
    panelSize: 2,
    date: '2025-03-01',
    verdict: 'Waitlisted',
    questions: [
      { q: "Take us through your resume.", a: "Highlighted my CA articleship and extracurriculars." },
      { q: "Explain the recent changes in GST slabs.", a: "Explained the rationalization efforts and their impact on FMCG." },
      { q: "Why IIM B and not IIM A since you have a finance background?", a: "Talked about the diverse cohort and case pedagogy." }
    ]
  },
  {
    id: 't3',
    collegeId: 'iima',
    category: 'SC',
    gradField: 'Arts',
    gender: 'Male',
    catPercentile: '94.2',
    panelSize: 3,
    date: '2025-02-28',
    verdict: 'Converted',
    questions: [
      { q: "Who is the current RBI Governor?", a: "Shaktikanta Das." },
      { q: "How does inflation affect a common man?", a: "Spoke about purchasing power parity and daily wage struggles." },
      { q: "Tell us about a time you failed.", a: "Mentioned my attempt at a college festival that didn't go as planned and what I learned." }
    ]
  },
  {
    id: 't4',
    collegeId: 'fms',
    category: 'General',
    gradField: 'Engineer',
    gender: 'Male',
    catPercentile: '99.9',
    panelSize: 2,
    date: '2025-03-10',
    verdict: 'Unknown',
    questions: [
      { q: "Why FMS?", a: "Emphasized ROI, location advantage for corporate connects, and strong alumni base." },
      { q: "What's the difference between Sales and Marketing?", a: "Gave a textbook definition followed by a real-life example from my company." },
      { q: "Sell me this pen.", a: "Used the classic 'supply and demand' approach by asking them to write down their name without a pen." }
    ]
  }
];
