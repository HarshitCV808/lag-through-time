// All game copy, product data and the matching logic in one place, easy to fact-check.

// One multi-select question per level. Each option adds points to personas.
export const QUESTIONS = {
  L1: {
    title: 'What do you do on a laptop most days?',
    options: [
      { label: 'Classes and assignments', w: { student: 2 } },
      { label: 'Office work and meetings', w: { pro: 2 } },
      { label: 'Gaming', w: { gamer: 2 } },
      { label: 'Editing photos and videos', w: { creator: 2 } },
      { label: 'Coding', w: { student: 1, pro: 1 } },
      { label: 'Streaming and content', w: { creator: 1, gamer: 1 } },
    ],
  },
  L2: {
    title: 'Where does your laptop go with you?',
    options: [
      { label: 'Campus, all day', w: { student: 2 } },
      { label: 'Cafés and travel', w: { creator: 1, pro: 1 } },
      { label: 'My desk, plugged in', w: { gamer: 2 } },
      { label: 'Client visits and commutes', w: { pro: 2 } },
    ],
  },
  L3: {
    title: 'Which apps would you want AI help in?',
    options: [
      { label: 'Notes and summaries', w: { student: 2 } },
      { label: 'Photo and reel editing', w: { creator: 2 } },
      { label: 'Game streaming and upscaling', w: { gamer: 2 } },
      { label: 'Emails and meeting notes', w: { pro: 2 } },
      { label: 'Writing and chat assistants', w: { student: 1, pro: 1 } },
    ],
  },
  L4: {
    title: 'What matters most in your next laptop?',
    options: [
      { label: 'All-day battery', w: { student: 1, pro: 1 } },
      { label: 'Gaming power', w: { gamer: 2 } },
      { label: 'Sharp, colourful screen', w: { creator: 2 } },
      { label: 'Light to carry', w: { student: 1, pro: 1 } },
      { label: 'Privacy for my files', w: { pro: 1, creator: 1 } },
      { label: 'Room for big projects', w: { creator: 1, gamer: 1 } },
    ],
  },
};

export const BUDGETS = [
  { id: 'low', label: 'Under ₹1.5 lakh', min: 0, max: 150000 },
  { id: 'mid', label: '₹1.5 to 2.5 lakh', min: 150000, max: 250000 },
  { id: 'high', label: 'Above ₹2.5 lakh', min: 250000, max: Infinity },
  { id: 'any', label: 'Show me the best fit', min: 0, max: Infinity },
];

// Level 3: permission cards. ok = the right answer is Allow.
export const PERMISSIONS = [
  { text: 'Upload your selfie to our servers', ok: true, note: 'Needed, or cloud AI can’t edit. But your photo just left your laptop.' },
  { text: 'Read all your contacts', ok: false, note: 'Leaked! A photo editor never needs your contacts.' },
  { text: 'Keep a copy of your photos forever', ok: false, note: 'Leaked! Your photos now live on their server.' },
  { text: 'Track your location in the background', ok: false, note: 'Leaked! They now know where you hang out.' },
  { text: 'Send the edited selfie back to you', ok: true, note: 'Fair. That’s the whole point.' },
  { text: 'Use your chats to show you ads', ok: false, note: 'Leaked! Your chats now sell ads.' },
  { text: 'Turn on your microphone', ok: false, note: 'Leaked! A selfie edit doesn’t need your mic.' },
  { text: 'Share your face data with partners', ok: false, note: 'Leaked! Your face is now in someone’s dataset.' },
];

// Level 4: a Gen-Z day on an Intel AI PC, one 4-second microgame per moment.
// engine = which part of the chip does it; kept to well-known, checkable examples.
export const MOMENTS = [
  {
    id: 'lecture', clock: '8:00 AM', place: 'Lecture', useCase: 'Learning',
    verb: 'TAP', instruction: 'Tap CC for live captions', engine: 'NPU',
    done: 'Live captions, running on the NPU with Wi-Fi off',
  },
  {
    id: 'call', clock: '11:00 AM', place: 'Video call', useCase: 'Work',
    verb: 'SWIPE', instruction: 'Swipe to blur your messy room', engine: 'NPU',
    done: 'Background blur on the NPU, all call long, barely touching the battery',
  },
  {
    id: 'reel', clock: '4:00 PM', place: 'Reel edit', useCase: 'Creativity',
    verb: 'TAP', instruction: 'Tap yourself to cut out the background', engine: 'GPU',
    done: 'Background removed by the built-in Intel GPU, right on your laptop',
  },
  {
    id: 'game', clock: '9:00 PM', place: 'Gaming', useCase: 'Gaming',
    verb: 'HOLD', instruction: 'Hold BOOST to switch on AI upscaling', engine: 'GPU',
    done: 'XeSS AI upscaling on Intel graphics: smoother frames',
  },
  {
    id: 'notes', clock: '11:30 PM', place: 'Exam night', useCase: 'Everyday',
    verb: 'MASH', instruction: 'Mash to summarise 40 pages, offline', engine: 'NPU',
    done: 'Notes summarised on-device. No Wi-Fi, nothing uploaded',
  },
];

export const PERSONAS = {
  student: { title: "You're the All-Day Student", line: 'Lectures, notes and assignments on one charge.' },
  creator: { title: "You're the Creator", line: 'Photos, reels and edits, done on your own laptop.' },
  gamer: { title: "You're the Gamer", line: 'Frames, streams and squad calls without lag.' },
  pro: { title: "You're the Hustler", line: 'Meetings, decks and deadlines, sorted.' },
};

// Real Intel Core Ultra Series 3 laptops listed in India. w = how well it fits each persona (0–3).
// Prices as listed on smartprix.com on 25 Nov 2026.
export const LAPTOPS = {
  'ideapad-slim-3': {
    model: 'Lenovo IdeaPad Slim 3 14', chip: 'Intel Core Ultra 5 322', specs: '14-inch, 16 GB, 512 GB SSD', price: 109990,
    w: { student: 3, pro: 1, creator: 1, gamer: 0 },
    why: ['Built-in NPU for offline captions and note summaries', '16 GB memory for multitasking through college', 'The best-value Intel AI PC in this line-up'],
  },
  'thinkpad-e16': {
    model: 'Lenovo ThinkPad E16 Gen 4', chip: 'Intel Core Ultra 7 355', specs: '16-inch, 16 GB, 512 GB SSD', price: 138991,
    w: { student: 2, pro: 3, creator: 1, gamer: 0 },
    why: ['Big 16-inch screen for spreadsheets and code', 'ThinkPad keyboard made for long typing days', 'NPU handles call blur and noise removal'],
  },
  'yoga-7-2in1': {
    model: 'Lenovo Yoga 7 2-in-1', chip: 'Intel Core Ultra 5 322 (Intel Evo)', specs: '2-in-1 touch, 16 GB, 512 GB SSD', price: 160990,
    w: { student: 3, pro: 1, creator: 2, gamer: 0 },
    why: ['Folds into a tablet for handwritten notes', 'Intel Evo design, tested for responsiveness and battery', 'NPU runs live captions without internet'],
  },
  'zenbook-s14': {
    model: 'ASUS Zenbook S14 (2026)', chip: 'Intel Core Ultra 7 355', specs: '14-inch, 16 GB, 512 GB SSD', price: 171990,
    w: { student: 2, pro: 2, creator: 2, gamer: 0 },
    why: ['Thin and light, made to carry everywhere', 'NPU keeps AI features running all day', 'Premium build that lasts for years'],
  },
  'expertbook-p5': {
    model: 'ASUS ExpertBook P5', chip: 'Intel Core Ultra 7 356H', specs: '16-inch, 32 GB, 1 TB SSD', price: 179990,
    w: { student: 1, pro: 3, creator: 1, gamer: 1 },
    why: ['32 GB memory for heavy multitasking', 'Core Ultra 7 H-series for demanding work apps', 'Client files stay on the device with on-device AI'],
  },
  'zenbook-14': {
    model: 'ASUS Zenbook 14 (2026)', chip: 'Intel Core Ultra 9 386H', specs: '14-inch 2880×1800 touch, 16 GB, 512 GB SSD', price: 184990,
    w: { student: 1, pro: 1, creator: 3, gamer: 2 },
    why: ['Core Ultra 9 for fast AI photo and video edits', 'Sharp 2.8K touch screen for editing', 'Your raw files stay on your laptop'],
  },
  'yoga-pro-7i': {
    model: 'Lenovo Yoga Pro 7i Gen 11', chip: 'Intel Core Ultra 7 356H + RTX 5050', specs: '15.3-inch 2560×1600, 32 GB, 1 TB SSD', price: 254491,
    w: { student: 0, pro: 1, creator: 3, gamer: 3 },
    why: ['Core Ultra 7 with a dedicated RTX 5050 for real gaming', 'Windows games and anti-cheat run natively on x86', 'NPU handles stream blur and mic clean-up while you play'],
  },
  'expertbook-ultra': {
    model: 'ASUS ExpertBook Ultra (2026)', chip: 'Intel Core Ultra X7 358H', specs: '14-inch touch, 32 GB, 1 TB SSD', price: 269990,
    w: { student: 0, pro: 3, creator: 2, gamer: 1 },
    why: ['Core Ultra X7 with Intel Arc graphics and 32 GB memory', 'Call blur, noise removal and captions on the NPU', 'Client files never leave the device'],
  },
  'omnibook-7': {
    model: 'HP OmniBook 7 14', chip: 'Intel Core Ultra X7 358H', specs: '14-inch, 32 GB, 1 TB SSD', price: 274990,
    w: { student: 1, pro: 2, creator: 3, gamer: 2 },
    why: ['Core Ultra X7 with Intel Arc graphics for creative AI', '32 GB and 1 TB for big projects', 'Light enough to edit anywhere, even offline'],
  },
  'zephyrus-g16': {
    model: 'ASUS ROG Zephyrus G16 (2026)', chip: 'Intel Core Ultra 9 386H + RTX 5080', specs: '16-inch 2560×1600, 32 GB, 2 TB SSD', price: 529990,
    w: { student: 0, pro: 0, creator: 2, gamer: 4 },
    why: ['Core Ultra 9 with an RTX 5080 for top-tier gaming', 'Windows games and anti-cheat run natively on x86', 'NPU handles stream blur and mic clean-up, so the GPU stays on frames'],
  },
};

export const PRICE_NOTE = 'Price as listed on Smartprix, 25 Nov 2026. Check today’s in-store price.';

export const rupees = (n) => '₹' + n.toLocaleString('en-IN');

// Sum the persona points from every option picked across the levels.
export function personaScores(answers) {
  const s = { student: 0, creator: 0, gamer: 0, pro: 0 };
  for (const w of answers) for (const [p, v] of Object.entries(w)) s[p] += v;
  return s;
}

export function topPersona(scores) {
  return Object.keys(scores).reduce((a, b) => (scores[b] > scores[a] ? b : a), 'student');
}

const fit = (laptop, scores) => Object.entries(scores).reduce((t, [p, v]) => t + v * (laptop.w[p] || 0), 0);

// Best laptop inside the budget, plus a runner-up: a clearly better pick above budget
// ("worth stretching for"), otherwise the next best inside the budget.
export function recommend(answers, budgetId = 'any') {
  const scores = personaScores(answers);
  const b = BUDGETS.find((x) => x.id === budgetId) || BUDGETS[3];
  const ranked = Object.entries(LAPTOPS)
    .map(([id, l]) => ({ id, ...l, score: fit(l, scores) }))
    .sort((x, y) => y.score - x.score || x.price - y.price);
  const inBudget = ranked.filter((l) => l.price >= b.min && l.price < b.max);
  const pool = inBudget.length ? inBudget : ranked;
  const best = pool[0];
  // A realistic stretch: at most 30% over the top of the budget.
  const stretch = ranked.find((l) => l.price >= b.max && l.price <= b.max * 1.3 && l.score > best.score * 1.2);
  const runnerUp = stretch
    ? { ...stretch, tag: 'Worth stretching for' }
    : pool[1] && { ...pool[1], tag: 'Also a great fit' };
  return { best, runnerUp, persona: topPersona(scores), scores };
}

export function personaOf(laptopId) {
  const w = LAPTOPS[laptopId]?.w || {};
  return Object.keys(w).reduce((a, b) => ((w[b] || 0) > (w[a] || 0) ? b : a), 'student');
}

// Share link (QR / Save my match): carries the persona scores and budget, so the phone
// recomputes exactly the same match, persona, mix and runner-up as the kiosk.
const PERSONA_KEYS = ['student', 'creator', 'gamer', 'pro'];

export function shareQuery(scores, budgetId) {
  return `s=${PERSONA_KEYS.map((k) => scores[k] || 0).join('-')}&b=${budgetId || 'any'}`;
}

export function readShare(search) {
  const q = new URLSearchParams(search);
  const n = (q.get('s') || '').split('-').map(Number);
  if (n.length !== 4 || n.some((x) => !Number.isInteger(x) || x < 0 || x > 99)) return null;
  const budget = BUDGETS.some((b) => b.id === q.get('b')) ? q.get('b') : 'any';
  return { scores: Object.fromEntries(PERSONA_KEYS.map((k, i) => [k, n[i]])), budget };
}
