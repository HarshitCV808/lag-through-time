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
  { id: 'low', label: 'Under ₹1.5 lakh', phrase: 'under ₹1.5 lakh', min: 0, max: 150000 },
  { id: 'mid', label: '₹1.5 to 2 lakh', phrase: 'between ₹1.5 and 2 lakh', min: 150000, max: 200000 },
  { id: 'upper', label: '₹2 to 3 lakh', phrase: 'between ₹2 and 3 lakh', min: 200000, max: 300000 },
  { id: 'high', label: 'Above ₹3 lakh', phrase: 'above ₹3 lakh', min: 300000, max: Infinity },
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
    done: 'Live captions, running on the NPU with Wi-Fi off', short: 'Live captions (NPU)',
  },
  {
    id: 'call', clock: '11:00 AM', place: 'Video call', useCase: 'Work',
    verb: 'SWIPE', instruction: 'Swipe to blur your messy room', engine: 'NPU',
    done: 'Background blur on the NPU, all call long, barely touching the battery', short: 'Background blur (NPU)',
  },
  {
    id: 'reel', clock: '4:00 PM', place: 'Reel edit', useCase: 'Creativity',
    verb: 'TAP', instruction: 'Tap yourself to cut out the background', engine: 'GPU',
    done: 'Background removed by the built-in Intel GPU, right on your laptop', short: 'Photo cut-out (GPU)',
  },
  {
    id: 'game', clock: '9:00 PM', place: 'Gaming', useCase: 'Gaming',
    verb: 'HOLD', instruction: 'Hold BOOST to switch on AI upscaling', engine: 'GPU',
    done: 'XeSS AI upscaling on Intel graphics: smoother frames', short: 'XeSS upscaling (GPU)',
  },
  {
    id: 'notes', clock: '11:30 PM', place: 'Exam night', useCase: 'Everyday',
    verb: 'MASH', instruction: 'Mash to summarise 40 pages, offline', engine: 'NPU',
    done: 'Notes summarised on-device by the NPU or GPU, depending on the app. No Wi-Fi, nothing uploaded', short: 'Notes summary (NPU or GPU)',
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
// w = how well it suits each persona (0 = not at all, 3 = made for it).
// fit = the first reason shown, written for the shopper's persona. why = general facts.
export const LAPTOPS = {
  'ideapad-slim-3': {
    model: 'Lenovo IdeaPad Slim 3 14', chip: 'Intel Core Ultra 5 322', specs: '14-inch, 16 GB, 512 GB SSD', price: 109990,
    w: { student: 3, pro: 1, creator: 1, gamer: 0.5 },
    fit: { student: 'Light and affordable for full college days', pro: 'Handles office apps and video calls', creator: 'Fine for light photo edits and social posts', gamer: 'Casual and cloud gaming only; no gaming graphics' },
    why: ['Built-in NPU runs captions and AI features offline', 'Best-value Intel AI PC in this line-up'],
  },
  'thinkpad-e16': {
    model: 'Lenovo ThinkPad E16 Gen 4', chip: 'Intel Core Ultra 7 355', specs: '16-inch, 16 GB, 512 GB SSD', price: 138991,
    w: { student: 2, pro: 3, creator: 1, gamer: 0.5 },
    fit: { student: 'Big 16-inch screen for notes, code and assignments', pro: 'Business-grade ThinkPad keyboard for long work days', creator: 'Big screen for light editing', gamer: 'Casual games only; no gaming graphics' },
    why: ['NPU handles call blur and noise removal', 'Core Ultra 7 for smooth multitasking'],
  },
  'yoga-7-2in1': {
    model: 'Lenovo Yoga 7 2-in-1', chip: 'Intel Core Ultra 5 322 (Intel Evo)', specs: '2-in-1 touch, 16 GB, 512 GB SSD', price: 160990,
    w: { student: 3, pro: 1, creator: 2, gamer: 0 },
    fit: { student: 'Flips into a tablet for handwritten notes', pro: 'Tablet mode for sketching ideas in meetings', creator: 'Touch screen for sketching and photo touch-ups', gamer: 'Casual games only; no gaming graphics' },
    why: ['Intel Evo design, tested for responsiveness and battery', 'NPU runs live captions without internet'],
  },
  'zenbook-s14': {
    model: 'ASUS Zenbook S14 (2026)', chip: 'Intel Core Ultra 7 355', specs: '14-inch, 16 GB, 512 GB SSD', price: 171990,
    w: { student: 2, pro: 2, creator: 2, gamer: 0.5 },
    fit: { student: 'Thin, light and premium for campus', pro: 'Light enough for every commute and client visit', creator: 'Portable for photo edits on the go', gamer: 'Casual games only; no gaming graphics' },
    why: ['NPU keeps AI features running all day', 'Premium build that lasts for years'],
  },
  'expertbook-p5': {
    model: 'ASUS ExpertBook P5', chip: 'Intel Core Ultra 7 356H', specs: '16-inch, 32 GB, 1 TB SSD', price: 179990,
    w: { student: 1, pro: 3, creator: 1.5, gamer: 1 },
    fit: { student: 'H-series power for heavy coursework', pro: '32 GB memory for heavy multitasking', creator: 'H-series chip and 32 GB for bigger edits', gamer: 'Light gaming on built-in Intel graphics' },
    why: ['1 TB storage for big projects', 'Client files stay on the device with on-device AI'],
  },
  'zenbook-14': {
    model: 'ASUS Zenbook 14 (2026)', chip: 'Intel Core Ultra 9 386H', specs: '14-inch 2880×1800 touch, 16 GB, 512 GB SSD', price: 184990,
    w: { student: 1, pro: 1, creator: 3, gamer: 1.5 },
    fit: { student: 'Fast Core Ultra 9 for demanding projects', pro: 'Sharp 2.8K screen for long work days', creator: 'Sharp 2.8K touch screen made for editing', gamer: 'Light gaming with XeSS upscaling on Intel graphics' },
    why: ['Core Ultra 9 for fast AI photo and video edits', 'Your raw files stay on your laptop'],
  },
  'yoga-pro-7i': {
    model: 'Lenovo Yoga Pro 7i Gen 11', chip: 'Intel Core Ultra 7 356H + RTX 5050', specs: '15.3-inch 2560×1600, 32 GB, 1 TB SSD', price: 254491,
    w: { student: 0.5, pro: 1, creator: 3, gamer: 3 },
    fit: { student: 'Powerful, but more than most coursework needs', pro: 'RTX graphics for heavy work apps', creator: 'RTX 5050 and Core Ultra 7 for fast video editing', gamer: 'Dedicated RTX 5050 graphics for real gaming' },
    why: ['Windows games and anti-cheat run natively on x86', 'NPU handles stream blur and mic clean-up'],
  },
  'expertbook-ultra': {
    model: 'ASUS ExpertBook Ultra (2026)', chip: 'Intel Core Ultra X7 358H', specs: '14-inch touch, 32 GB, 1 TB SSD', price: 269990,
    w: { student: 0.5, pro: 3, creator: 2, gamer: 1.5 },
    fit: { student: 'Premium, but more than most coursework needs', pro: 'Core Ultra X7 and 32 GB for demanding work', creator: 'Intel Arc graphics for creative AI', gamer: 'Intel Arc graphics for smooth casual gaming' },
    why: ['Call blur, noise removal and captions on the NPU', 'Client files never leave the device'],
  },
  'omnibook-7': {
    model: 'HP OmniBook 7 14', chip: 'Intel Core Ultra X7 358H', specs: '14-inch, 32 GB, 1 TB SSD', price: 274990,
    w: { student: 1, pro: 2, creator: 3, gamer: 2 },
    fit: { student: 'Powerful and light for big projects', pro: '32 GB and 1 TB for heavy work', creator: 'Intel Arc graphics, 32 GB and 1 TB for big creative projects', gamer: 'Intel Arc graphics with XeSS for smooth gaming in a thin laptop' },
    why: ['Light enough to edit anywhere, even offline', 'NPU runs AI features without draining the battery'],
  },
  'zephyrus-g16': {
    model: 'ASUS ROG Zephyrus G16 (2026)', chip: 'Intel Core Ultra 9 386H + RTX 5080', specs: '16-inch 2560×1600, 32 GB, 2 TB SSD', price: 529990,
    w: { student: 0, pro: 0.5, creator: 2.5, gamer: 3.5 },
    fit: { student: 'Far more power than coursework needs', pro: 'Desktop-class power, but heavy to carry', creator: 'RTX 5080 for heavy 3D and video work', gamer: 'RTX 5080 for top-tier gaming at high settings' },
    why: ['Windows games and anti-cheat run natively on x86', 'NPU handles stream blur and mic clean-up, so the GPU stays on frames'],
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

// Persona shares (they sum to 1), so a mix of answers is weighed fairly.
const shares = (scores) => {
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v / total]));
};
const fitOf = (laptop, sh) => Object.entries(sh).reduce((t, [p, v]) => t + v * (laptop.w[p] || 0), 0);
const NEAR_TIE = 0.15; // fits this close count as equal; then the cheaper laptop wins

// Best laptop inside the budget, a runner-up, and whether the budget really suits the
// shopper's main persona (if not, the result screen says so honestly).
export function recommend(answers, budgetId = 'any') {
  const scores = personaScores(answers);
  const persona = topPersona(scores);
  const sh = shares(scores);
  const b = BUDGETS.find((x) => x.id === budgetId) || BUDGETS.find((x) => x.id === 'any');
  // "Best fit" with no budget weighs value: a little penalty per lakh, so ₹5 lakh only
  // wins when it is clearly the better fit.
  const valuePenalty = (l) => (b.id === 'any' ? (l.price / 100000) * 0.04 : 0);
  const all = Object.entries(LAPTOPS).map(([id, l]) => ({ id, ...l, score: fitOf(l, sh) - valuePenalty(l) }));
  // Near-ties go to the cheaper laptop (or the pricier one, when they already chose to spend less).
  const rank = (list, cheapFirst = true) => [...list].sort((x, y) => (Math.abs(y.score - x.score) <= NEAR_TIE ? (cheapFirst ? x.price - y.price : y.price - x.price) : y.score - x.score));
  const inBudget = all.filter((l) => l.price >= b.min && l.price < b.max);
  const pool = rank(inBudget.length ? inBudget : all);
  // Budget is what they can spend, not what they must: if a cheaper laptop is clearly the
  // better fit (a student with ₹3 lakh doesn't need a gaming rig), recommend that one.
  const cheaper = rank(all.filter((l) => l.price < b.min && l.score > pool[0].score + 0.4), false)[0];
  const best = cheaper || pool[0];
  // A realistic stretch: at most 30% over the top of the budget, and clearly better.
  const stretch = !cheaper && rank(all.filter((l) => l.price >= b.max && l.price <= b.max * 1.3 && l.score > best.score + 0.4))[0];
  const runnerUp = cheaper ? { ...pool[0], tag: 'Best in your budget' }
    : stretch ? { ...stretch, tag: 'Worth stretching for' } : pool[1] && { ...pool[1], tag: 'Also a great fit' };
  // Weak: not really built for any big part of what they said (a share of 30% or more).
  const weak = Object.entries(sh).filter(([, v]) => v >= 0.3).every(([p]) => (best.w[p] || 0) < 2);
  return { best, runnerUp, persona, scores, weak, saves: !!cheaper };
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
