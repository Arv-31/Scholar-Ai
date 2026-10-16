import type { ExamNotes } from '../../types'

// MBA · General Knowledge. Static facts only (they do not change year to year).
// Pair these notes with 6 months of current affairs. Drafted for ScholarAI; review before use.
const gk: ExamNotes = {
  'Indian Economy & Business|Banking & Markets': {
    paragraphs: [
      'India’s banking system is led by the Reserve Bank of India (RBI), the central bank, which issues currency, regulates banks and controls money supply through monetary policy. The capital markets, where shares and bonds are traded, are regulated by the Securities and Exchange Board of India (SEBI). MBA exams ask about these institutions, their tools and key market terms, because managers need to understand the financial system.',
      'The RBI was set up in 1935 and nationalised in 1949; its headquarters are in Mumbai. It uses tools such as the repo rate (the rate at which it lends to banks), the reverse repo rate, the Cash Reserve Ratio (CRR, cash banks must keep with the RBI) and the Statutory Liquidity Ratio (SLR, assets banks must keep in liquid form). Raising these rates reduces money supply and helps control inflation. The Monetary Policy Committee, with six members, sets the repo rate. SEBI became a statutory body in 1992. India’s main stock exchanges are the BSE (founded 1875, Asia’s oldest) with the Sensex index of 30 companies, and the NSE with the Nifty 50 index.',
      'Typical questions: "Which body regulates stock markets in India?" (SEBI), "What does the repo rate mean?", "How many companies are in the Sensex?" (30), or "Where are the RBI’s headquarters?" (Mumbai). Learn the difference between a bull market (prices rising) and a bear market (prices falling), and between an IPO (a company’s first sale of shares to the public) and a follow-on offer. Current values of rates change often, so check the latest news before the exam.',
    ],
    keyPoints: [
      'RBI: set up 1935, nationalised 1949, HQ Mumbai.',
      'Repo = RBI lends to banks; reverse repo = banks park money with RBI.',
      'Higher repo / CRR → less money supply → lower inflation.',
      'SEBI regulates markets (statutory since 1992).',
      'Sensex: BSE, 30 companies; Nifty: NSE, 50 companies.',
      'Bull = rising market; bear = falling market.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'CRR: share of deposits kept as cash with the RBI',
      'SLR: share of deposits kept as gold, cash or govt securities',
      'MPC: 6 members, sets the repo rate',
      'IPO: Initial Public Offering',
      'NABARD: rural credit · SIDBI: small industries · EXIM Bank: trade',
    ],
  },
  'Indian Economy & Business|Economic Terms': {
    paragraphs: [
      'Economic terms are the vocabulary of business news: GDP, inflation, fiscal deficit, recession and so on. MBA entrances test whether you understand what these words mean, because they appear in passages, GK questions and interviews. Knowing the definitions also makes newspaper business pages much easier to read.',
      'Gross Domestic Product (GDP) is the total value of goods and services produced within a country in a year; GNP adds income earned by citizens abroad. Inflation is a general rise in prices, measured in India mainly by the Consumer Price Index (CPI) and the Wholesale Price Index (WPI). Deflation is a fall in prices, and stagflation is high inflation with slow growth. The fiscal deficit is the government’s total spending minus its total receipts excluding borrowings; it shows how much the government must borrow. A recession is usually two consecutive quarters of falling GDP.',
      'Typical questions: "What does CPI measure?", "What is the difference between fiscal deficit and revenue deficit?", "What is disinvestment?" (selling government shares in public-sector companies) or "What does FDI mean?" (foreign direct investment, long-term investment by foreigners in Indian businesses). Learn GST too: the Goods and Services Tax replaced many indirect taxes from 1 July 2017. Use simple examples to remember each term.',
    ],
    keyPoints: [
      'GDP = value of output inside the country in a year.',
      'Inflation measured by CPI (retail) and WPI (wholesale).',
      'Stagflation = high inflation + slow growth.',
      'Fiscal deficit = spending − receipts (excluding borrowing).',
      'Recession ≈ two quarters of falling GDP.',
      'GST launched 1 July 2017.',
    ],
    formulasTitle: 'Definitions',
    formulas: [
      'GNP = GDP + net income from abroad',
      'Fiscal deficit = total expenditure − (revenue + non-debt capital receipts)',
      'Revenue deficit = revenue expenditure − revenue receipts',
      'Primary deficit = fiscal deficit − interest payments',
      'FDI: long-term stake · FPI: shares/bonds, short-term',
    ],
  },
  'Indian Economy & Business|Government & Policy': {
    paragraphs: [
      'Government policy shapes the business environment through budgets, taxes, planning bodies and schemes. MBA exams ask about the Union Budget, policy institutions such as NITI Aayog, and major schemes and reforms. These questions reward steady newspaper reading, supported by a few stable facts that do not change from year to year.',
      'The Union Budget, called the Annual Financial Statement in Article 112 of the Constitution, is presented by the Finance Minister, usually on 1 February. NITI Aayog replaced the Planning Commission on 1 January 2015 as the government’s policy think tank, chaired by the Prime Minister. Fiscal policy is the government’s use of taxes and spending, while monetary policy is the RBI’s control of money and interest rates. Major reforms include the 1991 liberalisation (LPG: liberalisation, privatisation, globalisation), GST in 2017 and the Insolvency and Bankruptcy Code in 2016.',
      'Typical questions: "Which body replaced the Planning Commission?" (NITI Aayog), "Who presents the Union Budget?" (the Finance Minister), "In which year did India begin economic liberalisation?" (1991), or "Which article covers the Annual Financial Statement?" (112). Scheme questions change every year: read about new schemes in the six months before the exam, noting the ministry, the aim and the launch year.',
    ],
    keyPoints: [
      'Budget = Annual Financial Statement (Article 112).',
      'Usually presented on 1 February by the Finance Minister.',
      'NITI Aayog replaced the Planning Commission (2015).',
      'Fiscal policy = government; monetary policy = RBI.',
      '1991 reforms: liberalisation, privatisation, globalisation.',
      'For schemes: note ministry, aim and launch year.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'NITI Aayog: 1 Jan 2015, chaired by the PM',
      'GST Council: chaired by the Union Finance Minister',
      'Insolvency and Bankruptcy Code: 2016',
      'Finance Commission: Article 280, every 5 years',
      'Money bill: Article 110',
    ],
  },
  'Static GK (India)|Geography': {
    paragraphs: [
      'Indian geography questions cover the country’s size and position, its physical features (mountains, rivers, plateaus and coasts) and important facts about states. These are static facts that do not change, which makes them dependable marks if revised well. MBA exams usually ask straightforward one-line questions.',
      'India covers about 3.29 million square kilometres, making it the seventh-largest country by area. The Tropic of Cancer passes through eight Indian states, and the standard meridian of 82.5° E (Indian Standard Time) passes near Mirzapur in Uttar Pradesh. The Himalayas lie in the north, the Deccan Plateau in the south, and the Thar Desert in the west. The Ganga is the longest river within India; the Godavari is the longest river of peninsular India and is often called the Dakshin Ganga. India has 28 states and 8 union territories.',
      'Typical questions: "Which is the largest state by area?" (Rajasthan), "Which state has the largest population?" (Uttar Pradesh), "Which is the smallest state by area?" (Goa), "Which river is called the Dakshin Ganga?" (Godavari), or "Which strait separates India and Sri Lanka?" (Palk Strait). Use a blank map to practise: marking rivers, mountain ranges and states helps memory far more than reading lists.',
    ],
    keyPoints: [
      'India: ~3.29 million km², 7th largest by area.',
      '28 states and 8 union territories.',
      'IST meridian: 82.5° E, near Mirzapur.',
      'Largest state by area: Rajasthan; by population: Uttar Pradesh.',
      'Smallest state by area: Goa.',
      'Godavari = Dakshin Ganga.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'Tropic of Cancer crosses 8 states',
      'Palk Strait: India–Sri Lanka',
      'Longest river in India: Ganga',
      'Highest plateau: Ladakh; largest plateau: Deccan',
      'Largest freshwater lake: Wular (J&K)',
    ],
  },
  'Static GK (India)|States & Places': {
    paragraphs: [
      'This subtopic covers state capitals, famous places and the nicknames of cities, such as "Silicon Valley of India" for Bengaluru. MBA GK sections and interviews often ask such facts, especially those linked to business: industrial cities, ports and important institutions. They are simple to learn with lists and a little revision.',
      'Learn capitals in regional groups, for example the southern states together: Karnataka – Bengaluru, Tamil Nadu – Chennai, Kerala – Thiruvananthapuram, Telangana – Hyderabad. Then add city nicknames and their reasons, since the reason helps memory: Ahmedabad was called the "Manchester of India" for its textile mills, and Jaipur is the "Pink City" because of its painted buildings. Also note major ports and the industries of key cities.',
      'Typical questions: "Which city is called the Silicon Valley of India?" (Bengaluru), "Which city is known as the Pink City?" (Jaipur), "Which is the capital of Kerala?" (Thiruvananthapuram), or "Which city is called the financial capital of India?" (Mumbai). Some capitals and boundaries change over time, so confirm recent changes in current-affairs material before the exam.',
    ],
    keyPoints: [
      'Learn capitals in regional groups.',
      'Learn each nickname with its reason.',
      'Bengaluru = Silicon Valley of India.',
      'Mumbai = financial capital of India.',
      'Jaipur = Pink City; Ahmedabad = Manchester of India.',
      'Check recent boundary or capital changes in current affairs.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'Karnataka – Bengaluru · Tamil Nadu – Chennai · Kerala – Thiruvananthapuram',
      'Telangana – Hyderabad · Maharashtra – Mumbai · Gujarat – Gandhinagar',
      'Silicon Valley – Bengaluru · City of Lakes – Udaipur',
      'City of Joy – Kolkata · Pink City – Jaipur',
      'Spice Garden of India – Kerala',
    ],
  },
  'Static GK (India)|Culture & Symbols': {
    paragraphs: [
      'National symbols, classical dances and cultural heritage are popular GK topics because the facts are fixed and widely known. Questions ask about the national animal, bird, flower and song, the origin of the national emblem and motto, and which classical dance belongs to which state.',
      'The national animal is the tiger, the national bird the peacock, the national flower the lotus, the national tree the banyan and the national fruit the mango. The national anthem "Jana Gana Mana" was written by Rabindranath Tagore and takes about 52 seconds to sing; the national song "Vande Mataram" was written by Bankim Chandra Chatterjee. The national emblem is adapted from the Lion Capital of Ashoka at Sarnath, and its motto "Satyameva Jayate" comes from the Mundaka Upanishad. India’s Sangeet Natak Akademi recognises eight classical dances.',
      'Typical questions: "Bharatanatyam belongs to which state?" (Tamil Nadu), "Kathakali?" (Kerala), "Who wrote Vande Mataram?" (Bankim Chandra Chatterjee), or "From where is the national emblem taken?" (Sarnath). Pair each dance with its state as a list, and revise it twice; these questions are quick marks.',
    ],
    keyPoints: [
      'Tiger, peacock, lotus, banyan, mango.',
      'Anthem by Tagore (about 52 seconds).',
      'National song by Bankim Chandra Chatterjee.',
      'Emblem from the Lion Capital at Sarnath.',
      '"Satyameva Jayate" from the Mundaka Upanishad.',
      'Eight classical dances recognised.',
    ],
    formulasTitle: 'Dances & states',
    formulas: [
      'Bharatanatyam – Tamil Nadu · Kathakali – Kerala',
      'Kuchipudi – Andhra Pradesh · Odissi – Odisha',
      'Kathak – Uttar Pradesh · Manipuri – Manipur',
      'Mohiniyattam – Kerala · Sattriya – Assam',
      'National aquatic animal: Ganges river dolphin',
    ],
  },
  'Indian Polity|Constitution & Its Parts': {
    paragraphs: [
      'The Constitution of India is the supreme law of the country. It was adopted on 26 November 1949 and came into force on 26 January 1950, which is celebrated as Republic Day. It is the longest written constitution in the world and sets out the structure of government, the rights of citizens and the duties of the state. MBA GK sections regularly include polity questions.',
      'Dr B. R. Ambedkar chaired the Drafting Committee, and Dr Rajendra Prasad was the President of the Constituent Assembly. The Preamble describes India as a sovereign, socialist, secular, democratic republic; the words "socialist", "secular" and "integrity" were added by the 42nd Amendment in 1976. Fundamental Rights are in Part III (Articles 12–35), the Directive Principles of State Policy in Part IV (Articles 36–51), and the Fundamental Duties in Part IVA (Article 51A), added in 1976. The original Constitution had 395 articles, 22 parts and 8 schedules; it now has 12 schedules.',
      'Typical questions: "Who chaired the Drafting Committee?" (B. R. Ambedkar), "Which amendment added the word secular?" (42nd), "Which article is the right to constitutional remedies?" (Article 32, called the heart and soul of the Constitution by Ambedkar), or "Which article gives the right to life and personal liberty?" (Article 21). Make a short table of key articles and revise it often.',
    ],
    keyPoints: [
      'Adopted 26 Nov 1949; in force 26 Jan 1950.',
      'Drafting Committee chair: B. R. Ambedkar.',
      'Constituent Assembly President: Rajendra Prasad.',
      '42nd Amendment (1976): socialist, secular, integrity; Fundamental Duties.',
      'Fundamental Rights: Part III; DPSP: Part IV.',
      'Article 32 = heart and soul of the Constitution.',
    ],
    formulasTitle: 'Key articles',
    formulas: [
      'Art 14: equality before law',
      'Art 17: abolition of untouchability',
      'Art 21: right to life and personal liberty',
      'Art 32: constitutional remedies (writs)',
      'Art 51A: Fundamental Duties',
      'Art 368: amendment of the Constitution',
    ],
  },
  'Indian Polity|Parliament': {
    paragraphs: [
      'The Parliament of India makes the country’s laws. It has three parts: the President, the Lok Sabha (House of the People) and the Rajya Sabha (Council of States). Questions ask about the size of each house, terms of members, who presides, and how bills, especially money bills, are passed.',
      'The Lok Sabha has 543 elected seats, and its members serve five-year terms unless it is dissolved early; the minimum age is 25. The Speaker presides over it. The Rajya Sabha can have up to 250 members (238 elected and 12 nominated by the President for expertise in fields such as art, literature, science and social service). It is a permanent house that is never dissolved: one-third of its members retire every two years, and each serves six years; the minimum age is 30. The Vice-President is the ex-officio Chairman of the Rajya Sabha.',
      'Typical questions: "Who presides over a joint sitting of Parliament?" (the Speaker of the Lok Sabha, under Article 108), "Where can a money bill be introduced?" (only in the Lok Sabha, Article 110), "For how long can the Rajya Sabha hold a money bill?" (14 days), or "What is the quorum of either house?" (one-tenth of its members). The Speaker decides whether a bill is a money bill.',
    ],
    keyPoints: [
      'Parliament = President + Lok Sabha + Rajya Sabha.',
      'Lok Sabha: 543 elected seats, 5-year term, minimum age 25.',
      'Rajya Sabha: up to 250 members, permanent, 6-year terms, minimum age 30.',
      'Vice-President chairs the Rajya Sabha.',
      'Money bills start only in the Lok Sabha.',
      'The Speaker presides over joint sittings.',
    ],
    formulasTitle: 'Key articles',
    formulas: [
      'Art 79: Parliament',
      'Art 108: joint sitting',
      'Art 110: money bill (RS can delay 14 days)',
      'Art 112: Annual Financial Statement (Budget)',
      'Quorum: one-tenth of the total members',
    ],
  },
  'Indian Polity|President & Judiciary': {
    paragraphs: [
      'The President is the head of the Indian state, and the judiciary, led by the Supreme Court, interprets the Constitution and protects citizens’ rights. MBA polity questions ask how the President is elected, the President’s powers including emergencies and pardons, and the structure and powers of the Supreme Court and High Courts.',
      'The President is elected indirectly by an electoral college of the elected members of both houses of Parliament and the elected members of the state legislative assemblies (including Delhi and Puducherry). The term is five years, the minimum age is 35, and removal is by impeachment under Article 61. Emergency powers include a national emergency (Article 352), President’s rule in a state (Article 356) and a financial emergency (Article 360). The Supreme Court was set up on 28 January 1950 under Article 124; its judges retire at 65, and High Court judges at 62.',
      'Typical questions: "Under which article can the President grant pardons?" (Article 72), "Which writ means ‘to have the body’?" (habeas corpus), "Which article allows the Supreme Court to issue writs?" (Article 32; High Courts use Article 226), or "What is the retirement age of Supreme Court judges?" (65). The five writs are habeas corpus, mandamus, prohibition, certiorari and quo warranto; learn a one-line meaning for each.',
    ],
    keyPoints: [
      'President: indirectly elected, 5-year term, minimum age 35.',
      'Impeachment under Article 61; pardons under Article 72.',
      'Emergencies: Articles 352, 356, 360.',
      'Supreme Court: Article 124, set up 28 Jan 1950.',
      'Retirement: SC judges 65, HC judges 62.',
      'Writs: SC under Article 32, HCs under Article 226.',
    ],
    formulasTitle: 'Writs',
    formulas: [
      'Habeas corpus: produce the detained person',
      'Mandamus: order an official to do their duty',
      'Prohibition: stop a lower court acting beyond its powers',
      'Certiorari: transfer / quash a lower court’s order',
      'Quo warranto: "by what authority" a person holds an office',
    ],
  },
}

export default gk
