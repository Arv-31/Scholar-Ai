import type { ExamNotes } from '../../types'

// PGCET-MCA · Analytical & Logical Reasoning. Drafted for ScholarAI; review before use.
const reasoning: ExamNotes = {
  'Syllogisms|"All" Statements': {
    paragraphs: [
      'A syllogism gives two or more statements, which you must accept as true even if they sound strange, and asks which conclusions definitely follow. "All" statements, such as "All cats are animals", are the most common building block. They say that one group lies completely inside another. Getting these right depends on drawing the groups instead of using everyday knowledge.',
      'Draw each statement as circles (Venn diagrams). "All A are B" means circle A sits completely inside circle B. Then add the next statement to the same drawing. A conclusion follows only if it is true in every possible drawing that fits the statements. "All A are B" also gives "Some A are B" and "Some B are A", but it does not give "All B are A", because B can be bigger than A.',
      'Example: "All pens are books. All books are tables." Pens sit inside books, which sit inside tables, so "All pens are tables" follows, and so does "Some tables are pens". But "All tables are pens" does not follow. Ignore real-world facts: if the statements say "All fish are birds", treat it as true for the question. Draw quickly and keep the circles large enough to see overlaps clearly.',
    ],
    keyPoints: [
      'Accept the statements as true, even if they sound odd.',
      'All A are B → A’s circle inside B’s circle.',
      'All A are B gives Some A are B and Some B are A.',
      'All A are B does NOT give All B are A.',
      'A conclusion must hold in every possible diagram.',
      'Chain "All" statements: All A are B, All B are C → All A are C.',
    ],
    formulasTitle: 'Rules',
    formulas: [
      'All + All → All (A ⊂ B ⊂ C ⇒ A ⊂ C)',
      'All A are B → Some A are B (always)',
      'All A are B → Some B are A (always)',
      'All A are B ↛ All B are A',
    ],
  },
  'Syllogisms|"Some" Statements': {
    paragraphs: [
      '"Some" statements say that at least one member of a group belongs to another group, as in "Some books are pens". In logic, "some" means "at least one, possibly all". This is the most common source of mistakes in syllogisms, because in everyday speech "some" usually suggests "not all". In exams it never rules out "all".',
      'Draw "Some A are B" as two overlapping circles. When combining statements, remember that the overlap can be small, so do not assume a third group shares the overlap unless the statements force it. Two "some" statements together never give a definite conclusion between the end terms. "Some A are B" is reversible: it gives "Some B are A". "Some A are not B" is not reversible.',
      'Example: "Some cars are red. Some red things are toys." No conclusion follows about cars and toys, because the red cars and the red toys may be different red things. But "Some cars are red. All red things are toys" does give "Some cars are toys", because the red cars are inside the toys circle. "Either-or" answers appear when two conclusions cannot both be false, such as "Some A are C" and "No A are C" for the same pair.',
    ],
    keyPoints: [
      '"Some" means at least one, possibly all.',
      'Some A are B ⇔ Some B are A.',
      'Some + Some → no conclusion.',
      'Some + All → Some (when the middle term matches).',
      '"Some A are not B" cannot be reversed.',
      'Look for complementary pairs → "either-or".',
    ],
    formulasTitle: 'Rules',
    formulas: [
      'Some + Some → no definite conclusion',
      'Some A are B + All B are C → Some A are C',
      'All + Some → no definite conclusion (usually)',
      'Some A are B ⇒ Some B are A',
      'Either-or: "Some" and "No" on the same pair',
    ],
  },
  'Syllogisms|"No" Statements': {
    paragraphs: [
      '"No" statements, such as "No dogs are cats", say that two groups have nothing in common. They are drawn as two separate circles that do not touch. Negative statements produce negative conclusions, and combining them with positive statements follows a few fixed rules that are worth learning by heart.',
      '"No A are B" is reversible: it also means "No B are A". Combined with "All": "All A are B" and "No B are C" gives "No A are C", because A is inside B and B is completely separate from C. Combined with "Some": "Some A are B" and "No B are C" gives "Some A are not C". But "No A are B" and "No B are C" gives no conclusion about A and C, since A and C may or may not overlap.',
      'Example: "All roses are flowers. No flowers are trees." Then "No roses are trees" follows. "Some students are players. No players are singers" gives "Some students are not singers" only. A common trap is the option "Some singers are not students", which does not follow, because negative "some not" statements cannot be reversed. Draw the diagram, then test each conclusion against it.',
    ],
    keyPoints: [
      '"No A are B" → separate circles; reversible.',
      'All + No → No.',
      'Some + No → Some … not.',
      'No + No → no conclusion.',
      '"Some A are not C" does not give "Some C are not A".',
      'A negative statement always gives a negative conclusion.',
    ],
    formulasTitle: 'Rules',
    formulas: [
      'No A are B ⇔ No B are A',
      'All A are B + No B are C → No A are C',
      'Some A are B + No B are C → Some A are not C',
      'No + No → no definite conclusion',
    ],
  },
  'Seating Arrangement|Linear Rows': {
    paragraphs: [
      'Linear seating arrangement puts people in a straight row, facing one direction, and gives clues such as "A sits third from the left" or "B is between C and D". You must place everyone and then answer questions about positions. These questions take time, but they come in sets, so solving the arrangement once can answer several questions.',
      'Draw a row of blanks numbered from the left. Start with the clues that fix a definite position, then use clues about neighbours, then the clues that only rule things out. Note the facing direction: if people face north, their left is your left; if they face south, it is reversed. When a clue allows two possibilities, draw both cases side by side and continue until one breaks a later clue.',
      'Example: six people sit in a row facing north. "A is at one end, B is second to the right of A, C is next to B but not at an end." Put A at position 1; B is at position 3; C must be at 2 or 4, and if position 2 is ruled out by another clue, C is at 4. Questions like "who sits exactly in the middle?" have a clear answer only when the row has an odd number of seats. Always re-check every clue against the final arrangement.',
    ],
    keyPoints: [
      'Draw numbered blanks from the left.',
      'Place fixed positions first, then neighbours.',
      'Facing south reverses left and right.',
      'Draw both cases when a clue allows two options.',
      'Re-check every clue at the end.',
      'One arrangement usually answers 3–5 questions.',
    ],
    formulasTitle: 'Useful facts',
    formulas: [
      'Position from right = total − position from left + 1',
      '"Second to the right of A" → skip one seat',
      '"Between" may not mean immediately between',
      'Facing north: left = your left; facing south: reversed',
    ],
  },
  'Seating Arrangement|Circular & Square Tables': {
    paragraphs: [
      'In circular arrangements, people sit around a round table, usually facing the centre. Unlike a row, there is no fixed end, so the first person can be placed anywhere and everyone else is placed relative to them. Square tables are similar but have people at corners and middles of sides. These questions test careful handling of left and right.',
      'Draw a circle with the right number of seats. Place the person with the most clues first, at the top. When everyone faces the centre, their right is anticlockwise as you look at the drawing from above, and their left is clockwise. If some face outward, reverse it for those people only. Mark each person as you place them, and keep notes of clues that only exclude positions.',
      'Example: eight people sit around a table facing the centre. "A sits second to the right of B" means you start at B and move two seats anticlockwise. "C sits opposite A" means four seats away in an eight-seat circle. With n people, the person directly opposite is n/2 seats away. Number of ways to arrange n people in a circle is (n − 1)!, which sometimes appears as a direct question.',
    ],
    keyPoints: [
      'Facing centre: right = anticlockwise, left = clockwise.',
      'Facing outside: reverse left and right.',
      'Start with the person who has the most clues.',
      'Opposite seat = n/2 seats away (n even).',
      'Square tables: mark corners and sides separately.',
      'Arrangements in a circle: (n − 1)!',
    ],
    formulasTitle: 'Useful facts',
    formulas: [
      'Facing centre: right → anticlockwise',
      'Opposite person: n/2 seats away',
      'Circular arrangements: (n − 1)!',
      'Necklace / bracelet (flip allowed): (n − 1)!/2',
    ],
  },
  'Seating Arrangement|Ranking & Position': {
    paragraphs: [
      'Ranking questions tell you a person’s position from one end of a row or a class list and ask for their position from the other end, or the total number of people. Comparison questions say who is taller, heavier or richer than whom, and ask who is first or last. Both types are quick marks once you know the single formula and draw the order.',
      'For position questions, use: total = position from the left + position from the right − 1. For questions with two people and people between them, add carefully and check whether the positions overlap. For comparisons, write the people in order as a line from greatest to least, adding each clue as you read. If a clue cannot be placed yet, keep it aside and come back.',
      'Example: Ravi is 12th from the left and 18th from the right in a row, so the row has 12 + 18 − 1 = 29 people. If A is 7th from the top and B is 12th from the bottom in a class of 30, and they do not overlap, the number of students between them is 30 − (7 + 12) = 11. In "P is taller than Q but shorter than R, and S is the tallest", the order is S > R > P > Q.',
    ],
    keyPoints: [
      'Total = left position + right position − 1.',
      'Position from right = total − left + 1.',
      'Between two people: total − (sum of their end positions).',
      'Check whether the two positions overlap.',
      'For comparisons, write a single ordered line.',
      'Hold unplaceable clues aside and return.',
    ],
    formulasTitle: 'Formulas',
    formulas: [
      'Total = L + R − 1',
      'R = Total − L + 1',
      'Between (no overlap) = Total − (A + B)',
      'Between (overlap) = (A + B) − Total − 2',
    ],
  },
  'Analogies & Odd One Out|Word Analogies': {
    paragraphs: [
      'An analogy shows a relationship between two words and asks you to find another pair with the same relationship, written like "Doctor : Hospital :: Teacher : ?". The answer here is "School", because the relationship is "works in". The skill is naming the relationship precisely, so that you can pick it out among options that are related in other ways.',
      'Make a short sentence that links the first pair: "A doctor works in a hospital". Then test each option in the same sentence. Common relationships include worker and workplace, tool and user, part and whole, cause and effect, object and function, animal and young one, and synonym or antonym pairs. If more than one option fits, make your sentence more specific.',
      'Example: "Pen : Write :: Knife : ?" uses object and function, so the answer is "Cut". "Puppy : Dog :: Calf : ?" is young one and adult, so "Cow". "Petal : Flower :: Page : ?" is part and whole, so "Book". Watch the order: "Hospital : Doctor" reverses the relationship and needs the answer in the same reversed order. Always keep the direction of the first pair.',
    ],
    keyPoints: [
      'Name the relationship as a short sentence.',
      'Test each option in that sentence.',
      'Keep the direction of the first pair.',
      'Make the sentence more specific if two options fit.',
      'Common types: part–whole, tool–use, worker–place.',
      'Young ones: puppy–dog, calf–cow, kid–goat, cub–lion.',
    ],
    formulasTitle: 'Common relations',
    formulas: [
      'Worker : Place — doctor : hospital, chef : kitchen',
      'Object : Function — pen : write, knife : cut',
      'Part : Whole — petal : flower, page : book',
      'Young : Adult — calf : cow, cub : lion, kid : goat',
      'Unit : Quantity — metre : length, ampere : current',
    ],
  },
  'Analogies & Odd One Out|Number & Letter Analogies': {
    paragraphs: [
      'Number and letter analogies apply the same idea to symbols: "3 : 27 :: 4 : ?" or "AC : BD :: EG : ?". You must find the rule that turns the first term into the second and apply it to the third. The rules are usually powers, multiplication, adding a fixed amount, or shifting letters by a fixed number of places.',
      'For numbers, check the simplest relations in order: square (n²), cube (n³), n² ± 1, n × k, n + k, and n(n + 1). Verify the rule on the given pair, then apply it. For letters, convert each to its alphabet position (A = 1 … Z = 26), find the shift, and apply it to the new letters. In letter groups, each position may follow its own shift.',
      'Example: 3 : 27 is n³, so 4 : 64. 5 : 26 is n² + 1, so 7 : 50. AC : BD shifts each letter by +1, so EG : FH. "CAT : DBU" shifts each letter by +1, so "DOG : EPH". When two rules fit the first pair (for example 2 : 4 could be ×2 or n²), check which one gives an option; if both do, look for a second example in the question.',
    ],
    keyPoints: [
      'Try n², n³, n² ± 1, ×k, +k in that order.',
      'Verify the rule on the given pair first.',
      'Letters: convert to positions and find the shift.',
      'Each letter of a group may have its own shift.',
      'If two rules fit, check which matches an option.',
      'Wrap from Z back to A.',
    ],
    formulasTitle: 'Rules to try',
    formulas: [
      'n : n², n : n³, n : n² + 1, n : n³ − 1',
      'n : n(n + 1), n : 2n + 1',
      'Letter shift: +1, +2, −1, opposite letter (27 − n)',
      'EJOTY: E5 J10 O15 T20 Y25',
    ],
  },
  'Analogies & Odd One Out|Odd One Out': {
    paragraphs: [
      'Odd-one-out questions give four or five items, words, numbers or letter groups, where all but one share a property. You must find the one that does not belong. The difficulty is that more than one property can be found, so the right answer is the item that breaks the most obvious and specific shared rule.',
      'For words, group by category (fruits, tools, countries), by function, or by a feature such as "lives in water". For numbers, check whether they are all even, odd, prime, perfect squares, cubes or multiples of a number. For letter groups, check the gaps between letters or the use of vowels. Find a rule that fits exactly four items; if you find one, the fifth is your answer.',
      'Example: in "Rose, Lotus, Lily, Mango, Jasmine", Mango is a fruit and the rest are flowers. In "9, 16, 25, 35, 49", 35 is not a perfect square. In "2, 3, 5, 9, 11", 9 is not prime. In letter groups "ACE, BDF, CEG, DFI", the first three have gaps of +2 and DFI breaks the pattern. If two items look odd, choose the one that breaks the stronger, more specific rule.',
    ],
    keyPoints: [
      'Find a rule that fits exactly four items.',
      'Words: category, function or feature.',
      'Numbers: even/odd, prime, squares, cubes, multiples.',
      'Letter groups: compare the gaps between letters.',
      'Prefer the most specific shared rule.',
      'Primes below 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.',
    ],
    formulasTitle: 'Checks',
    formulas: [
      'Numbers: prime? square? cube? multiple of 3, 7, 11?',
      'Sum of digits pattern (e.g. all add to 9)',
      'Letter gaps: +1, +2, +3 or vowels / consonants',
      'Words: category, use, habitat, country / capital',
    ],
  },
}

export default reasoning
