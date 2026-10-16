import type { ExamNotes } from '../../types'

// NIMCET · Analytical Ability & Logical Reasoning. Drafted for ScholarAI; review before use.
const reasoning: ExamNotes = {
  'Series & Patterns|Number Series': {
    paragraphs: [
      'A number series is a list of numbers that follows a hidden rule, and the task is to find the next or the missing term. It is one of the most common question types in the reasoning section because it tests pattern recognition under time pressure. The rules are usually simple operations, such as adding, multiplying, squaring or alternating between two patterns, but they are hidden well enough that a method beats guessing.',
      'Start by writing the differences between consecutive terms under the series. If the differences are constant, it is an arithmetic pattern; if they themselves form a pattern (2, 4, 6, 8 or 3, 6, 12), the next difference follows from that. If the numbers grow very quickly, check ratios instead, or an "×2 + 1" type rule. If nothing works, split the series into odd and even positions: often two separate series are mixed together. Also compare terms with nearby squares and cubes.',
      'Example: 3, 7, 15, 31, ? doubles and adds 1 each time, so the next term is 63. In 2, 6, 12, 20, 30, the differences are 4, 6, 8, 10, so 42 comes next; these are also n(n + 1). For a missing-term question, check that your rule fits every term, not just the first few. With negative marking, if a pattern takes more than about a minute, mark it and move on, then return at the end.',
    ],
    keyPoints: [
      'First check differences, then second differences.',
      'Fast growth suggests multiplication or powers.',
      'Split alternate terms when the series zig-zags.',
      'Compare terms with nearby squares, cubes and primes.',
      'Your rule must fit every term, not just the first three.',
      'Skip after a minute; come back if time allows.',
    ],
    formulasTitle: 'Patterns to try',
    formulas: [
      'Constant difference: a, a + d, a + 2d …',
      'Growing difference: +2, +4, +6 … or +3, +6, +12 …',
      'Multiply-and-add: ×2 + 1, ×3 − 1 …',
      'n² ± k, n³ ± k, n(n + 1)',
      'Primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29',
      'Two series mixed at odd and even positions',
    ],
  },
  'Series & Patterns|Squares & Cubes': {
    paragraphs: [
      'Many reasoning series are built on squares and cubes, sometimes with a small number added or taken away. If you know the squares up to 30 and the cubes up to 15 by heart, you can recognise these patterns in seconds instead of computing differences. This subtopic is really about building that number sense, which also speeds up arithmetic in the maths section.',
      'When a series has terms like 1, 8, 27, 64, recognise the cubes at once. More often the terms are near squares or cubes: 2, 5, 10, 17, 26 is n² + 1, and 0, 7, 26, 63 is n³ − 1. Check whether each term is one more or one less than a perfect power, or whether the series alternates between squares and cubes. Sometimes the base itself jumps, as in squares of primes (4, 9, 25, 49, 121).',
      'Exam questions like "find the odd one out in 4, 16, 36, 64, 98" test the same skill: all except 98 are even squares. Another type asks for the next term in 1, 4, 27, 256, which is 1¹, 2², 3³, 4⁴, so the answer is 5⁵ = 3125. Spend ten minutes daily reciting squares and cubes until they become automatic; it is one of the cheapest ways to gain marks in reasoning.',
    ],
    keyPoints: [
      'Memorise squares to 30² and cubes to 15³.',
      'Check n² ± 1 and n³ ± 1 patterns first.',
      'Look for alternating squares and cubes.',
      'Squares of primes: 4, 9, 25, 49, 121, 169.',
      'nⁿ series: 1, 4, 27, 256, 3125.',
      'Odd-one-out often hides one non-square.',
    ],
    formulasTitle: 'Must-know values',
    formulas: [
      '11² = 121, 12² = 144, 13² = 169, 14² = 196, 15² = 225',
      '16² = 256, 17² = 289, 18² = 324, 19² = 361, 25² = 625',
      '6³ = 216, 7³ = 343, 8³ = 512, 9³ = 729, 10³ = 1000',
      '11³ = 1331, 12³ = 1728, 13³ = 2197, 15³ = 3375',
      '(n + 1)² − n² = 2n + 1',
    ],
  },
  'Series & Patterns|Letter Series': {
    paragraphs: [
      'A letter series uses letters of the alphabet instead of numbers, but the logic is the same: each letter moves forward or backward by a pattern. Because letters must be converted to positions, the key skill is quick conversion between a letter and its number (A = 1 to Z = 26). Once converted, a letter series is just a number series in disguise.',
      'Write the position of each letter above it, then find the differences. Patterns can be constant jumps (+2: B, D, F, H), growing jumps (+1, +2, +3), or reverse movement through the alphabet. Many questions use groups of letters such as AZ, BY, CX, where one letter moves forward and its partner moves backward. Use the reverse position too: a letter’s opposite is found with 27 − its position, so A pairs with Z and B with Y.',
      'Example: C, F, J, O, ? has jumps of +3, +4, +5, so the next jump is +6 and O (15) becomes U (21). For pairs like AZ, CX, EV, the first letters go +2 and the second letters go −2, so the next pair is GT. Learn the "EJOTY" trick: E = 5, J = 10, O = 15, T = 20, Y = 25, which lets you place any letter within a second. Questions that wrap past Z continue from A again.',
    ],
    keyPoints: [
      'Convert letters to positions: A = 1 … Z = 26.',
      'EJOTY: E 5, J 10, O 15, T 20, Y 25.',
      'Opposite letter = 27 − position (A ↔ Z, M ↔ N).',
      'Letter pairs often move in opposite directions.',
      'After Z, continue from A again.',
      'Treat each letter in a group as its own series.',
    ],
    formulasTitle: 'Quick references',
    formulas: [
      'A1 B2 C3 D4 E5 F6 G7 H8 I9 J10 K11 L12 M13',
      'N14 O15 P16 Q17 R18 S19 T20 U21 V22 W23 X24 Y25 Z26',
      'Opposite pairs: AZ, BY, CX, DW, EV, FU, GT, HS, IR, JQ, KP, LO, MN',
      'Position from the end = 27 − position from the start',
    ],
  },
  'Coding-Decoding|Letter Shifting': {
    paragraphs: [
      'In coding-decoding, a word is turned into a code by a fixed rule, and you must find the rule from one example and apply it to another word. Letter shifting is the most common rule: each letter is moved forward or backward in the alphabet by a fixed number of places, or by a changing number. It appears every year in NIMCET because it is quick to set and quick to solve once you see the method.',
      'Write the original word and its code one under the other, letter by letter, and note the shift for each position using letter positions. If every shift is the same, such as +2, apply it to the new word. If the shifts change, look for a pattern like +1, +2, +3 or alternating +1, −1. Sometimes the shift depends on the position in the word, or the word is reversed before shifting. Always test the rule on all letters of the example before using it.',
      'Example: if COLD is coded as DPME, every letter moves +1, so WARM becomes XBSN. If MAKE is written as OCMG, the shift is +2. For decoding questions the direction reverses: subtract the shift instead of adding it. Keep the EJOTY positions in mind for speed, and remember to wrap around: Y + 3 gives B. Many wrong options differ from the correct answer by a single letter, so check each letter of your answer.',
    ],
    keyPoints: [
      'Line up word and code letter by letter.',
      'Find the shift for every position, not just the first.',
      'Shifts may be constant, growing or alternating.',
      'Decoding = apply the shift in the opposite direction.',
      'Wrap around after Z (Y + 3 = B).',
      'Check every letter: wrong options differ by one letter.',
    ],
    formulasTitle: 'Method',
    formulas: [
      'Shift = position(code letter) − position(word letter)',
      'Coded letter = (position + shift), minus 26 if above 26',
      'Common rules: +1, −1, +2, alternating ±1, +1 +2 +3 …',
      'Also check: word reversed first, then shifted',
    ],
  },
  'Coding-Decoding|Number Codes': {
    paragraphs: [
      'In number coding, letters or words are converted to numbers, or numbers stand for letters. The most common rule replaces each letter with its alphabet position, but variations include the reverse position, the sum of positions, or a position multiplied by a fixed number. These questions reward careful arithmetic more than creativity.',
      'Begin with the simplest guess: replace each letter with its position (A = 1). If the code is a single number, try the sum of positions, then the product, then the sum multiplied by the number of letters. If the code digits do not match the positions, try the reverse positions (A = 26). In questions where a whole sentence is coded, compare two sentences that share a word: the common word gets the common code.',
      'Example: if CAT = 24, the positions 3 + 1 + 20 make 24, so DOG = 4 + 15 + 7 = 26. If BAD is written 214, each letter has been replaced by its position. For sentence codes like "sky is blue" = "ta na ka" and "blue is deep" = "ka ra na", the shared words "is" and "blue" share "na" and "ka", so "sky" must be "ta". Write the positions down rather than working in your head; one slip costs the full negative mark.',
    ],
    keyPoints: [
      'Try plain positions first, then reverse positions.',
      'Single-number codes: try sum, then product.',
      'Sentence codes: common words share common code words.',
      'Write positions down to avoid slips.',
      'Check the rule on the full example before applying.',
      'Watch for a rule using the number of letters.',
    ],
    formulasTitle: 'Rules to test',
    formulas: [
      'Letter → position (A = 1 … Z = 26)',
      'Letter → reverse position (27 − position)',
      'Word → sum of positions',
      'Word → sum × number of letters, or product of positions',
      'Sentences: compare pairs to isolate one word',
    ],
  },
  'Coding-Decoding|Word & Reverse Codes': {
    paragraphs: [
      'Some codes do not shift letters at all; they rearrange them. The word may be written backwards, its halves may be swapped, or pairs of letters may be exchanged. Another variety substitutes whole words: "if sky is called sea, and sea is called water, what do fish live in?" These questions are less frequent than letter shifting but are easy marks for a careful reader.',
      'For rearrangement codes, compare the positions of the letters, not their alphabet values. If the code is the word reversed (PEN → NEP), apply the same reversal. If it is in halves, split the word in the middle and see whether each half is reversed separately (MONKEY → NOMYEK). For substitution codes, follow the chain of names carefully and answer with the code word, not the real word: if water is called "sky", and fish live in water, the answer is "sky".',
      'Example: if FRIEND is coded as DNEIRF, the word is reversed, so CANDLE becomes ELDNAC. If GARDEN is coded as RAGNED, each half is reversed. In substitution questions the trap option is always the real answer; the examiner wants the coded name. Read each line of the chain once more before answering, because one missed link flips the answer.',
    ],
    keyPoints: [
      'Compare positions of letters, not their values.',
      'Check full reversal and half-by-half reversal.',
      'Pairs of letters may be swapped (AB CD → BA DC).',
      'Substitution: answer with the code word, not the real word.',
      'Follow the chain of names one link at a time.',
      'The real-world answer is usually the trap option.',
    ],
    formulasTitle: 'Patterns',
    formulas: [
      'Full reverse: PEN → NEP',
      'Halves reversed: MONKEY → NOM | YEK',
      'Pair swap: ABCDEF → BADCFE',
      'Substitution chain: A called B, B called C → answer with the name used',
    ],
  },
  'Blood Relations & Directions|Blood Relations': {
    paragraphs: [
      'Blood relation questions describe a family in words, such as "A is the brother of B’s mother", and ask how two people are related. They test whether you can turn a sentence into a clear family picture. NIMCET includes them often because they look confusing but become simple once you draw a family tree with a fixed set of symbols.',
      'Draw a small tree as you read. Put each generation on its own level, use a horizontal line for siblings and a double line for a married couple, and mark males and females with different symbols, such as + and −. Always start from the person at the end of the sentence and work backwards: in "the son of my father’s only brother", start with my father, go to his brother, then to his son, who is my cousin. Do not assume anyone’s gender unless the question states it.',
      'Example: "Pointing to a man, Riya says, ‘He is the son of my grandfather’s only son.’" Her grandfather’s only son is her father, so the man is her brother. Coded relations like A + B (A is the father of B) and A × B (A is the wife of B) are another common form; translate each symbol carefully. Watch for words like "only", which removes other possibilities and is usually the key to the answer.',
    ],
    keyPoints: [
      'Draw a tree: one level per generation.',
      'Start from the end of the sentence and work back.',
      'Never assume gender unless it is stated.',
      '"Only son/brother" is usually the key clue.',
      'Translate coded symbols one at a time.',
      'Mother’s or father’s brother = uncle; their child = cousin.',
    ],
    formulasTitle: 'Relation table',
    formulas: [
      'Father’s / mother’s father → grandfather',
      'Father’s / mother’s brother → uncle (paternal / maternal)',
      'Brother’s / sister’s son → nephew; daughter → niece',
      'Husband’s or wife’s brother → brother-in-law',
      'Uncle’s or aunt’s child → cousin',
      'Son’s wife → daughter-in-law',
    ],
  },
  'Blood Relations & Directions|Directions & Distance': {
    paragraphs: [
      'Direction sense questions describe someone walking: "Ravi walks 5 km north, turns right and walks 3 km…", and then ask where he is from the start, which direction he is facing, or how far he is from the starting point. They test spatial reasoning and simple geometry, and they appear in almost every reasoning section.',
      'Always draw. Put north at the top, east to the right, and start at a dot. Draw each step as a line, and when the person turns, remember that "right" and "left" depend on the direction they are currently facing, not on the paper: facing north, right is east; facing south, right is west. For the final distance, count the total east–west and north–south movement separately, then use Pythagoras on the two totals.',
      'Example: walk 4 km east, turn left and walk 3 km. Turning left from east means facing north, so the end point is 4 km east and 3 km north, and the straight distance is √(4² + 3²) = 5 km, towards the north-east. Shadow questions add the sun: in the morning the sun is in the east, so shadows fall to the west, and in the evening shadows fall to the east. Remember the common Pythagorean triples to avoid square roots.',
    ],
    keyPoints: [
      'Draw with north at the top and east on the right.',
      'Right and left depend on the direction being faced.',
      'Add up east–west and north–south moves separately.',
      'Final distance: Pythagoras on the two totals.',
      'Morning shadow → west; evening shadow → east.',
      'A right turn is 90° clockwise; a left turn is 90° anticlockwise.',
    ],
    formulasTitle: 'Rules',
    formulas: [
      'Facing N: right = E, left = W',
      'Facing E: right = S, left = N',
      'Facing S: right = W, left = E',
      'Distance = √(net east–west² + net north–south²)',
      'Triples: 3-4-5, 5-12-13, 6-8-10, 8-15-17',
    ],
  },
}

export default reasoning
