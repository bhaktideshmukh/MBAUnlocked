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
  },
  {
    id: 'iiml',
    name: 'IIM Lucknow',
    aliases: ['iim lucknow', 'iim-lucknow', 'iiml', 'iim l', 'iim-l', 'lucknow iim', 'lucknow'],
    noiseAliases: []
  },
  {
    id: 'iimk',
    name: 'IIM Kozhikode',
    aliases: ['iim kozhikode', 'iim-kozhikode', 'iimk', 'iim k', 'iim-k', 'kozhikode iim', 'kozhikode'],
    noiseAliases: ['kashipur']
  },
  {
    id: 'iimi',
    name: 'IIM Indore',
    aliases: ['iim indore', 'iim-indore', 'iimi', 'iim i', 'iim-i', 'indore iim', 'indore'],
    noiseAliases: []
  },
  {
    id: 'spjimr',
    name: 'SPJIMR Mumbai',
    aliases: ['spjimr', 'sp jain', 'sp jain mumbai', 'spjimr mumbai', 'sp jain institute of management'],
    noiseAliases: ['sp jain global']
  },
  {
    id: 'iimudaipur',
    name: 'IIM Udaipur',
    aliases: ['iim udaipur', 'iim-udaipur', 'iimu', 'iim u', 'iim-u', 'udaipur iim', 'udaipur'],
    noiseAliases: []
  },
  {
    id: 'iimv',
    name: 'IIM Visakhapatnam',
    aliases: ['iim visakhapatnam', 'iim-visakhapatnam', 'iimv', 'iim v', 'iim-v', 'visakhapatnam iim', 'visakhapatnam', 'iim vizag', 'vizag iim', 'vizag'],
    noiseAliases: []
  },
  {
    id: 'iimm',
    name: 'IIM Mumbai',
    aliases: ['iim mumbai', 'iim-mumbai', 'iimm', 'iim m', 'iim-m', 'mumbai iim', 'nitie', 'nitie mumbai'],
    noiseAliases: []
  },
  {
    id: 'iimnagpur',
    name: 'IIM Nagpur',
    aliases: ['iim nagpur', 'iim-nagpur', 'iimn', 'iim n', 'iim-n', 'nagpur iim', 'nagpur'],
    noiseAliases: []
  },
  {
    id: 'iimshillong',
    name: 'IIM Shillong',
    aliases: ['iim shillong', 'iim-shillong', 'iims', 'iim s', 'iim-s', 'shillong iim', 'shillong'],
    noiseAliases: ['sirmaur', 'sambalpur']
  },
  {
    id: 'mdig',
    name: 'MDI Gurgaon',
    aliases: ['mdi gurgaon', 'mdi', 'mdi g', 'mdi-g', 'management development institute'],
    noiseAliases: ['mdi murshidabad', 'mdim']
  },
  {
    id: 'iift',
    name: 'IIFT',
    aliases: ['iift', 'iift delhi', 'iift kolkata', 'iift-kolkata', 'iift d', 'iift-delhi', 'iift-d', 'indian institute of foreign trade'],
    noiseAliases: []
  },
  {
    id: 'sjmsom',
    name: 'IIT Bombay (SJMSOM)',
    aliases: ['iit bombay', 'iitb', 'sjmsom', 'som iitb', 'shailesh j. mehta school of management', 'bombay'],
    noiseAliases: []
  },
  {
    id: 'dms',
    name: 'IIT Delhi (DMS)',
    aliases: ['iit delhi', 'iitd', 'dms', 'dms iitd', 'department of management studies', 'delhi'],
    noiseAliases: []
  },
  {
    id: 'tiss',
    name: 'TISS Mumbai',
    aliases: ['tiss mumbai', 'tiss', 'tata institute of social sciences'],
    noiseAliases: []
  },
  {
    id: 'vgsom',
    name: 'IIT Kharagpur (VGSOM)',
    aliases: ['iit kgp', 'iit kharagpur', 'vgsom', 'vinod gupta school of management', 'kharagpur'],
    noiseAliases: []
  },
  {
    id: 'sibmp',
    name: 'SIBM Pune',
    aliases: ['sibm pune', 'sibm', 'sibmp', 'symbiosis institute of business management', 'sibmh', 'sibm b', 'sibm bangalore', 'sibm h'],
    noiseAliases: []
  },
  {
    id: 'ximb',
    name: 'XIMB',
    aliases: ['ximb', 'xim b', 'xim-b', 'xavier institute of management', 'xim bhubaneswar', 'xim'],
    noiseAliases: []
  },
  {
    id: 'iimraipur',
    name: 'IIM Raipur',
    aliases: ['iim raipur', 'iim-raipur', 'raipur'],
    noiseAliases: []
  },
  {
    id: 'iimrohtak',
    name: 'IIM Rohtak',
    aliases: ['iim rohtak', 'iim-rohtak', 'rohtak'],
    noiseAliases: []
  },
  {
    id: 'imid',
    name: 'IMI Delhi',
    aliases: ['imi delhi', 'imi new delhi', 'international management institute delhi'],
    noiseAliases: ['imi kolkata', 'imi bhubaneswar']
  },
  {
    id: 'imtg',
    name: 'IMT Ghaziabad',
    aliases: ['imt ghaziabad', 'imt g', 'imt-g', 'institute of management technology', 'ghaziabad', 'imt'],
    noiseAliases: ['imt nagpur', 'imt hyderabad', 'imt n', 'imt h']
  },
  {
    id: 'bitsom',
    name: 'BITSoM',
    aliases: ['bitsom', 'bits school of management'],
    noiseAliases: []
  },
  {
    id: 'iimamritsar',
    name: 'IIM Amritsar',
    aliases: ['iim amritsar', 'iim-amritsar', 'amritsar'],
    noiseAliases: []
  },
  {
    id: 'iimsambalpur',
    name: 'IIM Sambalpur',
    aliases: ['iim sambalpur', 'iim-sambalpur', 'sambalpur'],
    noiseAliases: []
  },
  {
    id: 'cap',
    name: 'IIM CAP',
    aliases: ['cap', 'common admission process', 'iim cap', 'cap iims'],
    noiseAliases: []
  },
  {
    id: 'jap',
    name: 'IIM JAP / SAP',
    aliases: ['jap', 'joint admission process', 'iim jap', 'sap'],
    noiseAliases: []
  },
  {
    id: 'gim',
    name: 'GIM Goa',
    aliases: ['gim goa', 'gim', 'goa institute of management'],
    noiseAliases: []
  },
  {
    id: 'glim',
    name: 'Great Lakes Chennai',
    aliases: ['great lakes chennai', 'glim chennai', 'glim', 'great lakes'],
    noiseAliases: ['glim gurgaon']
  },
  {
    id: 'iimkashipur',
    name: 'IIM Kashipur',
    aliases: ['iim kashipur', 'iim-kashipur', 'kashipur'],
    noiseAliases: []
  },
  {
    id: 'tapmi',
    name: 'TAPMI',
    aliases: ['tapmi', 't a pai management institute'],
    noiseAliases: []
  },
  {
    id: 'kjsomaiya',
    name: 'K J Somaiya',
    aliases: ['k j somaiya', 'kj somaiya', 'kjsom', 'somaiya'],
    noiseAliases: []
  },
  {
    id: 'nmims',
    name: 'NMIMS Mumbai',
    aliases: ['nmims', 'nmims mumbai', 'narsee monjee', 'nmims bangalore', 'nmims hyderabad'],
    noiseAliases: []
  },
  {
    id: 'iitk',
    name: 'IIT Kanpur',
    aliases: ['iit kanpur', 'iitk', 'dime iitk', 'kanpur'],
    noiseAliases: []
  },
  {
    id: 'iitm',
    name: 'IIT Madras',
    aliases: ['iit madras', 'iitm', 'doms iitm', 'madras'],
    noiseAliases: []
  }
];

/** These strings in a title immediately disqualify the post from any college match */
export const GLOBAL_NOISE = [
  'iim ranchi',
  'iim trichy', 'iim jammu', 'iim sirmaur', 'iim bodhgaya',
  'scmhrd',
  'iit d', 'iitd', 'dms iit',
  'iit r', 'iitr', 'roorkee',
  'irma', 'mica',
  'sibmh', 'siu',
  'fore', 'lbsim'
];
