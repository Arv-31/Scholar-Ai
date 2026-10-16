import type { SyllabusMap } from '../types'

// Karnataka PGCET (MCA), conducted by KEA. The paper format (80 MCQs, 60 × 1 mark + 20 × 2 marks,
// no negative) is consistent across recent notices; the subject split varies by year, so the
// weights here are approximate. Check the latest KEA brochure.
const pgcet: SyllabusMap = {
  examCode: 'PGCET-MCA',
  pattern: [
    { label: 'Questions', value: '80 MCQs' },
    { label: 'Total marks', value: '100' },
    { label: 'Parts', value: '60 × 1 + 20 × 2' },
    { label: 'Time', value: '2 hours' },
    { label: 'Negative', value: 'None' },
  ],
  weightNote:
    'Karnataka PGCET (MCA) has 80 questions: Part A has 60 one-mark questions and Part B has 20 two-mark questions, 100 marks in all, with no negative marking. KEA does not fix the subject split every year, so these weights are approximate (around 40% mathematics, 20% computer awareness, 15% reasoning, 15% English, 10% general awareness). Unit and subtopic importance is ScholarAI’s estimate. Always check the latest KEA brochure (cetonline.karnataka.gov.in).',
  sections: [
    {
      subject: 'Quantitative Analysis',
      weight: 40,
      questions: '≈ 40 marks · no negative',
      inApp: true,
      units: [
        {
          name: 'Percentages & Profit',
          importance: 3,
          subtopics: [
            { name: 'Percentages', importance: 3 },
            { name: 'Profit, Loss & Discount', importance: 3 },
          ],
        },
        {
          name: 'Ratio, Time & Work',
          importance: 3,
          subtopics: [
            { name: 'Ratio & Proportion', importance: 3 },
            { name: 'Time & Work', importance: 3 },
            { name: 'Pipes & Cisterns', importance: 2 },
          ],
        },
        {
          name: 'Algebra & Number Series',
          importance: 3,
          subtopics: [
            { name: 'Linear Equations', importance: 3 },
            { name: 'Identities & Powers', importance: 2 },
            { name: 'Number Series', importance: 2 },
          ],
        },
        { name: 'Calculus & Differential Eqns', importance: 3, subtopics: [], notInApp: true },
        { name: 'Matrices & Determinants', importance: 2, subtopics: [], notInApp: true },
        { name: 'Probability & Statistics', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'Computer Awareness',
      weight: 20,
      questions: '≈ 20 marks · no negative',
      inApp: true,
      units: [
        {
          name: 'Computer Fundamentals',
          importance: 3,
          subtopics: [
            { name: 'History & Hardware', importance: 2 },
            { name: 'Software & Languages', importance: 3 },
            { name: 'Data Units', importance: 2 },
          ],
        },
        {
          name: 'Operating Systems & Software',
          importance: 3,
          subtopics: [
            { name: 'OS Basics', importance: 3 },
            { name: 'Processes, Scheduling & Memory', importance: 3 },
            { name: 'Files & Everyday Software', importance: 1 },
          ],
        },
        {
          name: 'Networking & Internet',
          importance: 2,
          subtopics: [
            { name: 'Internet & Web', importance: 2 },
            { name: 'Network Types & Devices', importance: 2 },
            { name: 'Protocols & Addressing', importance: 3 },
          ],
        },
        { name: 'C Programming & Data Structures', importance: 3, subtopics: [], notInApp: true },
        { name: 'Boolean Algebra & Logic', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'Analytical & Logical Reasoning',
      weight: 15,
      questions: '≈ 15 marks · no negative',
      inApp: true,
      units: [
        {
          name: 'Syllogisms',
          importance: 3,
          subtopics: [
            { name: '"All" Statements', importance: 3 },
            { name: '"Some" Statements', importance: 3 },
            { name: '"No" Statements', importance: 2 },
          ],
        },
        {
          name: 'Seating Arrangement',
          importance: 3,
          subtopics: [
            { name: 'Linear Rows', importance: 3 },
            { name: 'Circular & Square Tables', importance: 2 },
            { name: 'Ranking & Position', importance: 3 },
          ],
        },
        {
          name: 'Analogies & Odd One Out',
          importance: 2,
          subtopics: [
            { name: 'Word Analogies', importance: 2 },
            { name: 'Number & Letter Analogies', importance: 2 },
            { name: 'Odd One Out', importance: 2 },
          ],
        },
        { name: 'Coding & Blood Relations', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'English Language',
      weight: 15,
      questions: '≈ 15 marks · no negative',
      inApp: true,
      units: [
        {
          name: 'Grammar Usage',
          importance: 3,
          subtopics: [
            { name: 'Verbs & Tenses', importance: 3 },
            { name: 'Subject-Verb Agreement', importance: 3 },
            { name: 'Articles, Prepositions & Modifiers', importance: 2 },
          ],
        },
        {
          name: 'Synonyms & Antonyms',
          importance: 2,
          subtopics: [
            { name: 'Synonyms', importance: 2 },
            { name: 'Antonyms', importance: 2 },
          ],
        },
        {
          name: 'Sentence Completion',
          importance: 2,
          subtopics: [
            { name: 'Verb Forms', importance: 2 },
            { name: 'Connectors & Prepositions', importance: 2 },
            { name: 'Word Choice in Context', importance: 2 },
          ],
        },
        { name: 'Reading Comprehension', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'General Awareness',
      weight: 10,
      questions: '≈ 10 marks',
      inApp: false,
      units: [
        { name: 'Current Affairs', importance: 3, subtopics: [] },
        { name: 'Static GK (India & Karnataka)', importance: 2, subtopics: [] },
        { name: 'Science & Technology', importance: 2, subtopics: [] },
      ],
    },
  ],
  books: [
    {
      subject: 'Quantitative Analysis',
      items: [
        {
          title: 'Quantitative Aptitude for Competitive Examinations',
          author: 'R. S. Aggarwal',
          use: 'Percentages, ratio, time and work, equations: every arithmetic chapter with MCQs.',
        },
        {
          title: 'Higher Engineering Mathematics',
          author: 'B. S. Grewal',
          use: 'Reference for the degree-level parts: calculus, differential equations, matrices.',
        },
      ],
    },
    {
      subject: 'Computer Awareness',
      items: [
        {
          title: 'Computer Fundamentals',
          author: 'Pradeep K. Sinha & Priti Sinha',
          use: 'Hardware, software, operating systems and networks in simple language.',
        },
        {
          title: 'Let Us C',
          author: 'Yashavant Kanetkar',
          use: 'C programming basics, which PGCET asks under computer awareness.',
        },
        {
          title: 'Operating System Concepts',
          author: 'Silberschatz, Galvin & Gagne',
          use: 'Reference for scheduling, memory and processes (read only the basics chapters).',
        },
      ],
    },
    {
      subject: 'Analytical & Logical Reasoning',
      items: [
        {
          title: 'A Modern Approach to Verbal & Non-Verbal Reasoning',
          author: 'R. S. Aggarwal',
          use: 'Syllogisms, seating, analogies and odd one out with many solved examples.',
        },
      ],
    },
    {
      subject: 'English & General Awareness',
      items: [
        {
          title: 'High School English Grammar and Composition',
          author: 'Wren & Martin',
          use: 'Tenses, agreement, articles and prepositions.',
        },
        {
          title: 'Objective General English',
          author: 'S. P. Bakshi',
          use: 'Synonyms, antonyms and sentence completion practice.',
        },
        {
          title: 'Lucent’s General Knowledge',
          author: 'Lucent Publications',
          use: 'Compact static GK; add a monthly current-affairs digest for the last 6 months.',
        },
      ],
    },
  ],
  plan: [
    'There is no negative marking, so never leave a question blank: guess when you are unsure.',
    'Mathematics carries the most marks. Finish arithmetic (percentages, ratio, work) first: it is quick to learn.',
    'Part B questions are worth 2 marks each, so spend a little more time on them.',
    'For each subtopic: read the notes, watch one video, then practise the rounds until you pass 60%.',
    'Computer awareness: learn OS basics and networking protocols well; they repeat often.',
    'Read a newspaper summary daily for general awareness, and take a timed mock test every week.',
  ],
}

export default pgcet
