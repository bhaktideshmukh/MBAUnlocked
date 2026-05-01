export interface CollegeConfig {
  id: string;
  name: string;
  /** All lowercase aliases that, when found as whole words in a title/body, identify this college */
  aliases: string[];
  /** Aliases that must NOT trigger a match (other IIMs that share a prefix) */
  noiseAliases: string[];
}

export const SUPPORTED_COLLEGES: CollegeConfig[] = [
  {
    id: 'iima',
    name: 'IIM Ahmedabad',
    aliases: [
      'iim ahmedabad', 'iim-ahmedabad', 'iima', 'iim a', 'iim-a',
      'ahmedabad iim', 'iim(a)', 'iim ahemdabad', 'ahmedabad'
    ],
    noiseAliases: ['iimab', 'amritsar', 'iim a(mr)'],
  },
  {
    id: 'iimb',
    name: 'IIM Bangalore',
    aliases: [
      'iim bangalore', 'iim-bangalore', 'iimb', 'iim b', 'iim-b',
      'bangalore iim', 'iim(b)', 'iim bengaluru', 'bengaluru iim', 'bangalore', 'bengaluru'
    ],
    noiseAliases: ['iimab', 'bodhgaya'],
  },
  {
    id: 'iimc',
    name: 'IIM Calcutta',
    aliases: [
      'iim calcutta', 'iim-calcutta', 'iimc', 'iim c', 'iim-c',
      'calcutta iim', 'iim(c)', 'iim kolkata', 'kolkata iim', 'calcutta', 'kolkata'
    ],
    noiseAliases: [],
  },
  {
    id: 'xlri',
    name: 'XLRI Jamshedpur',
    aliases: [
      'xlri jamshedpur', 'xlri', 'xlri delhi', 'jamshedpur', 'xlri bm', 'xlri hr',
      'xlri j', 'xlri-j', 'xlri jsp', 'xlri-jsr', 'xlri-jamshedpur', 'xlrj', 'xlri xled', 'xl', 'xat interview(HRM)'
    ],
    noiseAliases: [],
  },
  {
    id: 'fms',
    name: 'FMS Delhi',
    aliases: [
      'fms delhi', 'fms', 'faculty of management studies'
    ],
    noiseAliases: [],
  },
  {
    id: 'isb',
    name: 'ISB Hyderabad',
    aliases: [
      'isb hyderabad', 'isb', 'isb mohali', 'indian school of business', 'hyderabad', 'isb pgp', 'isb-pgp', 'isb-hyderabad',
      'isb-mohali', 'isb-hyderabad', 'isb h', 'isb yl', 'isb yl pgp', 'isb yl-pgp'
    ],
    noiseAliases: [],
  }
];

/** These strings in a title immediately disqualify the post from any college match */
export const GLOBAL_NOISE = [
  'iim l', 'iiml', 'lucknow',
  'iim i', 'iimi', 'indore',
  'iim k', 'iimk', 'kozhikode',
  'iim rohtak', 'iim shillong', 'iim udaipur', 'iim raipur', 'iim ranchi',
  'iim kashipur', 'iim trichy', 'iim jammu', 'iim sirmaur', 'iim bodhgaya',
  'iim nagpur', 'iim amritsar', 'iim visakhapatnam',
  'spjimr', 'mdi', 'nmims', 'sibm', 'scmhrd',
  'imi delhi', 'imi new delhi', 'cap', 'jap',
  'iit b', 'iitb', 'bombay', 'sjmsom',
  'iit d', 'iitd', 'dms iit',
  'iit m', 'iitm', 'iit madras',
  'iit k', 'iitk', 'iit kanpur',
  'iit kgp', 'kharagpur',
  'iit r', 'iitr', 'roorkee',
  'nitie', 'iim mumbai',
  'iift', 'tiss', 'irma', 'mica',
  'ximb', 'xim', 'imt', 'imt-g', 'imt g', 'ghaziabad',
  'sibmp', 'sibmh', 'scmhrd', 'siu',
  'fore', 'lbsim', 'tapmi', 'gim', 'glim'
];
