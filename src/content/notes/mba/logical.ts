import type { ExamNotes } from '../../types'

// MBA · Logical Reasoning. Drafted for ScholarAI; review before use.
const logical: ExamNotes = {
  'Number & Letter Series|Number Series': {
    paragraphs: [
      'Number series questions give a sequence that follows a hidden rule and ask for the next term, a missing term or the wrong term. They appear in nearly every MBA entrance in the reasoning or intelligence section. Most series use a small set of rules, so a fixed checking routine is faster than looking at each question fresh.',
      'Check in this order: differences between terms; second differences if the first are not constant; ratios when terms grow quickly; patterns like ×2 + 1 or ×3 − 2; squares and cubes nearby; primes; and finally alternate terms, in case two series are mixed. Limit yourself to about a minute per question; if no rule appears, move on and come back.',
      'Example: 6, 11, 21, 41, 81, ? doubles and subtracts 1 each time, so the answer is 161. In 3, 5, 9, 17, 33, the differences 2, 4, 8, 16 double, so the next term is 65. In 2, 12, 36, 80, 150, the terms are n³ + n², so 252 follows (6³ + 6² = 216 + 36). For a wrong-term question, the term that breaks an otherwise perfect rule is the answer.',
    ],
    keyPoints: [
      'Differences first, then second differences.',
      'Fast growth → ratios or ×k ± c.',
      'Check squares, cubes and n³ + n² patterns.',
      'Try alternate terms for zig-zag series.',
      'Spend at most about a minute per question.',
      'Wrong term = the one that breaks the rule.',
    ],
    formulasTitle: 'Patterns to try',
    formulas: [
      '×2 + 1, ×2 − 1, ×3 + 2',
      'Differences doubling: +2, +4, +8, +16',
      'n², n³, n² + n, n³ + n²',
      'Primes: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31',
    ],
  },
  'Number & Letter Series|Square-Based Series': {
    paragraphs: [
      'Many series are built on perfect squares, sometimes adjusted by adding or subtracting a number, or with gaps between the squares. Recognising squares instantly turns these questions from puzzles into quick marks. This subtopic is mostly about memory: squares up to 30 should be automatic.',
      'When terms look close to squares, compare each term with the nearest square: 3, 8, 15, 24, 35 are each one less than 4, 9, 16, 25, 36. Some series use squares of only odd or only even numbers, or squares of primes. Others use the differences between consecutive squares, which are the odd numbers 3, 5, 7, 9. Sums of squares and mixed square-plus-cube series also appear occasionally.',
      'Example: 2, 5, 10, 17, 26, ? is n² + 1, so 37 is next. 1, 9, 25, 49, ? are squares of odd numbers, so 81 follows. 4, 9, 25, 49, 121 are squares of primes (2, 3, 5, 7, 11), so 169 comes next. Saying the squares from 1 to 30 aloud every morning for a week is the simplest preparation for this subtopic.',
    ],
    keyPoints: [
      'Compare each term with the nearest square.',
      'n² ± 1 is the most common variation.',
      'Squares of odd numbers, even numbers or primes.',
      'Consecutive squares differ by odd numbers.',
      'Memorise squares to 30².',
      'Check for square + cube mixtures.',
    ],
    formulasTitle: 'Must-know squares',
    formulas: [
      '11² 121 · 12² 144 · 13² 169 · 14² 196 · 15² 225',
      '16² 256 · 17² 289 · 18² 324 · 19² 361 · 20² 400',
      '21² 441 · 22² 484 · 23² 529 · 24² 576 · 25² 625',
      '(n + 1)² − n² = 2n + 1',
    ],
  },
  'Number & Letter Series|Letter Series': {
    paragraphs: [
      'Letter series replace numbers with letters, but they work exactly like number series once each letter is turned into its position in the alphabet. Questions may use single letters, groups of letters, or a mix of letters and numbers. Fast letter-to-number conversion is the main skill.',
      'Use the EJOTY reference (E = 5, J = 10, O = 15, T = 20, Y = 25) to place any letter quickly. Write positions above the letters and find the pattern in the gaps. In groups like "AZ, BY, CX", treat each position separately: the first letters move forward and the second move backward. Opposite letters always add to 27 (A + Z = 1 + 26).',
      'Example: B, E, I, N, ? has gaps +3, +4, +5, so the next gap is +6 and N (14) becomes T (20). "AC, EG, IK, ?" moves each letter forward by 4, so the next group is MO. In "Z, X, U, Q, ?", the gaps are −2, −3, −4, so the next is −5, giving L. After Z the alphabet wraps back to A.',
    ],
    keyPoints: [
      'Convert letters to positions (A = 1).',
      'EJOTY: E 5, J 10, O 15, T 20, Y 25.',
      'Opposite letters add to 27.',
      'Treat each letter in a group as its own series.',
      'Gaps may grow: +3, +4, +5 …',
      'Wrap around after Z.',
    ],
    formulasTitle: 'Quick references',
    formulas: [
      'A1 E5 J10 O15 T20 Y25 Z26',
      'Opposite of n = 27 − n',
      'Pairs: AZ BY CX DW EV FU GT HS IR JQ KP LO MN',
    ],
  },
  'Direction Sense|Directions & Turns': {
    paragraphs: [
      'Direction sense questions describe a person walking and turning, and ask which way they face at the end or where they are relative to the start. They test spatial thinking. With a clear drawing habit, they become some of the fastest questions in the reasoning section.',
      'Draw a compass first: north up, south down, east right, west left. Track the direction the person is facing after each turn. A right turn is 90° clockwise and a left turn is 90° anticlockwise, both relative to the current facing direction. A "turn about" or "U-turn" reverses the direction. For angle turns such as 45°, use the intermediate directions north-east, south-east, south-west and north-west.',
      'Example: facing north, turn right (east), turn right again (south), then turn left (east): the person faces east. Facing west, turn 135° clockwise: west → north-west (45°) → north (90°) → north-east (135°), so they face north-east. Questions using "left" and "right" with people facing each other need extra care, because one person’s left is the other’s right.',
    ],
    keyPoints: [
      'Draw a compass: N up, E right.',
      'Turns are relative to the current facing direction.',
      'Right = 90° clockwise; left = 90° anticlockwise.',
      'U-turn reverses direction.',
      '45° steps use NE, SE, SW, NW.',
      'People facing each other: left and right swap.',
    ],
    formulasTitle: 'Turn table',
    formulas: [
      'N → right E → right S → right W → right N',
      'N → left W → left S → left E → left N',
      'Clockwise 45° steps: N, NE, E, SE, S, SW, W, NW',
      'Three right turns = one left turn',
    ],
  },
  'Direction Sense|Distance from Start': {
    paragraphs: [
      'Distance questions ask how far a person ends up from where they started after a series of walks and turns. The answer is the straight-line distance, not the total distance walked. The method is to add up all the east–west movement and all the north–south movement separately, then combine them with Pythagoras.',
      'Draw each walk to scale roughly, labelling the lengths. Take east as positive and west as negative, and north as positive and south as negative. Add each group to get the net horizontal and net vertical distances. The final distance is the square root of the sum of their squares, and the direction from the start is found from their signs, such as north-east when both are positive.',
      'Example: walk 6 km north, 8 km east, then 2 km south. Net north = 6 − 2 = 4 km, net east = 8 km, so the distance is √(16 + 64) = √80 ≈ 8.94 km, towards the north-east. If the net movement in one direction is zero, the answer is simply the other total. Common Pythagorean triples (3-4-5, 5-12-13, 8-15-17, 7-24-25) appear often, so recognising them saves time.',
    ],
    keyPoints: [
      'Straight-line distance, not total walked.',
      'Add east–west and north–south separately.',
      'Use signs: E and N positive, W and S negative.',
      'Distance = √(net x² + net y²).',
      'Direction comes from the signs of the totals.',
      'Spot Pythagorean triples to avoid square roots.',
    ],
    formulasTitle: 'Formulas',
    formulas: [
      'Net x = total east − total west',
      'Net y = total north − total south',
      'Distance = √(x² + y²)',
      'Triples: 3-4-5, 5-12-13, 8-15-17, 7-24-25',
    ],
  },
  'Direction Sense|Shadows & Clocks': {
    paragraphs: [
      'Some direction questions use the sun’s position to decide directions. In the morning the sun rises in the east, so shadows fall towards the west; in the evening the sun is in the west, so shadows fall towards the east. At noon in India the sun is roughly overhead and shadows are very short. Clock questions in this group use the positions of the hands as directions.',
      'For shadow questions, first decide the time of day and so where the sun is, then the shadow points the opposite way. Then work out which way the person is facing from where their shadow falls: if, in the morning, a person’s shadow falls to their right, the shadow points west, so their right side is west and they face south. For clock-direction questions, treat 12 as north and 3 as east when the question says so, then track the hands.',
      'Example: one morning, Ravi and Sita face each other, and Ravi’s shadow falls exactly to his left. The shadow points west, so his left is west and he faces north; Sita, facing him, faces south. In the evening, if a pole’s shadow falls to the right of a person, the shadow points east, so the person faces north. Write down sun → shadow → facing step by step to avoid mixing up directions.',
    ],
    keyPoints: [
      'Morning: sun east, shadow west.',
      'Evening: sun west, shadow east.',
      'Noon: very short shadow, about no direction.',
      'From the shadow’s side, work out the facing direction.',
      'People facing each other face opposite directions.',
      'Write sun → shadow → facing step by step.',
    ],
    formulasTitle: 'Rules',
    formulas: [
      'Morning: shadow points west',
      'Evening: shadow points east',
      'Shadow on the left (morning) → facing north',
      'Shadow on the right (morning) → facing south',
      'Clock as compass: 12 N, 3 E, 6 S, 9 W',
    ],
  },
  'Statement & Conclusion|Conclusions': {
    paragraphs: [
      'Statement-and-conclusion questions give a short statement and one or two conclusions, and ask which conclusions follow logically. A conclusion follows only if it must be true based on the statement alone, without outside knowledge or assumptions. These questions test careful, disciplined reading, which is a key skill for managers.',
      'Treat the statement as completely true, even if it seems unrealistic. A conclusion that adds new information, uses extreme words such as "all", "only", "always" or "never" without support, or depends on facts not in the statement, does not follow. A conclusion that restates the statement in other words, or follows directly from it, does follow. Answer options are usually "only I follows", "only II follows", "either I or II", "neither" and "both".',
      'Example: "Statement: All employees who complete the training will get a bonus. Conclusion I: Some employees will get a bonus. Conclusion II: Employees who do not complete the training will not get a bonus." Conclusion I does not follow, because we do not know that anyone completes the training. Conclusion II also does not follow, since the statement says nothing about the others. Use "either…or" only when the two conclusions are opposites and one must be true.',
    ],
    keyPoints: [
      'Accept the statement as true; add nothing.',
      'Extreme words (all, only, never) usually do not follow.',
      'A restated fact follows.',
      'Outside knowledge does not count.',
      '"Either/or" only for complementary pairs.',
      'Read every word of the statement carefully.',
    ],
    formulasTitle: 'Checks',
    formulas: [
      'Must it be true from the statement alone? → follows',
      'Needs extra facts? → does not follow',
      'Uses unsupported "all / only / never"? → does not follow',
      'Two opposite conclusions, one must be true → either I or II',
    ],
  },
  'Statement & Conclusion|Assumptions & Courses of Action': {
    paragraphs: [
      'An assumption is something the writer takes for granted, without stating it. A course of action is a practical step suggested to deal with a problem described in the statement. Both are common in MBA reasoning sections because they test judgment: understanding what lies behind a statement and what a sensible manager would do about a situation.',
      'For assumptions, ask: "must the writer believe this for the statement to make sense?" An advertisement saying "Join our coaching for guaranteed success" assumes people want success and that coaching can affect results; it does not assume that every student will join. For courses of action, a good action is practical, legal, directly addresses the problem and is not extreme. Actions such as "ban everything", "shut down the company" or "punish everyone" are usually too extreme.',
      'Example: "Statement: Many accidents occur at a junction due to speeding. Course I: Install speed cameras and signals at the junction. Course II: Ban all vehicles from the road." Course I follows; Course II is impractical and extreme. For an assumption question on "The government has increased the fuel tax to reduce pollution", the assumption is that higher prices will reduce fuel use. Choose the reasonable, moderate options that a sensible person would accept.',
    ],
    keyPoints: [
      'An assumption is unstated but needed for the statement.',
      'Ask: would the statement make sense without it?',
      'Good actions are practical, legal and moderate.',
      'Extreme actions (ban all, shut down) rarely follow.',
      'An action must address the stated problem directly.',
      'Avoid options based on personal opinion.',
    ],
    formulasTitle: 'Checks',
    formulas: [
      'Assumption: implicit + necessary for the statement',
      'Course of action: practical + solves the problem + not extreme',
      'Reject: bans, punishments for all, vague "should improve"',
      'Accept: specific, feasible steps by the right authority',
    ],
  },
}

export default logical
