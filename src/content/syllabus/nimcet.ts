import type { SyllabusMap } from '../types'

// NIMCET (NIT MCA Common Entrance Test). Section marks follow the published pattern;
// unit and subtopic importance is our estimate from past papers. Check the latest brochure.
const nimcet: SyllabusMap = {
  examCode: 'NIMCET',
  pattern: [
    { label: 'Questions', value: '120 MCQs' },
    { label: 'Total marks', value: '1000' },
    { label: 'Time', value: '2 hours' },
    { label: 'Negative', value: '¼ of the marks' },
    { label: 'Mode', value: 'Computer-based' },
  ],
  weightNote:
    'Section marks come from the NIMCET pattern: Mathematics 50 × 12, Analytical Ability 40 × 6, Computer Awareness 20 × 6, English 10 × 4 = 1000 marks, with a quarter of the marks taken off for a wrong answer. Unit and subtopic importance is ScholarAI’s estimate from past papers, not an official figure. Always check the latest NIMCET brochure (nimcet.admissions.nic.in).',
  sections: [
    {
      subject: 'Mathematics',
      weight: 60,
      questions: '50 Qs · +12 / −3',
      inApp: true,
      units: [
        {
          name: 'Algebra',
          importance: 3,
          subtopics: [
            { name: 'Sets & Logarithms', importance: 2 },
            { name: 'Quadratics & Complex Numbers', importance: 3 },
            { name: 'Sequences, Series & Combinations', importance: 3 },
          ],
        },
        {
          name: 'Calculus',
          importance: 3,
          subtopics: [
            { name: 'Limits', importance: 2 },
            { name: 'Differentiation', importance: 2 },
            { name: 'Applications of Derivatives', importance: 3 },
            { name: 'Integration', importance: 3 },
          ],
        },
        {
          name: 'Coordinate Geometry',
          importance: 3,
          subtopics: [
            { name: 'Points & Distance', importance: 2 },
            { name: 'Straight Lines', importance: 3 },
            { name: 'Circles & Conics', importance: 3 },
          ],
        },
        {
          name: 'Probability & Statistics',
          importance: 3,
          subtopics: [
            { name: 'Basic Probability', importance: 3 },
            { name: 'Combined Events', importance: 3 },
            { name: 'Averages & Spread', importance: 2 },
          ],
        },
        { name: 'Trigonometry', importance: 3, subtopics: [], notInApp: true },
        { name: 'Vectors & 3D Geometry', importance: 3, subtopics: [], notInApp: true },
        { name: 'Matrices & Determinants', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'Analytical Ability & Logical Reasoning',
      weight: 24,
      questions: '40 Qs · +6 / −1.5',
      inApp: true,
      units: [
        {
          name: 'Series & Patterns',
          importance: 3,
          subtopics: [
            { name: 'Number Series', importance: 3 },
            { name: 'Squares & Cubes', importance: 2 },
            { name: 'Letter Series', importance: 2 },
          ],
        },
        {
          name: 'Coding-Decoding',
          importance: 2,
          subtopics: [
            { name: 'Letter Shifting', importance: 3 },
            { name: 'Number Codes', importance: 2 },
            { name: 'Word & Reverse Codes', importance: 1 },
          ],
        },
        {
          name: 'Blood Relations & Directions',
          importance: 3,
          subtopics: [
            { name: 'Blood Relations', importance: 3 },
            { name: 'Directions & Distance', importance: 3 },
          ],
        },
        { name: 'Puzzles & Arrangements', importance: 3, subtopics: [], notInApp: true },
        { name: 'Data Interpretation', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'Computer Awareness',
      weight: 12,
      questions: '20 Qs · +6 / −1.5',
      inApp: true,
      units: [
        {
          name: 'Computer Organisation',
          importance: 3,
          subtopics: [
            { name: 'CPU & Instructions', importance: 3 },
            { name: 'Memory', importance: 3 },
            { name: 'Data Units & Devices', importance: 2 },
          ],
        },
        {
          name: 'Number Systems',
          importance: 3,
          subtopics: [
            { name: 'Binary', importance: 3 },
            { name: 'Octal & Hexadecimal', importance: 3 },
            { name: 'Binary Arithmetic & Complements', importance: 3 },
          ],
        },
        {
          name: 'Boolean Algebra & Logic Gates',
          importance: 3,
          subtopics: [
            { name: 'Logic Gates', importance: 3 },
            { name: 'Boolean Laws', importance: 3 },
          ],
        },
        { name: 'Data Representation', importance: 1, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'General English',
      weight: 4,
      questions: '10 Qs · +4 / −1',
      inApp: true,
      units: [
        {
          name: 'Grammar',
          importance: 2,
          subtopics: [
            { name: 'Tenses & Verb Forms', importance: 2 },
            { name: 'Subject-Verb Agreement', importance: 2 },
            { name: 'Articles, Prepositions & Nouns', importance: 2 },
          ],
        },
        {
          name: 'Vocabulary',
          importance: 2,
          subtopics: [
            { name: 'Synonyms & Meanings', importance: 2 },
            { name: 'Antonyms', importance: 2 },
            { name: 'One-Word Substitution', importance: 1 },
          ],
        },
        {
          name: 'Sentence Improvement',
          importance: 2,
          subtopics: [
            { name: 'Tense & Verb Errors', importance: 2 },
            { name: 'Agreement Errors', importance: 2 },
            { name: 'Redundancy & Comparison', importance: 1 },
          ],
        },
        { name: 'Reading Comprehension', importance: 1, subtopics: [], notInApp: true },
      ],
    },
  ],
  books: [
    {
      subject: 'Mathematics',
      items: [
        {
          title: 'NCERT Mathematics, Class 11 & 12',
          author: 'NCERT',
          use: 'Build the basics of every topic first. NIMCET maths is class 11–12 level.',
        },
        {
          title: 'Objective Mathematics',
          author: 'R. D. Sharma',
          use: 'Large sets of MCQs by chapter, good for speed practice.',
        },
        {
          title: 'NIMCET previous years’ papers (any recent solved-papers book)',
          author: 'Various publishers',
          use: 'Learn the real level and repeating question types. Do at least 5 papers timed.',
        },
      ],
    },
    {
      subject: 'Analytical Ability & Logical Reasoning',
      items: [
        {
          title: 'A Modern Approach to Verbal & Non-Verbal Reasoning',
          author: 'R. S. Aggarwal',
          use: 'Covers series, coding, blood relations and directions with many solved examples.',
        },
        {
          title: 'Analytical Reasoning',
          author: 'M. K. Pandey',
          use: 'Harder puzzles and arrangements, close to NIMCET level.',
        },
      ],
    },
    {
      subject: 'Computer Awareness',
      items: [
        {
          title: 'Computer Fundamentals',
          author: 'Pradeep K. Sinha & Priti Sinha',
          use: 'Organisation, memory, devices and number systems in simple language.',
        },
        {
          title: 'Digital Logic and Computer Design',
          author: 'M. Morris Mano',
          use: 'Logic gates, Boolean algebra and complements, explained properly.',
        },
      ],
    },
    {
      subject: 'General English',
      items: [
        {
          title: 'High School English Grammar and Composition',
          author: 'Wren & Martin',
          use: 'The standard grammar reference for tenses, agreement and articles.',
        },
        {
          title: 'Objective General English',
          author: 'S. P. Bakshi',
          use: 'Synonyms, antonyms, one-word substitution and error spotting MCQs.',
        },
        {
          title: 'Word Power Made Easy',
          author: 'Norman Lewis',
          use: 'Grow vocabulary through word roots, a little every day.',
        },
      ],
    },
  ],
  plan: [
    'Start with Mathematics: it is 60% of the marks. Finish the orange (must-do) subtopics first.',
    'For each subtopic: read the notes, watch one video, then practise the rounds until you pass 60%.',
    'Do reasoning daily in short 20-minute sets; it rewards speed more than theory.',
    'Computer Awareness is small but scoring: number systems and logic gates are almost always asked.',
    'Revise from your Mistakes page every few days, and take a timed mock test every week.',
    'Negative marking is heavy in Maths (−3): skip a question unless you can remove two options.',
  ],
}

export default nimcet
