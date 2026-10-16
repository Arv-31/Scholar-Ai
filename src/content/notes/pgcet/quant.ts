import type { ExamNotes } from '../../types'

// PGCET-MCA · Quantitative Analysis. Drafted for ScholarAI; review before use.
const quant: ExamNotes = {
  'Percentages & Profit|Percentages': {
    paragraphs: [
      'A percentage is a fraction out of 100: 25% means 25 out of every 100, or one quarter. Percentages are the base of most arithmetic in aptitude tests, because profit and loss, interest, discounts and data interpretation all use them. In PGCET, percentage questions are short, but they reward fast mental conversion between percentages, fractions and decimals.',
      'Learn the common fraction equivalents so you can calculate without long division: 50% = 1/2, 25% = 1/4, 20% = 1/5, 12.5% = 1/8, 33⅓% = 1/3 and 16⅔% = 1/6. To find x% of a number, multiply by x/100. To find a percentage change, divide the change by the original value. For successive changes, do not add the percentages; use the formula a + b + ab/100, or multiply the factors (for example 1.10 × 0.90).',
      'Example: a price rises by 20% and then falls by 20%; the net change is 20 − 20 − 400/100 = −4%, a 4% loss, not zero. If A’s salary is 25% more than B’s, then B’s is 20% less than A’s, because the base changes: 25/125 = 20%. Population questions use repeated growth, P(1 + r/100)ⁿ. Always identify the base (the "of" or "than" value) before calculating, because the base decides the answer.',
    ],
    keyPoints: [
      'Percentage change = change ÷ original × 100.',
      'Successive changes are not simply added.',
      'Up 20% then down 20% = 4% down overall.',
      'If A is r% more than B, B is r/(100 + r) × 100% less than A.',
      'Learn fraction equivalents to calculate fast.',
      'Always find the base value first.',
    ],
    formulas: [
      'x% of N = (x/100) × N',
      'Change % = (new − old)/old × 100',
      'Successive a% and b%: a + b + ab/100',
      'A is r% more than B → B is [r/(100 + r)] × 100% less',
      'Growth: P(1 + r/100)ⁿ',
      '1/8 = 12.5%, 1/6 = 16⅔%, 1/3 = 33⅓%',
    ],
  },
  'Percentages & Profit|Profit, Loss & Discount': {
    paragraphs: [
      'Profit and loss compare the cost price (CP), what the seller paid, with the selling price (SP), what the buyer paid. If SP is above CP there is a profit; if below, a loss. Discount is a reduction on the marked price (MP), the price printed on the item. These questions appear in nearly every aptitude test because they combine percentages with simple reasoning.',
      'Profit and loss percentages are always calculated on the cost price, while discount percentages are always calculated on the marked price. This is the most important rule in the topic. Turn a percentage into a multiplier to save time: a 20% profit means SP = 1.2 × CP, and a 10% discount means SP = 0.9 × MP. Two successive discounts of a% and b% equal a single discount of a + b − ab/100.',
      'Example: an item costing ₹800 is sold for ₹1000; profit = 200, and profit% = 200/800 = 25%. A shopkeeper marks goods 40% above cost and gives a 10% discount: SP = 1.4 × 0.9 = 1.26 times CP, so the profit is 26%. If an article is sold at two prices, one at a gain and one at a loss, set up the equation with CP as the unknown. A dishonest seller using a lighter weight gains (true weight − false weight)/false weight × 100%.',
    ],
    keyPoints: [
      'Profit / loss % is always on the cost price.',
      'Discount % is always on the marked price.',
      'Use multipliers: 20% profit → × 1.2.',
      'Two discounts a%, b% = a + b − ab/100.',
      'Mark-up then discount: multiply the factors.',
      'False weight gain = error / false weight × 100.',
    ],
    formulas: [
      'Profit% = (SP − CP)/CP × 100',
      'SP = CP × (100 + profit%)/100',
      'Discount% = (MP − SP)/MP × 100',
      'Successive discounts: a + b − ab/100',
      'False weight gain% = (true − false)/false × 100',
    ],
  },
  'Ratio, Time & Work|Ratio & Proportion': {
    paragraphs: [
      'A ratio compares two quantities of the same kind, such as 3 : 2, and a proportion says that two ratios are equal, such as 3 : 2 = 6 : 4. Ratio questions ask you to share an amount, combine ratios, or find a missing value. They also sit inside mixtures, partnerships and ages, so a clear method here helps across many topics.',
      'To divide an amount in the ratio a : b, add the parts (a + b) and give each person their share of the total. To combine ratios A : B and B : C into A : B : C, make the common term B the same in both by multiplying. In a proportion a : b = c : d, the product of the extremes equals the product of the means, so ad = bc. In partnerships, profit is shared in the ratio of capital × time.',
      'Example: ₹1200 shared in 3 : 5 gives 450 and 750. If A : B = 2 : 3 and B : C = 4 : 5, make B equal to 12: A : B : C = 8 : 12 : 15. If A invests ₹5000 for 12 months and B ₹6000 for 8 months, profit is shared 60,000 : 48,000 = 5 : 4. For questions like "what must be added to make the ratio…", let the number be x and set up a proportion. Keep the units the same before comparing.',
    ],
    keyPoints: [
      'Share = (part ÷ total parts) × amount.',
      'Combine ratios by matching the common term.',
      'In a proportion, ad = bc.',
      'Partnership profit ∝ capital × time.',
      'Use x as the unknown and set up a proportion.',
      'Convert to the same units first.',
    ],
    formulas: [
      'Share of A in a : b = a/(a + b) × total',
      'a : b = c : d → ad = bc',
      'Mean proportional of a and b = √(ab)',
      'Third proportional of a, b = b²/a',
      'Partnership: profit ratio = C₁T₁ : C₂T₂',
    ],
  },
  'Ratio, Time & Work|Time & Work': {
    paragraphs: [
      'Time and work questions ask how long people or machines take to finish a job, alone or together. The key idea is the work rate: if someone finishes a job in n days, they do 1/n of the job each day. Rates can be added when people work together, which turns most questions into quick fraction sums.',
      'Convert every worker’s time into a daily rate. Add the rates for people working together, and take the reciprocal to get the time. A faster method is the LCM approach: take the total work as the LCM of the given days, find each person’s daily units, then divide. If one person leaves partway, calculate the work done before they left and the remaining work separately. Efficiency is inversely proportional to time: twice as efficient means half the time.',
      'Example: A takes 10 days and B takes 15 days. Using total work = 30 units, A does 3 units a day and B 2, so together 5 units a day, finishing in 6 days. If A is twice as fast as B and together they finish in 12 days, B alone takes 36 days and A 18. For "men and days" questions, use M₁D₁H₁ = M₂D₂H₂, adding work amount W when the jobs differ.',
    ],
    keyPoints: [
      'Rate = 1 / time; add rates when working together.',
      'LCM method: total work = LCM of the days.',
      'Twice as efficient = half the time.',
      'Split the job into parts when someone leaves.',
      'Men × days × hours stays constant for the same work.',
      'Check whether the answer is in days or hours.',
    ],
    formulas: [
      'Together: 1/T = 1/A + 1/B',
      'Time together = AB/(A + B)',
      'M₁D₁H₁/W₁ = M₂D₂H₂/W₂',
      'Work done = rate × time',
      'Efficiency ∝ 1/time',
    ],
  },
  'Ratio, Time & Work|Pipes & Cisterns': {
    paragraphs: [
      'Pipes and cisterns is the time-and-work idea applied to tanks of water. Inlet pipes fill the tank, which counts as positive work, and outlet pipes or leaks empty it, which counts as negative work. The questions ask how long it takes to fill or empty a tank when several pipes are open, or how long a leak takes to empty it alone.',
      'Treat each pipe as a rate: an inlet that fills the tank in a hours adds 1/a of the tank each hour, and an outlet that empties it in b hours removes 1/b each hour. Add the inlet rates, subtract the outlet rates, and take the reciprocal of the net rate. The LCM method works here too: let the tank’s capacity be the LCM of the times, then add or subtract litres per hour.',
      'Example: pipe A fills a tank in 12 hours and pipe B empties it in 18 hours. Net rate = 1/12 − 1/18 = 1/36, so the tank fills in 36 hours. With a capacity of 36 units, A adds 3 units per hour and B removes 2, giving 1 unit per hour net. For leak questions, if a tank normally fills in 6 hours but takes 8 hours with a leak, the leak alone empties it in 1/(1/6 − 1/8) = 24 hours.',
    ],
    keyPoints: [
      'Inlets are positive rates, outlets negative.',
      'Net rate = sum of inlets − sum of outlets.',
      'Time = 1 ÷ net rate.',
      'LCM method: capacity = LCM of the times.',
      'Leak time = 1 / (normal rate − slower rate).',
      'If the net rate is negative, the tank empties.',
    ],
    formulas: [
      'Net rate = 1/a − 1/b',
      'Fill time with leak: ab/(b − a), if b > a',
      'Leak empties in: 1/(1/a − 1/t)',
      'Two inlets: time = ab/(a + b)',
    ],
  },
  'Algebra & Number Series|Linear Equations': {
    paragraphs: [
      'A linear equation has variables with power one only, such as 2x + 3 = 11 or 3x + 2y = 12. A system of two linear equations in two unknowns can have one solution, no solution or infinitely many. PGCET uses linear equations in word problems about ages, numbers, coins and prices, so the important skill is translating a sentence into an equation.',
      'For one variable, collect the x terms on one side and numbers on the other, then divide. For two variables, use substitution (make one variable the subject of one equation and put it into the other) or elimination (multiply the equations so one variable has equal coefficients, then add or subtract). For word problems, let x be the unknown asked for, write each condition as an equation, then solve. Check the answer in the original words, not just the equation.',
      'Example: "The sum of two numbers is 25 and their difference is 7": x + y = 25 and x − y = 7, so x = 16 and y = 9. Age problems: "Five years ago, A was twice B’s age" becomes A − 5 = 2(B − 5). For two lines a₁x + b₁y = c₁ and a₂x + b₂y = c₂: if a₁/a₂ ≠ b₁/b₂ there is exactly one solution, and if all three ratios are equal there are infinitely many. When the options are numbers, you can also substitute them back to find the right one quickly.',
    ],
    keyPoints: [
      'Let x stand for the quantity the question asks for.',
      'Elimination: make one coefficient equal, then add or subtract.',
      'Ages: apply the same years to every person.',
      'Check the answer in the original words.',
      'Back-substitute the options when it is faster.',
      'Equal ratios a, b, c → infinitely many solutions.',
    ],
    formulas: [
      'a₁/a₂ ≠ b₁/b₂ → one solution',
      'a₁/a₂ = b₁/b₂ ≠ c₁/c₂ → no solution',
      'a₁/a₂ = b₁/b₂ = c₁/c₂ → infinitely many',
      'Sum S and difference D: x = (S + D)/2, y = (S − D)/2',
    ],
  },
  'Algebra & Number Series|Identities & Powers': {
    paragraphs: [
      'Algebraic identities are equations that are true for every value of the variables, such as (a + b)² = a² + 2ab + b². Laws of exponents describe how powers combine. Together they let you simplify large expressions and calculate values like 103² or 99 × 101 mentally, which saves valuable time in an aptitude test.',
      'Learn the standard identities and recognise them in both directions: expanding (a + b)² and also factorising a² − b² into (a + b)(a − b). For exponents, multiplying powers with the same base adds the exponents, dividing subtracts them, and a power of a power multiplies them. Any non-zero number to the power 0 is 1, and a negative exponent means a reciprocal. Fractional exponents are roots: a^(1/2) = √a.',
      'Example: 99 × 101 = (100 − 1)(100 + 1) = 10000 − 1 = 9999. If a + b = 7 and ab = 10, then a² + b² = 49 − 20 = 29. Simplify 2⁵ × 2³ ÷ 2⁴ = 2⁴ = 16. Questions like "if x + 1/x = 3, find x² + 1/x²" use the square identity: 9 − 2 = 7. Write both sides with the same base when solving exponential equations such as 4ˣ = 32 (2²ˣ = 2⁵, so x = 2.5).',
    ],
    keyPoints: [
      'Use identities to multiply numbers near 100.',
      'a² − b² = (a + b)(a − b) is the most useful factorisation.',
      'Same base: multiply → add exponents, divide → subtract.',
      'a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/n) = ⁿ√a.',
      'x + 1/x = k → x² + 1/x² = k² − 2.',
      'Exponential equations: write both sides with one base.',
    ],
    formulas: [
      '(a ± b)² = a² ± 2ab + b²',
      'a² − b² = (a + b)(a − b)',
      '(a + b)³ = a³ + b³ + 3ab(a + b)',
      'a³ + b³ = (a + b)(a² − ab + b²)',
      'aᵐ · aⁿ = aᵐ⁺ⁿ,  (aᵐ)ⁿ = aᵐⁿ',
      'aᵐ / aⁿ = aᵐ⁻ⁿ',
    ],
  },
  'Algebra & Number Series|Number Series': {
    paragraphs: [
      'In a number series, numbers follow a rule and you must find the next or the missing term, or the one wrong term. The rules use basic operations: adding or multiplying by a constant or a changing number, squares and cubes, primes, or two series mixed together. With no negative marking in PGCET, every series question is worth attempting.',
      'Use a fixed order of checks. First, write the differences between terms. If those are not constant, write the second differences. If the numbers grow fast, try ratios or patterns like ×2 + 1. Compare terms with squares and cubes. Finally, split the series into alternate terms. For "wrong term" questions, find the rule from most of the terms, then locate the one that breaks it.',
      'Example: 5, 11, 23, 47, ? follows ×2 + 1, giving 95. In 1, 4, 9, 16, 25, the terms are squares, so 36 is next. 2, 3, 5, 7, 11, 13 are primes, so 17 is next. In 4, 9, 19, 39, 79, 158, the rule is ×2 + 1 so 158 should be 159; that is the wrong term. Practise a short set daily to build the instinct; the checks become automatic after a few weeks.',
    ],
    keyPoints: [
      'Check differences, then second differences.',
      'Fast growth → ratios or ×n ± k patterns.',
      'Compare with squares, cubes and primes.',
      'Split alternate terms for zig-zag series.',
      'Wrong-term questions: build the rule from most terms.',
      'No negative marking: always attempt.',
    ],
    formulasTitle: 'Patterns to try',
    formulas: [
      '+d constant;  +2, +4, +6 growing',
      '×2 + 1, ×3 − 1, ×2 − 2',
      'n², n³, n² + 1, n³ − 1',
      'Primes: 2, 3, 5, 7, 11, 13, 17, 19, 23',
      'Two mixed series at odd/even positions',
    ],
  },
}

export default quant
