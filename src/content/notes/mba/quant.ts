import type { ExamNotes } from '../../types'

// MBA · Quantitative Aptitude. Drafted for ScholarAI; review before use.
const quant: ExamNotes = {
  'Percentages & Profit-Loss|Percentages': {
    paragraphs: [
      'Percentages express a part of a whole as a number out of 100, and they are the single most important topic in MBA quantitative sections. Questions on profit, interest, growth, data interpretation and even ratio rely on quick percentage work. The aim is not just to calculate correctly but to calculate fast, using fractions in your head instead of long multiplication.',
      'Memorise the fraction equivalents from 1/2 to 1/12: for example 1/7 ≈ 14.28%, 1/9 ≈ 11.11% and 1/11 ≈ 9.09%. To find 37.5% of 480, think 3/8 × 480 = 180. For percentage change, always divide by the original value. For successive changes, multiply the factors: a 10% rise followed by a 20% rise is 1.1 × 1.2 = 1.32, a 32% rise. When a value changes by r%, to return to the original it must change by r/(100 ± r) × 100% in the other direction.',
      'Example: if the price of sugar rises by 25%, a family must cut consumption by 25/125 = 20% to keep spending the same. If 40% of a number is 120, the number is 300. Population grows 10% a year for two years: 1.1² = 1.21, a 21% increase. Questions on "percentage points" compare two percentages directly: a rise from 10% to 12% is 2 percentage points, but a 20% increase. Read whether the question asks for points or percent.',
    ],
    keyPoints: [
      'Learn fractions 1/2 to 1/12 as percentages.',
      'Change % is always on the original value.',
      'Successive changes: multiply the factors.',
      'Price up r% → cut consumption by r/(100 + r) to spend the same.',
      'Percentage points ≠ percent change.',
      'Use the options to estimate when numbers are large.',
    ],
    formulas: [
      'Change % = (new − old) / old × 100',
      'Successive a%, b%: a + b + ab/100',
      'Consumption cut = r/(100 + r) × 100',
      '1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%',
      'Growth over n years: (1 + r/100)ⁿ',
    ],
  },
  'Percentages & Profit-Loss|Profit & Loss': {
    paragraphs: [
      'Profit and loss compares what a trader paid for an item, the cost price (CP), with what they received, the selling price (SP). It appears regularly in MAT, CMAT and KMAT, sometimes combined with discounts, mixtures or false weights. The concepts are simple; the challenge is speed and avoiding the common base error.',
      'Profit or loss percentage is always calculated on the cost price. Turn percentages into multipliers: a 25% profit means SP = 1.25 × CP, and a 20% loss means SP = 0.8 × CP. If an item is sold at two prices with different results, set up the equation using CP. When two items are sold at the same price, one at x% profit and the other at x% loss, there is always an overall loss of x²/100 percent.',
      'Example: selling a watch for ₹1,150 gives a 15% profit, so CP = 1150/1.15 = ₹1,000. If two phones are each sold for ₹9,900, one at a 10% profit and one at a 10% loss, the overall loss is 10²/100 = 1%. A shopkeeper who sells at cost price but uses 900 g instead of 1 kg gains 100/900 = 11.11%. Always double-check whether a question gives profit on cost or profit on the selling price; a few trick questions use the selling price.',
    ],
    keyPoints: [
      'Profit / loss % is on cost price.',
      'Turn percentages into multipliers.',
      'Same SP, x% gain and x% loss → loss of x²/100 %.',
      'False weight: gain = shortfall / weight given × 100.',
      'Find CP first in most questions.',
      'Check whether profit is on cost or on selling price.',
    ],
    formulas: [
      'Profit % = (SP − CP) / CP × 100',
      'SP = CP × (100 + P%)/100;  CP = SP × 100/(100 + P%)',
      'Equal SP, x% gain & x% loss: loss % = x²/100',
      'False weight gain % = (true − false)/false × 100',
    ],
  },
  'Percentages & Profit-Loss|Discounts & Mark-up': {
    paragraphs: [
      'Shops mark goods at a price higher than cost (the mark-up) and then offer a discount on the marked price (MP). The final selling price decides whether the shop makes a profit. MBA exams like these questions because they combine two percentages on different bases: mark-up on the cost price, and discount on the marked price.',
      'Write everything as multipliers of the cost price. If goods are marked up by m% and sold at a discount of d%, then SP = CP × (1 + m/100) × (1 − d/100). Successive discounts of a% and b% are equal to one discount of a + b − ab/100, which is always less than a + b. "Buy 3, get 1 free" is a discount of 1/4 = 25% on the price of the four items received.',
      'Example: marked 50% above cost and sold at a 20% discount gives 1.5 × 0.8 = 1.2, a profit of 20%. Two discounts of 20% and 10% equal one discount of 28%, not 30%. To find the mark-up needed to earn a 26% profit after a 10% discount, solve (1 + m/100) × 0.9 = 1.26, so m = 40%. Read carefully whether the discount is given on the marked price (usual) or the selling price (rare).',
    ],
    keyPoints: [
      'Mark-up is on cost; discount is on marked price.',
      'SP = CP × (1 + m%) × (1 − d%).',
      'Successive discounts a, b → a + b − ab/100.',
      'Buy n get 1 free → discount = 1/(n + 1).',
      'Two discounts are always less than their sum.',
      'Work backwards from the target profit.',
    ],
    formulas: [
      'Discount % = (MP − SP)/MP × 100',
      'SP = MP × (1 − d/100)',
      'Net effect: (1 + m/100)(1 − d/100) − 1',
      'Equivalent discount: a + b − ab/100',
    ],
  },
  'Time, Speed & Distance|Speed, Time & Distance Basics': {
    paragraphs: [
      'Speed, time and distance questions all come from one relationship: distance = speed × time. If you know any two of the three, you can find the third. The topic is a favourite in MBA tests because it can be dressed up as trains, boats, races or travel plans, but the core formula never changes.',
      'Keep the units consistent before calculating. To convert km/h to m/s multiply by 5/18, and to convert m/s to km/h multiply by 18/5. When the distance is fixed, speed and time are inversely proportional: if speed becomes 4/3 of the usual, time becomes 3/4. Use this ratio idea to solve "late" and "early" questions quickly without long equations.',
      'Example: 72 km/h equals 72 × 5/18 = 20 m/s. A man walking at 4 km/h reaches 10 minutes late, but at 5 km/h he reaches 5 minutes early; the 15-minute difference equals d/4 − d/5 = d/20 hours, so d/20 = 1/4 and the distance is 5 km. If a car covers 240 km in 4 hours, its speed is 60 km/h. Draw a quick line diagram for meeting or overtaking questions; it prevents mistakes about who travels how far.',
    ],
    keyPoints: [
      'Distance = speed × time.',
      'km/h → m/s: × 5/18; m/s → km/h: × 18/5.',
      'Fixed distance: speed and time are inversely proportional.',
      'Use ratios for late / early questions.',
      'Keep units the same throughout.',
      'Draw a line diagram for meeting questions.',
    ],
    formulas: [
      'S = D/T,  T = D/S,  D = S × T',
      'km/h × 5/18 = m/s',
      'Speed ratio a : b → time ratio b : a (same distance)',
      'Late/early: D = (S₁S₂/(S₂ − S₁)) × time difference',
    ],
  },
  'Time, Speed & Distance|Trains & Relative Speed': {
    paragraphs: [
      'Train questions add one idea to the basic formula: a train has length, so to pass something it must cover its own length plus the length of whatever it passes. Relative speed is the speed of one object as seen from another. When two objects move in opposite directions their speeds add; when they move in the same direction, the speeds subtract.',
      'To pass a pole or a person standing still, a train covers only its own length. To pass a platform or bridge, it covers its length plus the platform’s length. When two trains pass each other, the distance is the sum of both lengths, and the speed is the sum (opposite directions) or difference (same direction) of their speeds. Convert km/h to m/s when the lengths are in metres.',
      'Example: a 150 m train moving at 54 km/h (15 m/s) passes a pole in 150/15 = 10 seconds, and a 300 m platform in 450/15 = 30 seconds. Two trains of 100 m and 150 m moving towards each other at 40 and 50 km/h (total 90 km/h = 25 m/s) cross in 250/25 = 10 seconds. If they move the same way, the relative speed is 10 km/h, so the crossing takes much longer. Always add both lengths when trains cross each other.',
    ],
    keyPoints: [
      'Pole or person: distance = train length.',
      'Platform or bridge: train length + platform length.',
      'Opposite directions: add the speeds.',
      'Same direction: subtract the speeds.',
      'Two trains crossing: add both lengths.',
      'Convert km/h to m/s when lengths are in metres.',
    ],
    formulas: [
      'Time = (L₁ + L₂) / relative speed',
      'Opposite: S₁ + S₂;  same direction: |S₁ − S₂|',
      'Pole: T = L / S',
      'Platform: T = (L + P) / S',
    ],
  },
  'Time, Speed & Distance|Average Speed & Boats': {
    paragraphs: [
      'Average speed is total distance divided by total time; it is not the simple average of the speeds. Boat-and-stream questions add the speed of the water to the speed of the boat: going downstream the current helps, and going upstream it slows the boat down. Both topics are frequent in MBA tests and both have neat shortcut formulas.',
      'If equal distances are covered at speeds a and b, the average speed is 2ab/(a + b), the harmonic mean, which is always less than the simple average. If equal times are spent at speeds a and b, the average is simply (a + b)/2. For boats, if the boat’s speed in still water is b and the stream’s speed is s, the downstream speed is b + s and the upstream speed is b − s. From the two speeds, b = (down + up)/2 and s = (down − up)/2.',
      'Example: going to a town at 40 km/h and returning at 60 km/h gives an average of 2 × 40 × 60 / 100 = 48 km/h, not 50. A boat goes 24 km downstream in 2 hours (12 km/h) and returns in 3 hours (8 km/h), so the boat’s speed is 10 km/h and the stream’s 2 km/h. Many students answer 50 in the first example; remembering that the slower part takes more time avoids that trap.',
    ],
    keyPoints: [
      'Average speed = total distance ÷ total time.',
      'Equal distances → 2ab/(a + b).',
      'Equal times → (a + b)/2.',
      'Downstream = b + s; upstream = b − s.',
      'Boat speed = average of down and up speeds.',
      'Stream speed = half their difference.',
    ],
    formulas: [
      'Avg speed (equal distances) = 2ab/(a + b)',
      'Avg speed (three equal distances) = 3abc/(ab + bc + ca)',
      'Down = b + s,  Up = b − s',
      'b = (D + U)/2,  s = (D − U)/2',
    ],
  },
  'Simple & Compound Interest|Simple Interest': {
    paragraphs: [
      'Simple interest (SI) is interest calculated only on the original amount borrowed or invested, called the principal. It grows by the same amount every year, so it is a straight-line growth. MBA tests use SI questions to check basic formula handling and to compare it with compound interest.',
      'The formula is SI = P × R × T / 100, where P is the principal, R the rate per year and T the time in years. The amount A is the principal plus interest. If time is given in months, divide by 12. Because SI grows equally each year, the interest for 3 years is three times the interest for 1 year. Questions often ask for the rate or time needed for a sum to double or triple: a sum doubles when SI equals P, so R × T = 100.',
      'Example: ₹5,000 at 8% for 3 years gives SI = 5000 × 8 × 3 / 100 = ₹1,200, so the amount is ₹6,200. A sum doubles in 8 years at simple interest, so R = 100/8 = 12.5%. If a sum becomes ₹7,200 in 2 years and ₹8,400 in 4 years, the interest for 2 years is ₹1,200, so the principal is 7,200 − 1,200 = ₹6,000. Check whether the rate is per year or per half-year before substituting.',
    ],
    keyPoints: [
      'SI is on the original principal only.',
      'Interest is the same every year.',
      'A = P + SI.',
      'Time in months → divide by 12.',
      'Sum doubles when R × T = 100.',
      'Use the difference between two amounts to find yearly interest.',
    ],
    formulas: [
      'SI = PRT / 100',
      'A = P(1 + RT/100)',
      'P = 100 × SI / (R × T)',
      'Doubling time = 100 / R years',
      'n times in T years: R = 100(n − 1)/T',
    ],
  },
  'Simple & Compound Interest|Compound Interest': {
    paragraphs: [
      'Compound interest (CI) is interest on interest: each year’s interest is added to the principal, and the next year’s interest is calculated on the new, larger amount. This makes money grow faster than with simple interest. MBA tests ask CI directly, as the difference between CI and SI, and in growth and depreciation questions.',
      'The amount after n years at R% compounded yearly is A = P(1 + R/100)ⁿ, and CI = A − P. If interest is compounded half-yearly, halve the rate and double the number of periods; quarterly, divide the rate by 4 and multiply the periods by 4. For two years, the difference between CI and SI is P(R/100)², a shortcut that solves many questions in seconds. Depreciation uses the same formula with a minus sign: P(1 − R/100)ⁿ.',
      'Example: ₹10,000 at 10% for 2 years compounded yearly becomes 10,000 × 1.21 = ₹12,100, so CI = ₹2,100; the SI would be ₹2,000, and the difference ₹100 = 10,000 × (0.1)². A machine worth ₹50,000 depreciating at 10% a year is worth 50,000 × 0.81 = ₹40,500 after two years. For quick CI over 2 years, use the successive-percentage rule: 10% and 10% gives 21%.',
    ],
    keyPoints: [
      'CI = interest on interest; grows faster than SI.',
      'Half-yearly: rate ÷ 2, periods × 2.',
      'CI − SI for 2 years = P(R/100)².',
      'Depreciation: (1 − R/100)ⁿ.',
      'Two years at R%: total = 2R + R²/100 percent.',
      'CI equals SI for the first year.',
    ],
    formulas: [
      'A = P(1 + R/100)ⁿ,  CI = A − P',
      'Half-yearly: A = P(1 + R/200)²ⁿ',
      'CI − SI (2 yrs) = P(R/100)²',
      'CI − SI (3 yrs) = P(R/100)²(3 + R/100)',
      'Depreciation: V = P(1 − R/100)ⁿ',
    ],
  },
}

export default quant
