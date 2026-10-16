import type { SyllabusMap } from '../types'

// MBA entrance. There is no single MBA exam; this map follows the MAT pattern
// (5 sections × 30 questions). KMAT, CMAT and others are close but not identical.
const mba: SyllabusMap = {
  examCode: 'MBA',
  pattern: [
    { label: 'Questions', value: '150 MCQs' },
    { label: 'Sections', value: '5 × 30 Qs' },
    { label: 'Time', value: '2 hours' },
    { label: 'Marking', value: '+1 / −0.25' },
    { label: 'Pattern', value: 'MAT style' },
  ],
  weightNote:
    'There is no single MBA entrance exam. This map follows the MAT pattern: five sections of 30 questions each, +1 for a right answer and −0.25 for a wrong one (many notices say the Indian & Global Environment section has no negative marks, and some institutes ignore it). KMAT has no GK section and CMAT adds Innovation & Entrepreneurship. Unit and subtopic importance is ScholarAI’s estimate. Always check your exam’s own notice.',
  sections: [
    {
      subject: 'Quantitative Aptitude',
      weight: 20,
      questions: '30 Qs · +1 / −0.25',
      inApp: true,
      units: [
        {
          name: 'Percentages & Profit-Loss',
          importance: 3,
          subtopics: [
            { name: 'Percentages', importance: 3 },
            { name: 'Profit & Loss', importance: 3 },
            { name: 'Discounts & Mark-up', importance: 2 },
          ],
        },
        {
          name: 'Time, Speed & Distance',
          importance: 3,
          subtopics: [
            { name: 'Speed, Time & Distance Basics', importance: 3 },
            { name: 'Trains & Relative Speed', importance: 3 },
            { name: 'Average Speed & Boats', importance: 2 },
          ],
        },
        {
          name: 'Simple & Compound Interest',
          importance: 2,
          subtopics: [
            { name: 'Simple Interest', importance: 2 },
            { name: 'Compound Interest', importance: 3 },
          ],
        },
        { name: 'Ratio, Mixtures & Averages', importance: 3, subtopics: [], notInApp: true },
        { name: 'Algebra & Geometry', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'Verbal Ability',
      weight: 20,
      questions: '30 Qs · +1 / −0.25',
      inApp: true,
      units: [
        {
          name: 'Vocabulary',
          importance: 2,
          subtopics: [
            { name: 'Synonyms', importance: 2 },
            { name: 'Antonyms', importance: 2 },
          ],
        },
        {
          name: 'Idioms & Phrases',
          importance: 2,
          subtopics: [
            { name: 'Talking & Secrets', importance: 1 },
            { name: 'Work & Effort', importance: 2 },
            { name: 'Feelings & Situations', importance: 2 },
          ],
        },
        {
          name: 'Error Spotting',
          importance: 3,
          subtopics: [
            { name: 'Subject-Verb Agreement', importance: 3 },
            { name: 'Nouns, Pronouns & Comparatives', importance: 2 },
            { name: 'Tenses & Correct Sentences', importance: 3 },
          ],
        },
        { name: 'Reading Comprehension', importance: 3, subtopics: [], notInApp: true },
        { name: 'Para Jumbles', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'Data Analysis & Sufficiency',
      weight: 20,
      questions: '30 Qs · +1 / −0.25',
      inApp: false,
      units: [
        { name: 'Tables & Bar Charts', importance: 3, subtopics: [] },
        { name: 'Pie & Line Graphs', importance: 3, subtopics: [] },
        { name: 'Data Sufficiency', importance: 2, subtopics: [] },
      ],
    },
    {
      subject: 'Logical Reasoning',
      weight: 20,
      questions: '30 Qs · +1 / −0.25',
      inApp: true,
      units: [
        {
          name: 'Number & Letter Series',
          importance: 3,
          subtopics: [
            { name: 'Number Series', importance: 3 },
            { name: 'Square-Based Series', importance: 2 },
            { name: 'Letter Series', importance: 2 },
          ],
        },
        {
          name: 'Direction Sense',
          importance: 2,
          subtopics: [
            { name: 'Directions & Turns', importance: 2 },
            { name: 'Distance from Start', importance: 2 },
            { name: 'Shadows & Clocks', importance: 1 },
          ],
        },
        {
          name: 'Statement & Conclusion',
          importance: 3,
          subtopics: [
            { name: 'Conclusions', importance: 3 },
            { name: 'Assumptions & Courses of Action', importance: 3 },
          ],
        },
        { name: 'Arrangements & Puzzles', importance: 3, subtopics: [], notInApp: true },
        { name: 'Coding & Blood Relations', importance: 2, subtopics: [], notInApp: true },
      ],
    },
    {
      subject: 'General Knowledge',
      weight: 20,
      questions: '30 Qs · +1 · often no negative',
      inApp: true,
      units: [
        {
          name: 'Indian Economy & Business',
          importance: 3,
          subtopics: [
            { name: 'Banking & Markets', importance: 3 },
            { name: 'Economic Terms', importance: 2 },
            { name: 'Government & Policy', importance: 2 },
          ],
        },
        {
          name: 'Static GK (India)',
          importance: 2,
          subtopics: [
            { name: 'Geography', importance: 2 },
            { name: 'States & Places', importance: 1 },
            { name: 'Culture & Symbols', importance: 1 },
          ],
        },
        {
          name: 'Indian Polity',
          importance: 2,
          subtopics: [
            { name: 'Constitution & Its Parts', importance: 2 },
            { name: 'Parliament', importance: 2 },
            { name: 'President & Judiciary', importance: 2 },
          ],
        },
        { name: 'Current Affairs & Business News', importance: 3, subtopics: [], notInApp: true },
      ],
    },
  ],
  books: [
    {
      subject: 'Quantitative Aptitude',
      items: [
        {
          title: 'How to Prepare for Quantitative Aptitude for the CAT',
          author: 'Arun Sharma',
          use: 'Concepts with graded exercises; more than enough for MAT/KMAT level.',
        },
        {
          title: 'Quantitative Aptitude for Competitive Examinations',
          author: 'R. S. Aggarwal',
          use: 'Easier start: many solved arithmetic problems by chapter.',
        },
      ],
    },
    {
      subject: 'Verbal Ability',
      items: [
        {
          title: 'How to Prepare for Verbal Ability and Reading Comprehension for the CAT',
          author: 'Arun Sharma & Meenakshi Upadhyay',
          use: 'Reading comprehension, para jumbles, grammar and vocabulary.',
        },
        {
          title: 'Word Power Made Easy',
          author: 'Norman Lewis',
          use: 'Vocabulary through word roots; 20 minutes a day.',
        },
      ],
    },
    {
      subject: 'Reasoning & Data Analysis',
      items: [
        {
          title: 'How to Prepare for Logical Reasoning for the CAT',
          author: 'Arun Sharma',
          use: 'Series, arrangements, statements and conclusions.',
        },
        {
          title: 'How to Prepare for Data Interpretation for the CAT',
          author: 'Arun Sharma',
          use: 'Tables, charts and data sufficiency (a full MAT section).',
        },
      ],
    },
    {
      subject: 'General Knowledge',
      items: [
        {
          title: 'Lucent’s General Knowledge',
          author: 'Lucent Publications',
          use: 'Static GK: polity, geography, economy basics.',
        },
        {
          title: 'Manorama Yearbook',
          author: 'Malayala Manorama',
          use: 'Yearly facts and business awards; use with a daily business newspaper.',
        },
      ],
    },
  ],
  plan: [
    'All five sections carry equal marks, so do not skip any one completely.',
    'Quant and reasoning are the most scoring: practise a timed 20-question set every day.',
    'For each subtopic: read the notes, watch one video, then practise the rounds until you pass 60%.',
    'Read one editorial and the business page daily: it trains reading speed and GK together.',
    'Wrong answers cost 0.25: guess only when you can remove at least one option.',
    'Revise from your Mistakes page every few days, and take a timed mock test every week.',
  ],
}

export default mba
