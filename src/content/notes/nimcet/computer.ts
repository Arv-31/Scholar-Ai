import type { ExamNotes } from '../../types'

// NIMCET · Computer Awareness. Drafted for ScholarAI; review before use.
const computer: ExamNotes = {
  'Computer Organisation|CPU & Instructions': {
    paragraphs: [
      'The Central Processing Unit (CPU) is the part of a computer that carries out instructions. It has three main parts: the Arithmetic Logic Unit (ALU), which does calculations and comparisons; the Control Unit (CU), which directs the flow of data and decides what happens next; and registers, tiny very fast storage locations inside the CPU. NIMCET asks direct questions on these parts and on how an instruction is executed.',
      'Every instruction passes through the instruction cycle: fetch, decode and execute. In the fetch step, the Program Counter (PC) holds the address of the next instruction; that address goes to the Memory Address Register (MAR), the instruction comes back through the Memory Data Register (MDR) and is placed in the Instruction Register (IR). The control unit decodes it, and the ALU or another unit executes it. The PC is then increased to point to the next instruction. The accumulator holds intermediate results of ALU operations.',
      'Expect questions like "which register holds the address of the next instruction?" (the program counter), "which unit performs logical operations?" (the ALU) or "what does the clock speed measure?" (cycles per second, in hertz). Instruction set types also appear: RISC uses fewer, simpler instructions that run fast, while CISC has many complex instructions. Do not confuse the MAR, which holds an address, with the MDR, which holds data.',
    ],
    keyPoints: [
      'CPU = ALU + Control Unit + registers.',
      'Instruction cycle: fetch → decode → execute.',
      'PC holds the address of the next instruction.',
      'MAR holds an address; MDR holds the data read or written.',
      'IR holds the instruction being decoded.',
      'RISC: few simple instructions; CISC: many complex ones.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'Clock speed: 1 GHz = 10⁹ cycles per second',
      'Accumulator: stores ALU results',
      'Program Counter → MAR → memory → MDR → IR',
      'Bus types: data bus, address bus, control bus',
      'n-bit address bus can address 2ⁿ memory locations',
    ],
  },
  'Computer Organisation|Memory': {
    paragraphs: [
      'Computer memory is arranged as a hierarchy. At the top are registers and cache, which are very fast but small and costly; in the middle is main memory (RAM); at the bottom is secondary storage such as hard disks and SSDs, which is slow but large and cheap. NIMCET asks you to compare these levels and to know which memory is volatile, meaning it loses its contents when power is off.',
      'RAM (Random Access Memory) is volatile and holds the programs and data currently in use. It comes as SRAM, which is fast and used for cache, and DRAM, which is cheaper, needs refreshing and is used for main memory. ROM (Read Only Memory) is non-volatile and stores startup instructions such as the BIOS; its versions are PROM (programmed once), EPROM (erased with ultraviolet light) and EEPROM (erased electrically, as in flash memory). Cache memory sits between the CPU and RAM to hold frequently used data.',
      'Typical questions: "which memory is fastest?" (registers), "which is volatile?" (RAM and cache), "which ROM can be erased with UV light?" (EPROM), or "what is virtual memory?" (using part of the disk as an extension of RAM). Another favourite is the order of speed from fastest to slowest: registers, cache, RAM, SSD, hard disk, optical disk. A cache "hit" means the data was found in cache; a "miss" means it had to be fetched from RAM.',
    ],
    keyPoints: [
      'Speed order: registers > cache > RAM > SSD > HDD.',
      'RAM is volatile; ROM is non-volatile.',
      'SRAM is used for cache; DRAM for main memory (needs refresh).',
      'EPROM: UV erasable. EEPROM: electrically erasable (flash).',
      'Virtual memory uses disk space as extra RAM.',
      'Cache hit = data found in cache.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'Hit ratio = hits / (hits + misses)',
      'Average access time ≈ h·Tcache + (1 − h)·Tmain',
      'BIOS is stored in ROM / flash',
      'Primary memory: RAM, ROM, cache; secondary: HDD, SSD, optical',
      'Cost per bit falls and size grows going down the hierarchy',
    ],
  },
  'Computer Organisation|Data Units & Devices': {
    paragraphs: [
      'Computers store everything as bits, the binary digits 0 and 1. Eight bits make a byte, and larger units such as kilobyte, megabyte and gigabyte are built from powers of two. The second part of this subtopic is devices: input devices that send data in, output devices that show results, and storage devices that keep data. NIMCET asks short, factual questions on both.',
      'Learn the ladder of units: 4 bits make a nibble, 8 bits a byte, 1024 bytes a kilobyte, 1024 KB a megabyte, then gigabyte, terabyte and petabyte, each 1024 times the one before. For devices, classify by direction of data. Keyboard, mouse, scanner, microphone, barcode reader, OMR and MICR are input devices. Monitor, printer, speakers and projector are output. A touchscreen is both input and output, and a modem both sends and receives data.',
      'Typical questions: "how many bits are in 2 KB?" (2 × 1024 × 8 = 16,384), "which device reads cheque numbers?" (MICR), "which device reads answer sheets?" (OMR), or "which printer is an impact printer?" (dot matrix; laser and inkjet are non-impact). Resolution of monitors is measured in pixels, and printer quality in dots per inch (dpi). Be careful with units: storage sizes use bytes (B), but network speeds use bits per second (bps).',
    ],
    keyPoints: [
      '8 bits = 1 byte; 4 bits = 1 nibble.',
      'Each larger unit is 1024 times the smaller one.',
      'MICR reads cheques; OMR reads bubble sheets.',
      'Touchscreen is both input and output.',
      'Dot matrix is an impact printer; laser and inkjet are not.',
      'Storage uses bytes (B); network speed uses bits (b).',
    ],
    formulasTitle: 'Unit ladder',
    formulas: [
      '1 KB = 1024 B = 2¹⁰ B',
      '1 MB = 1024 KB = 2²⁰ B',
      '1 GB = 1024 MB = 2³⁰ B',
      '1 TB = 1024 GB = 2⁴⁰ B',
      'Bits = bytes × 8',
    ],
  },
  'Number Systems|Binary': {
    paragraphs: [
      'The binary number system uses only two digits, 0 and 1, because digital circuits have two stable states: off and on. Each position in a binary number is a power of 2, just as each position in a decimal number is a power of 10. NIMCET almost always asks at least one conversion question, so converting quickly between binary and decimal is a must-have skill.',
      'To convert binary to decimal, write the powers of 2 under the digits from the right (1, 2, 4, 8, 16 …) and add those under each 1. For 101101, that is 32 + 8 + 4 + 1 = 45. To convert decimal to binary, divide repeatedly by 2 and write the remainders from the bottom up, or subtract the largest power of 2 that fits and continue. Binary fractions use negative powers: 0.1 in binary is 1/2 and 0.01 is 1/4.',
      'Expect questions such as "convert 156 to binary" (10011100), "what is the decimal value of 11011?" (27), or "how many bits are needed to represent 100?" (7, since 2⁶ = 64 is too small and 2⁷ = 128 is enough). The largest number with n bits is 2ⁿ − 1, so 8 bits can store 0 to 255. Read the remainders from the last one to the first; reading them in the wrong order is the most common error.',
    ],
    keyPoints: [
      'Each binary place is a power of 2.',
      'Binary → decimal: add the powers under the 1s.',
      'Decimal → binary: divide by 2, read remainders bottom-up.',
      'n bits store 0 to 2ⁿ − 1 (8 bits: 0–255).',
      'Bits needed for N: smallest n with 2ⁿ > N.',
      'Binary fraction places are 1/2, 1/4, 1/8 …',
    ],
    formulasTitle: 'Powers of 2',
    formulas: [
      '2⁰ 1 · 2¹ 2 · 2² 4 · 2³ 8 · 2⁴ 16 · 2⁵ 32',
      '2⁶ 64 · 2⁷ 128 · 2⁸ 256 · 2⁹ 512 · 2¹⁰ 1024',
      'Value = Σ dᵢ × 2ⁱ',
      'Max value of n bits = 2ⁿ − 1',
    ],
  },
  'Number Systems|Octal & Hexadecimal': {
    paragraphs: [
      'Octal (base 8) and hexadecimal (base 16) are shorthand ways of writing long binary numbers. Octal uses the digits 0–7, and hexadecimal uses 0–9 followed by A–F for the values 10 to 15. Because 8 = 2³ and 16 = 2⁴, every octal digit stands for exactly three binary digits, and every hexadecimal digit for exactly four. This makes conversion between them very fast, and NIMCET tests it regularly.',
      'To convert binary to octal, group the bits in threes from the right (adding zeros on the left if needed) and replace each group with its value. For hexadecimal, group in fours. To go the other way, expand each digit into three or four bits. To convert octal or hex to decimal, use place values (powers of 8 or 16). Between octal and hexadecimal, it is easiest to go through binary in the middle.',
      'Example: binary 110101110 grouped in threes is 110 101 110, which is octal 656; grouped in fours as 0001 1010 1110, it is hexadecimal 1AE. Hex 2F in decimal is 2 × 16 + 15 = 47. Questions also ask which digit is invalid in a base: 8 and 9 never appear in octal, and G never appears in hex. Always group from the right for whole numbers; grouping from the left gives a wrong answer.',
    ],
    keyPoints: [
      'Octal digits 0–7; hex digits 0–9 and A–F.',
      'One octal digit = 3 bits; one hex digit = 4 bits.',
      'Group bits from the right, padding with zeros on the left.',
      'Go octal ↔ hex through binary.',
      'Use powers of 8 or 16 to reach decimal.',
      '8 and 9 are invalid in octal.',
    ],
    formulasTitle: 'Tables',
    formulas: [
      'Hex: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15',
      'Octal → binary: 0 000, 1 001, 2 010, 3 011, 4 100, 5 101, 6 110, 7 111',
      'Hex → binary: 8 1000, 9 1001, A 1010, F 1111',
      'Octal value = Σ dᵢ × 8ⁱ;  hex value = Σ dᵢ × 16ⁱ',
    ],
  },
  'Number Systems|Binary Arithmetic & Complements': {
    paragraphs: [
      'Computers add, subtract and store negative numbers in binary. Binary addition works like decimal addition but carries at 2 instead of 10. To handle subtraction and negative numbers, computers use complements: the 1’s complement flips every bit, and the 2’s complement is the 1’s complement plus 1. NIMCET asks about these rules and about the range of numbers a signed representation can hold.',
      'In binary addition, 0 + 0 = 0, 0 + 1 = 1, 1 + 1 = 0 with a carry of 1, and 1 + 1 + 1 = 1 with a carry of 1. To subtract B from A using 2’s complement, find the 2’s complement of B and add it to A; if there is a carry out of the leftmost bit, discard it and the result is positive. A quick way to write the 2’s complement is to copy bits from the right up to and including the first 1, then flip all the remaining bits.',
      'Typical questions: "what is the 2’s complement of 01101000?" (10011000), "add 1011 and 0110" (10001), or "what is the range of an 8-bit signed number in 2’s complement?" (−128 to +127). In signed representation the leftmost bit is the sign bit: 0 for positive and 1 for negative. 2’s complement is preferred over 1’s complement because it has only one representation of zero and makes subtraction simple addition.',
    ],
    keyPoints: [
      '1 + 1 = 10 in binary (write 0, carry 1).',
      '1’s complement: flip every bit.',
      '2’s complement: flip every bit, then add 1.',
      'Shortcut: copy up to the first 1 from the right, flip the rest.',
      'Leftmost bit is the sign bit (1 = negative).',
      '2’s complement has a single zero; 1’s complement has +0 and −0.',
    ],
    formulasTitle: 'Rules & ranges',
    formulas: [
      'A − B = A + (2’s complement of B), discard the final carry',
      'n-bit 2’s complement range: −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1',
      'n-bit 1’s complement range: −(2ⁿ⁻¹ − 1) to 2ⁿ⁻¹ − 1',
      '8-bit signed: −128 to +127',
      'Unsigned n-bit range: 0 to 2ⁿ − 1',
    ],
  },
  'Boolean Algebra & Logic Gates|Logic Gates': {
    paragraphs: [
      'Logic gates are the building blocks of digital circuits. Each gate takes one or more binary inputs and produces a single binary output according to a rule. The basic gates are AND, OR and NOT; the others, NAND, NOR, XOR and XNOR, are combinations of these. NIMCET asks for outputs of gate combinations, truth tables and which gates are "universal".',
      'An AND gate outputs 1 only when all inputs are 1. An OR gate outputs 1 when at least one input is 1. A NOT gate flips its input. NAND and NOR are AND and OR followed by NOT. XOR outputs 1 when the inputs are different, and XNOR outputs 1 when they are the same. To find the output of a circuit, work from the inputs to the output, gate by gate, writing the expression or the value at each step.',
      'Typical questions: "which gates are universal?" (NAND and NOR, because any circuit can be built using only one of them), "what is the output of XOR with inputs 1 and 1?" (0), or "how many rows does the truth table of a 3-input gate have?" (2³ = 8). A half adder is built from an XOR gate (sum) and an AND gate (carry). Do not confuse NOR and XNOR: NOR is 1 only when all inputs are 0.',
    ],
    keyPoints: [
      'AND: 1 only if all inputs are 1.',
      'OR: 1 if any input is 1.',
      'XOR: 1 when inputs differ; XNOR: 1 when they match.',
      'NAND and NOR are universal gates.',
      'n inputs → 2ⁿ rows in the truth table.',
      'Half adder: sum = XOR, carry = AND.',
    ],
    formulasTitle: 'Gate rules',
    formulas: [
      'AND: Y = A · B',
      'OR: Y = A + B',
      'NOT: Y = A′',
      'NAND: Y = (A · B)′,  NOR: Y = (A + B)′',
      'XOR: Y = A ⊕ B = A′B + AB′',
      'XNOR: Y = (A ⊕ B)′ = AB + A′B′',
    ],
  },
  'Boolean Algebra & Logic Gates|Boolean Laws': {
    paragraphs: [
      'Boolean algebra is the mathematics of true and false values, written as 1 and 0. It has its own laws, similar to ordinary algebra but with a few differences, such as A + A = A. These laws are used to simplify logic expressions so that a circuit needs fewer gates. NIMCET asks you to simplify expressions or pick which law justifies a step.',
      'The most useful laws are the identity laws (A + 0 = A, A · 1 = A), the null laws (A + 1 = 1, A · 0 = 0), the idempotent laws (A + A = A), the complement laws (A + A′ = 1, A · A′ = 0), the absorption laws (A + AB = A), and De Morgan’s theorems, which turn the complement of a sum into a product of complements and vice versa. Simplify step by step: take out common factors, then apply absorption and complement laws.',
      'Example: A + A′B simplifies to A + B, and AB + AB′ = A(B + B′) = A. De Morgan questions such as (A + B)′ = A′ · B′ are very common. Karnaugh maps (K-maps) are a visual way to simplify expressions with 2 to 4 variables by grouping adjacent 1s in groups of 1, 2, 4 or 8. A key difference from normal algebra: A + BC = (A + B)(A + C), the distributive law over addition, which has no ordinary-algebra equivalent.',
    ],
    keyPoints: [
      'A + A = A and A · A = A (idempotent).',
      'A + 1 = 1 and A · 0 = 0.',
      'A + A′ = 1 and A · A′ = 0.',
      'Absorption: A + AB = A and A(A + B) = A.',
      'De Morgan: break the bar, change the sign.',
      'K-map groups must be 1, 2, 4 or 8 adjacent cells.',
    ],
    formulasTitle: 'Laws',
    formulas: [
      '(A + B)′ = A′ · B′',
      '(A · B)′ = A′ + B′',
      'A + A′B = A + B',
      'A + BC = (A + B)(A + C)',
      'AB + AB′ = A',
      '(A′)′ = A',
    ],
  },
}

export default computer
