// Conținutul editabil al site-ului: date de contact, meniu, recenzii, servicii.
// La servicii: `duration` și `tags` apar pe pagina Servicii; fiecare punct din `items` e [iconiță, text].
// După o modificare aici, rulează: node scripts/genereaza.mjs

export const SITE = {
  name: 'Adrian Bălan',
  role: 'Psiholog clinician',
  url: 'https://www.adrianbalan.ro', // adresa publică, folosită în sitemap și Open Graph
  phoneDisplay: '0720 754 920',
  phoneTel: '+40720754920',
  whatsapp: 'https://wa.me/40720754920',
  address: 'Strada Aristide Demetriade nr. 1/3, Timișoara',
  mapsQuery: 'Strada Aristide Demetriade 1/3, Timișoara, România',
};

export const NAV = [
  { href: '/', label: 'Acasă' },
  { href: '/articole.html', label: 'Articole' },
  { href: '/despre.html', label: 'Despre mine' },
  { href: '/servicii.html', label: 'Servicii' },
  { href: '/contact.html', label: 'Contact' },
];

export const TESTIMONIALS = [
  {
    initials: 'C.C.',
    text: 'Îl recomand cu tot dragul pe domnul psiholog Adrian! Este un om minunat, emană încredere și este de o empatie cum rar găsești! Mulțumesc!',
  },
  {
    initials: 'S.T.',
    text: 'Îl recomand cu încredere pe domnul psiholog Adrian Bălan, un psiholog empatic și profesionist. M-am simțit confortabilă și înțeleasă încă de la prima ședință. Creează un spațiu sigur și deschis, în care este ușor să vorbești, lipsit de judecată. Îl recomand cu mare încredere, în special persoanelor tinere care își doresc un terapeut cu care să rezoneze ușor și să se simtă în largul lor.',
  },
  {
    initials: 'I.D.',
    text: 'Îl recomand cu toată încrederea pe domnul psiholog Adrian Bălan. Întâlnirile cu acesta m-au ajutat enorm să mă înțeleg mai bine și să mă accept așa cum sunt. Are o prezență calmă și caldă, care mă face să mă simt în siguranță și să mă pot relaxa cu adevărat în timpul ședințelor. Discuțiile decurg mereu firesc, fără presiune, iar modul în care mă ascultă și mă ghidează mă ajută să mă deschid tot mai mult și să-mi procesez emoțiile mai ușor. Este un profesionist empatic și atent, care oferă sprijin real și autentic într-un mod blând și încurajator.',
  },
  {
    initials: 'P.R.',
    text: 'Îl recomand cu cel mai mare drag pe domnul psiholog Adrian Bălan. Am fost extrem de surprins atât de fluiditatea cu care decurge dialogul, cât și de modul calm și profesionist în care Adrian mă ajută să-mi reevaluez experiențele. Cu alte cuvinte, un om fain cu care chiar simți că poți vorbi liber despre absolut orice: un prieten care îți oferă feedback specializat.',
  },
  {
    initials: 'D.A.',
    text: 'Am avut o experiență foarte bună cu domnul psiholog Adrian Bălan. Este un om calm, răbdător și empatic. M-a ajutat să înțeleg mai bine ce simt și de ce reacționez într-un anumit fel. În ședințe m-am simțit ascultată și în siguranță. Explică lucrurile clar și te ajută să găsești soluții practice pentru problemele tale. Recomand cu încredere oricui are nevoie de sprijin emoțional și de claritate în viață. Recomand cu toată încrederea!',
  },
  {
    initials: 'T.A.',
    text: 'Îi sunt foarte recunoscătoare domnului psiholog Adrian Bălan pentru profesionalismul de care a dat dovadă la fiecare ședință. Datorită lui, am ajuns să mă înțeleg mai bine, să fiu mai blândă cu mine și să fac pași reali spre echilibru. Fiecare întâlnire mi-a adus mai multă claritate și încredere, iar felul lui de a mă ghida m-a ajutat să privesc lucrurile dintr-o perspectivă nouă. Am învățat să mă accept, să fiu mai răbdătoare cu mine însămi și să apreciez fiecare mic progres pe care îl fac. Sprijinul lui constant a făcut ca întreaga călătorie să fie mai ușoară și mai plină de speranță.',
  },
];

export const SERVICES = [
  {
    id: 'interventie',
    duration: '50 min / ședință',
    tags: ['Depresie', 'Anxietate', 'ADHD', 'Traumă'],
    title: 'Intervenție psihologică și suport emoțional',
    intro:
      'Ofer intervenții bazate pe dovezi științifice pentru depresie, anxietate, ADHD, traumă și dificultăți de reglare emoțională, sprijinind clienții în procesul de reconectare cu sine și de redescoperire a sensului personal.',
    items: [
      ['cloudRain', 'Depresie și anxietate'],
      ['zap', 'Gestionarea ADHD-ului'],
      ['shield', 'Gestionarea traumei și a stresului post-traumatic'],
      ['heart', 'Suport emoțional pentru persoane LGBTQIA+'],
      ['heartPulse', 'Gestionarea disfuncțiilor sexuale'],
    ],
    note:
      'De asemenea, lucrez cu persoane care se confruntă cu probleme din sfera sexualității, de la întrebări legate de identitatea de gen sau orientarea sexuală, până la disfuncții sexuale, blocaje emoționale sau dificultăți în viața intimă. Fiecare dintre aceste teme este abordată cu respect, delicatețe și profesionalism, într-un cadru sigur și confidențial.',
  },
  {
    id: 'psihoeducatie',
    duration: '50 min / ședință',
    tags: ['Coping', 'Burnout', 'Familie'],
    title: 'Psihoeducație și strategii de coping',
    intro:
      'Consider că înțelegerea propriilor mecanisme emoționale este primul pas către schimbare. Prin psihoeducație, ofer clienților și familiilor lor informații clare și instrumente practice pentru gestionarea stresului, prevenirea burnout-ului, reglarea emoțiilor și dezvoltarea unei relații mai blânde cu sine.',
    items: [
      ['book', 'Educație privind gestionarea ADHD-ului, anxietății, depresiei și traumelor'],
      ['info', 'Informare despre sănătatea mentală pentru persoane LGBTQIA+'],
      ['leaf', 'Strategii de adaptare și coping pentru stres și burnout'],
      ['users', 'Educație pentru familii și parteneri în susținerea persoanelor cu ADHD'],
      ['message', 'Informarea partenerilor sau familiilor despre impactul depresiei, anxietății sau traumelor asupra relațiilor'],
    ],
  },
  {
    id: 'evaluari',
    duration: '', // lasă gol dacă durata variază
    tags: ['ADHD', 'Personalitate', 'Raport psihologic'],
    title: 'Evaluări psihologice complexe',
    intro:
      'Realizez evaluări clinice și psihodiagnostic cu instrumente standardizate și validate științific, pentru identificarea și clarificarea tulburărilor de tip ADHD, depresiv, anxios sau traumatic, pentru explorarea structurii de personalitate, precum și evaluări și rapoarte psihologice pentru Comisia de Evaluare a Persoanelor Adulte cu Handicap. Evaluarea este un proces atent și empatic, menit nu doar să pună un diagnostic, ci să ofere înțelegere și direcție.',
    items: [
      ['target', 'Evaluare ADHD: teste de atenție și concentrare, chestionare de autoevaluare și observații clinice'],
      ['clipboard', 'Evaluare pentru depresie și anxietate: teste standardizate, chestionare clinice și interviuri semi-structurate'],
      ['shield', 'Evaluare pentru traume psihice: chestionare și interviuri pentru identificarea stresului post-traumatic și a altor efecte ale traumei'],
      ['activity', 'Evaluarea sănătății mentale generale: inventare și teste psihometrice pentru tulburările de dispoziție și anxietate'],
      ['user', 'Explorarea structurii de personalitate'],
      ['fileText', 'Evaluare și raport psihologic pentru Comisia de Evaluare a Persoanelor Adulte cu Handicap'],
    ],
  },
  {
    id: 'identitate',
    duration: '50 min / ședință',
    tags: ['LGBTQIA+', 'Tranziție de gen'],
    title: 'Consiliere și evaluare pentru afirmarea identității',
    intro:
      'Persoanele LGBTQIA+ care se află în procesul de afirmare a identității pot beneficia de consiliere emoțională, psihoeducație, evaluare și raport psihologic în vederea începerii procesului de tranziție de gen. Abordez aceste demersuri cu respect profund față de autenticitatea fiecărui parcurs personal, însoțind clienții cu empatie, discreție și sprijin constant.',
    items: [
      ['compass', 'Suport emoțional și psihoeducație în procesul de afirmare a identității'],
      ['fileCheck', 'Evaluare și raport psihologic pentru începerea tranziției de gen'],
    ],
  },
  {
    id: 'criza',
    duration: '50 min / ședință',
    tags: ['Stabilizare', 'Prevenție'],
    title: 'Intervenție în criză și prevenirea suicidului',
    intro:
      'În situațiile de criză emoțională, ofer suport imediat pentru stabilizarea emoțională și reducerea riscului suicidar, creând un spațiu de siguranță în care persoana poate fi ascultată, înțeleasă și conținută. Intervenția în astfel de momente vizează nu doar diminuarea suferinței, ci și reconectarea cu resursele personale și accesul la sprijinul terapeutic continuu.',
    items: [['lifeBuoy', 'Suport pentru prevenirea suicidului'], ['anchor', 'Gestionarea episoadelor de criză emoțională']],
    note: 'Dacă viața ta sau a altcuiva este în pericol imediat, sună la 112.',
  },
];

export const TOPICS = ['Depresie', 'Anxietate', 'Traume', 'Relaționare', 'Sexualitate', 'Dificultăți de identitate'];
