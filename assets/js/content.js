// Conținutul editabil al site-ului: date de contact, meniu, recenzii, servicii.
// La servicii: `duration` și `tags` apar pe pagina Servicii.
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
      'Intervenții bazate pe dovezi științifice pentru depresie, anxietate, ADHD, traumă și dificultăți de reglare emoțională, care sprijină procesul de reconectare cu sine și de redescoperire a sensului personal.',
    items: [
      'Depresie și anxietate',
      'Gestionarea ADHD-ului',
      'Gestionarea traumei și a stresului post-traumatic',
      'Suport emoțional pentru persoane LGBTQIA+',
      'Gestionarea disfuncțiilor sexuale',
    ],
    note:
      'Lucrez și cu teme din sfera sexualității: întrebări legate de identitatea de gen sau orientarea sexuală, disfuncții sexuale, blocaje emoționale sau dificultăți în viața intimă. Fiecare temă este abordată cu respect, delicatețe și profesionalism, într-un cadru sigur și confidențial.',
  },
  {
    id: 'evaluari',
    duration: '', // lasă gol dacă durata variază
    tags: ['ADHD', 'Personalitate', 'Raport psihologic'],
    title: 'Evaluări și testări psihologice',
    intro:
      'Evaluări clinice și psihodiagnostic cu instrumente standardizate și validate științific. Evaluarea este un proces atent și empatic, menit nu doar să pună un diagnostic, ci să ofere înțelegere și direcție.',
    items: [
      'Evaluare ADHD: teste de atenție și concentrare, chestionare de autoevaluare și observații clinice',
      'Evaluare pentru depresie și anxietate: teste standardizate, chestionare clinice și interviuri semi-structurate',
      'Evaluare pentru traume psihice: chestionare și interviuri pentru identificarea stresului post-traumatic și a altor efecte ale traumei',
      'Evaluarea sănătății mentale generale: inventare și teste psihometrice pentru tulburările de dispoziție și anxietate',
      'Explorarea structurii de personalitate',
      'Evaluare și raport psihologic pentru Comisia de Evaluare a Persoanelor Adulte cu Handicap',
    ],
  },
  {
    id: 'identitate',
    duration: '50 min / ședință',
    tags: ['LGBTQIA+', 'Tranziție de gen'],
    title: 'Consiliere și evaluare pentru afirmarea identității',
    intro:
      'Persoanele LGBTQIA+ aflate în procesul de afirmare a identității pot beneficia de consiliere emoțională, psihoeducație, evaluare și raport psihologic în vederea începerii procesului de tranziție de gen. Însoțesc fiecare parcurs cu empatie, discreție și sprijin constant.',
    items: [
      'Suport emoțional și psihoeducație în procesul de afirmare a identității',
      'Evaluare și raport psihologic pentru începerea tranziției de gen',
    ],
  },
  {
    id: 'psihoeducatie',
    duration: '50 min / ședință',
    tags: ['Coping', 'Burnout', 'Familie'],
    title: 'Psihoeducație și strategii de coping',
    intro:
      'Înțelegerea propriilor mecanisme emoționale este primul pas către schimbare. Ofer clienților și familiilor lor informații clare și instrumente practice pentru gestionarea stresului, prevenirea burnout-ului, reglarea emoțiilor și o relație mai blândă cu sine.',
    items: [
      'Educație privind gestionarea ADHD-ului, anxietății, depresiei și traumelor',
      'Informare despre sănătatea mentală pentru persoane LGBTQIA+',
      'Strategii de adaptare și coping pentru stres și burnout',
      'Educație pentru familii și parteneri în susținerea persoanelor cu ADHD',
      'Informarea partenerilor sau familiilor despre impactul depresiei, anxietății sau traumelor asupra relațiilor',
    ],
  },
  {
    id: 'criza',
    duration: '50 min / ședință',
    tags: ['Stabilizare', 'Prevenție'],
    title: 'Intervenție în criză și prevenirea suicidului',
    intro:
      'În situațiile de criză emoțională ofer suport imediat pentru stabilizare și reducerea riscului suicidar, într-un spațiu în care persoana poate fi ascultată, înțeleasă și conținută. Scopul este diminuarea suferinței, reconectarea cu resursele personale și accesul la sprijin terapeutic continuu.',
    items: ['Suport pentru prevenirea suicidului', 'Gestionarea episoadelor de criză emoțională'],
    note: 'Dacă viața ta sau a altcuiva este în pericol imediat, sună la 112.',
  },
];

export const TOPICS = ['Depresie', 'Anxietate', 'ADHD', 'Traumă', 'Identitate', 'Relații', 'Sexualitate'];
