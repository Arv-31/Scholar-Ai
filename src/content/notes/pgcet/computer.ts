import type { ExamNotes } from '../../types'

// PGCET-MCA · Computer Awareness. Drafted for ScholarAI; review before use.
const computer: ExamNotes = {
  'Computer Fundamentals|History & Hardware': {
    paragraphs: [
      'Computers developed through generations, each defined by its main electronic component: vacuum tubes in the first generation, transistors in the second, integrated circuits in the third, microprocessors (VLSI) in the fourth, and artificial intelligence and parallel processing in the fifth. Hardware means the physical parts of a computer: the CPU, memory, motherboard, storage, and input and output devices. PGCET asks short factual questions on both.',
      'Remember the generations as a timeline with one key example each: ENIAC used vacuum tubes; transistors made computers smaller and cheaper; integrated circuits put many transistors on one chip; and the microprocessor put the whole CPU on one chip, giving us personal computers. The motherboard is the main circuit board connecting all parts. The CPU processes instructions, RAM holds data in use, storage keeps data permanently, and ports such as USB and HDMI connect external devices.',
      'Typical questions: "which generation used transistors?" (second), "who is called the father of the computer?" (Charles Babbage), "what was the first electronic general-purpose computer?" (ENIAC), or "which device converts digital signals to analog for telephone lines?" (a modem). Also learn the difference between hardware and firmware: firmware is software stored permanently on a hardware chip, such as the BIOS. Questions are direct, so short daily revision of facts works well.',
    ],
    keyPoints: [
      'Generations: vacuum tubes → transistors → ICs → microprocessors → AI.',
      'Charles Babbage: father of the computer (Analytical Engine).',
      'ENIAC: first electronic general-purpose computer.',
      'The motherboard connects all components.',
      'Firmware = software stored on a chip (e.g. BIOS).',
      'Modem = modulator–demodulator (digital ↔ analog).',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      '1st gen: vacuum tubes · 2nd: transistors',
      '3rd gen: integrated circuits · 4th: microprocessors (VLSI)',
      '5th gen: AI, parallel processing',
      'Ada Lovelace: first computer programmer',
      'Intel 4004 (1971): first commercial microprocessor',
    ],
  },
  'Computer Fundamentals|Software & Languages': {
    paragraphs: [
      'Software is the set of programs that tell hardware what to do. It is divided into system software, which runs the computer itself (operating systems, device drivers and utilities), and application software, which helps users do tasks (word processors, browsers, games). Programming languages are used to write software, and they range from low-level machine code to high-level languages like C, Java and Python.',
      'Machine language is binary and understood directly by the CPU. Assembly language uses short words called mnemonics (ADD, MOV) and needs an assembler to convert it to machine code. High-level languages are close to English and need a translator: a compiler converts the whole program at once into machine code, while an interpreter translates and runs it line by line. C and C++ are usually compiled; Python is usually interpreted; Java is compiled to bytecode that runs on a virtual machine.',
      'Typical questions: "which translator converts the whole program at once?" (compiler), "which is system software?" (operating system), "which language is called the mother of modern languages?" (C), or "what does a linker do?" (joins compiled pieces of code into one executable). Learn the difference between source code, written by the programmer, and object code, produced by the compiler. Open-source software allows anyone to read and change its source code.',
    ],
    keyPoints: [
      'System software runs the computer; application software serves the user.',
      'Assembler: assembly → machine code.',
      'Compiler: whole program at once; interpreter: line by line.',
      'Java → bytecode → Java Virtual Machine.',
      'Linker joins object files; loader puts the program into memory.',
      'Source code (written) vs object code (compiled).',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'Low level: machine language, assembly language',
      'High level: C, C++, Java, Python',
      'C: Dennis Ritchie (Bell Labs); Java: James Gosling',
      'Python: Guido van Rossum; C++: Bjarne Stroustrup',
      'Translator types: assembler, compiler, interpreter',
    ],
  },
  'Computer Fundamentals|Data Units': {
    paragraphs: [
      'All data in a computer is stored in binary, as bits (0 or 1). Bits are grouped into larger units: a nibble is 4 bits and a byte is 8 bits. Storage sizes then grow in steps of 1024: kilobyte, megabyte, gigabyte, terabyte and petabyte. PGCET asks conversion questions and questions on which unit is larger, so knowing the ladder by heart is enough to score.',
      'Each step up the ladder multiplies by 1024 (2¹⁰): 1 KB = 1024 bytes, 1 MB = 1024 KB, and so on. To convert down, multiply by 1024 for each step; to convert up, divide. To convert bytes to bits, multiply by 8. Be careful with network speeds: they use bits per second, so a 100 Mbps connection transfers about 12.5 megabytes per second. A character in ASCII takes 1 byte, while Unicode characters can take more.',
      'Typical questions: "how many bytes are in 1 MB?" (1024 × 1024 = 1,048,576), "which is the largest: 1 TB, 1 PB, 1 GB?" (1 PB), or "how many bits are in a nibble?" (4). Note that hard-disk makers often use 1000 instead of 1024, which is why a "1 TB" disk shows a little less in the operating system. Questions may also ask the order: bit, nibble, byte, KB, MB, GB, TB, PB, EB, ZB, YB.',
    ],
    keyPoints: [
      '4 bits = nibble; 8 bits = byte.',
      'Each step = × 1024 (2¹⁰).',
      'Bytes → bits: × 8.',
      'Network speed is in bits; file size is in bytes.',
      'ASCII character = 1 byte.',
      'Order: KB < MB < GB < TB < PB < EB < ZB < YB.',
    ],
    formulasTitle: 'Unit ladder',
    formulas: [
      '1 KB = 2¹⁰ B = 1024 B',
      '1 MB = 2²⁰ B = 1,048,576 B',
      '1 GB = 2³⁰ B;  1 TB = 2⁴⁰ B;  1 PB = 2⁵⁰ B',
      'MB/s = Mbps ÷ 8',
    ],
  },
  'Operating Systems & Software|OS Basics': {
    paragraphs: [
      'An operating system (OS) is the system software that manages the computer’s hardware and provides services to programs and users. It handles the CPU, memory, files, devices and security, and gives users an interface, either a command line or a graphical interface. Common examples are Windows, Linux, macOS, Android and iOS. PGCET asks about OS functions and types.',
      'The core of an OS is the kernel, which runs with full control of the hardware. The shell is the interface through which users give commands. Main OS functions are process management, memory management, file management, device management and security. Types of OS include batch systems (jobs run in groups without interaction), time-sharing systems (many users share the CPU in small time slices), real-time systems (strict time limits, as in aircraft control), distributed systems and mobile operating systems.',
      'Typical questions: "which part of the OS stays in memory and controls hardware?" (the kernel), "which OS type is used in air-traffic control?" (real-time), "what is booting?" (loading the OS into memory when the computer starts), or "which is open-source?" (Linux). Multitasking runs many programs by switching the CPU quickly; multiprocessing uses more than one CPU. Do not confuse the two, as both appear as options.',
    ],
    keyPoints: [
      'The OS manages hardware and serves programs.',
      'Kernel = core; shell = user interface.',
      'Functions: process, memory, file, device, security.',
      'Real-time OS: strict deadlines (aircraft, medical).',
      'Booting loads the OS into memory.',
      'Multitasking (one CPU, switching) ≠ multiprocessing (many CPUs).',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'Types: batch, time-sharing, real-time, distributed, mobile',
      'Open source: Linux, Android (kernel)',
      'GUI: icons and windows; CLI: typed commands',
      'Cold boot (from off) vs warm boot (restart)',
      'Device driver: lets the OS talk to a device',
    ],
  },
  'Operating Systems & Software|Processes, Scheduling & Memory': {
    paragraphs: [
      'A process is a program that is running. The OS keeps track of each process using a Process Control Block (PCB) and moves it between states such as new, ready, running, waiting and terminated. Because many processes compete for one CPU, the OS uses scheduling algorithms to decide who runs next, and it manages memory so that every process has space to run.',
      'Common scheduling algorithms are First-Come First-Served (FCFS), which runs processes in arrival order; Shortest Job First (SJF), which runs the shortest job next and gives the lowest average waiting time; Round Robin (RR), which gives each process a fixed time slice in turn and suits time-sharing; and Priority scheduling. A deadlock happens when processes wait for each other forever; it needs four conditions together: mutual exclusion, hold and wait, no preemption and circular wait. Memory is managed with paging (fixed-size blocks) and segmentation (variable-size logical parts), and virtual memory lets programs use more memory than the physical RAM.',
      'Typical questions: "which algorithm is best for time-sharing?" (Round Robin), "which gives minimum average waiting time?" (SJF), "what is thrashing?" (the system spends more time swapping pages than doing work), or "what are the conditions for deadlock?". A page fault happens when a needed page is not in RAM. Starvation means a process waits indefinitely, often in priority scheduling, and ageing is the fix.',
    ],
    keyPoints: [
      'Process states: new, ready, running, waiting, terminated.',
      'Round Robin suits time-sharing; SJF minimises average waiting time.',
      'Deadlock needs all four conditions at once.',
      'Paging = fixed-size pages; segmentation = variable-size segments.',
      'Thrashing = too much page swapping.',
      'Starvation is fixed by ageing.',
    ],
    formulasTitle: 'Formulas',
    formulas: [
      'Turnaround time = completion − arrival',
      'Waiting time = turnaround − burst time',
      'Deadlock: mutual exclusion, hold & wait, no preemption, circular wait',
      'Page fault → page brought from disk into RAM',
    ],
  },
  'Operating Systems & Software|Files & Everyday Software': {
    paragraphs: [
      'This subtopic covers how an operating system organises files and the everyday software people use. Files are stored in folders (directories) arranged as a tree, and each file has a name and an extension that shows its type. Everyday software includes word processors, spreadsheets, presentation programs, browsers and utility tools such as antivirus programs and file compressors.',
      'Know the common file extensions: .docx for Word documents, .xlsx for spreadsheets, .pptx for presentations, .pdf for portable documents, .jpg and .png for images, .mp3 for audio, .mp4 for video, .exe for Windows programs, .zip for compressed archives and .html for web pages. In spreadsheets, a cell is identified by its column letter and row number (B4), and formulas start with "=" as in =SUM(A1:A10). Learn the common keyboard shortcuts as well.',
      'Typical questions: "which extension is a compressed file?" (.zip), "what does Ctrl + Z do?" (undo), "which software is used for presentations?" (PowerPoint or Impress), or "what is the intersection of a row and column called?" (a cell). An antivirus is utility software that detects and removes malware. A file system like NTFS or FAT32 decides how data is stored on a disk. Shortcut questions are easy marks, so revise them once more before the exam.',
    ],
    keyPoints: [
      'Folders form a tree; the extension shows the file type.',
      'Spreadsheet cell = column letter + row number.',
      'Spreadsheet formulas start with "=".',
      'Antivirus and compression tools are utility software.',
      'File systems: FAT32, NTFS, ext4.',
      'Revise common shortcuts: they are easy marks.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      '.docx Word · .xlsx Excel · .pptx PowerPoint · .pdf',
      '.jpg .png images · .mp3 audio · .mp4 video · .zip archive',
      'Ctrl + C copy · Ctrl + V paste · Ctrl + X cut · Ctrl + Z undo',
      'Ctrl + S save · Ctrl + P print · Ctrl + F find',
      '=SUM(A1:A10), =AVERAGE(B1:B5)',
    ],
  },
  'Networking & Internet|Internet & Web': {
    paragraphs: [
      'The internet is a worldwide network of networks that connects millions of computers. The World Wide Web (WWW) is one service on the internet: a collection of linked pages accessed through browsers. Other internet services include email, file transfer and video calls. PGCET asks about web terms, addresses and the people and inventions behind the web.',
      'Web pages are written in HTML and fetched using HTTP, or HTTPS when the connection is encrypted. Every page has a URL, such as https://www.example.com/page, made up of the protocol, the domain name and the path. The Domain Name System (DNS) converts domain names into IP addresses that computers use. A browser (Chrome, Firefox, Edge) displays pages, and a search engine (Google, Bing) helps find them.',
      'Typical questions: "who invented the World Wide Web?" (Tim Berners-Lee, in 1989), "what does URL stand for?" (Uniform Resource Locator), "which protocol is secure for websites?" (HTTPS), or "what converts domain names into IP addresses?" (DNS). Remember that the internet and the web are not the same thing: the internet is the network, and the web is a service that runs on it. Email uses protocols like SMTP to send and POP3 or IMAP to receive.',
    ],
    keyPoints: [
      'Internet = network of networks; Web = linked pages on it.',
      'HTML builds pages; HTTP / HTTPS delivers them.',
      'DNS turns domain names into IP addresses.',
      'URL = protocol + domain + path.',
      'Tim Berners-Lee invented the WWW (1989).',
      'Email: SMTP sends; POP3 / IMAP receive.',
    ],
    formulasTitle: 'Expansions',
    formulas: [
      'WWW: World Wide Web · URL: Uniform Resource Locator',
      'HTTP: HyperText Transfer Protocol · HTML: HyperText Markup Language',
      'DNS: Domain Name System · ISP: Internet Service Provider',
      'SMTP: Simple Mail Transfer Protocol',
      'Domains: .com commercial, .org organisation, .edu education, .in India',
    ],
  },
  'Networking & Internet|Network Types & Devices': {
    paragraphs: [
      'A computer network connects devices so they can share data and resources. Networks are classified by size: a PAN (personal area network) covers a few metres, a LAN (local area network) covers a building or campus, a MAN (metropolitan area network) covers a city, and a WAN (wide area network) covers countries; the internet is the largest WAN. Networks also differ in their topology, the way devices are connected.',
      'Common topologies are bus (all devices on one cable), star (all devices connected to a central hub or switch; most common today), ring (each device connected to the next in a loop), mesh (every device connected to many others; very reliable) and tree (a hierarchy of stars). Network devices each have a job: a hub sends data to every port, a switch sends it only to the right device, a router connects different networks and chooses paths, a modem converts signals for phone or cable lines, and a repeater boosts weak signals.',
      'Typical questions: "which topology fails completely if the central device fails?" (star), "which device connects two different networks?" (router), "which is smarter, a hub or a switch?" (switch), or "what does LAN stand for?" (Local Area Network). In a mesh with n devices, the number of links needed is n(n − 1)/2. Bluetooth is a common example of a PAN, and Wi-Fi is a wireless LAN.',
    ],
    keyPoints: [
      'By size: PAN < LAN < MAN < WAN.',
      'Star topology depends on its central hub or switch.',
      'Mesh is most reliable but needs the most cables.',
      'Hub broadcasts; switch sends to the right port.',
      'Router connects different networks.',
      'Repeater boosts weak signals.',
    ],
    formulasTitle: 'Facts & formulas',
    formulas: [
      'Mesh links for n devices = n(n − 1)/2',
      'Star: n links for n devices (to the hub)',
      'Bluetooth → PAN;  Wi-Fi → wireless LAN',
      'Internet = largest WAN',
    ],
  },
  'Networking & Internet|Protocols & Addressing': {
    paragraphs: [
      'A protocol is a set of rules that devices follow to communicate, just as people follow the rules of a language. The internet runs on the TCP/IP family of protocols. Addressing identifies each device: an IP address identifies a device on a network, and a MAC address is the fixed hardware address of a network card. PGCET asks you to match protocols with their uses and to recognise address formats.',
      'The OSI model describes networking in seven layers: physical, data link, network, transport, session, presentation and application. TCP (at the transport layer) gives reliable, ordered delivery, while UDP is faster but does not guarantee delivery, which suits video streaming and games. IP (at the network layer) handles addressing and routing. Application protocols include HTTP for web pages, FTP for file transfer, SMTP for sending email, and DNS for names. IPv4 addresses are 32 bits, written as four numbers (192.168.1.1); IPv6 addresses are 128 bits written in hexadecimal.',
      'Typical questions: "how many layers are in the OSI model?" (7), "which protocol is connection-oriented?" (TCP), "how many bits are in an IPv4 address?" (32), or "at which layer does a router work?" (network layer). A MAC address is 48 bits long. Memorise the layer order with a phrase such as "Please Do Not Throw Sausage Pizza Away", from physical up to application.',
    ],
    keyPoints: [
      'OSI has 7 layers: physical up to application.',
      'TCP = reliable, connection-oriented; UDP = fast, connectionless.',
      'IPv4 = 32 bits; IPv6 = 128 bits; MAC = 48 bits.',
      'Router works at the network layer; switch at the data link layer.',
      'HTTP web, FTP files, SMTP email, DNS names.',
      'Mnemonic: Please Do Not Throw Sausage Pizza Away.',
    ],
    formulasTitle: 'Quick facts',
    formulas: [
      'OSI: Physical, Data link, Network, Transport, Session, Presentation, Application',
      'Ports: HTTP 80, HTTPS 443, FTP 21, SMTP 25, DNS 53',
      'IPv4 example: 192.168.1.1 (four 8-bit parts)',
      'Number of IPv4 addresses = 2³²',
      'TCP/IP model: 4 layers',
    ],
  },
}

export default computer
