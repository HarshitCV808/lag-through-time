// All game copy and product data in one place so it is easy to fact-check and edit.

export const L2_CHOICES = [
  { label: 'Exam notes PDF', file: 'exam-notes.pdf', persona: 'student' },
  { label: 'A new song', file: 'new-song.mp3', persona: 'creator' },
  { label: 'A game demo', file: 'game-demo.zip', persona: 'gamer' },
  { label: 'Client slides', file: 'client-pitch.ppt', persona: 'pro' },
];

export const L3_CHOICES = [
  { label: 'Summarise my lecture', file: 'lecture.mp3', persona: 'student' },
  { label: 'Beautify my selfie', file: 'selfie.jpg', persona: 'creator' },
  { label: 'Cut a montage of my game clip', file: 'clutch-clip.mp4', persona: 'gamer' },
  { label: 'Transcribe my meeting', file: 'meeting.m4a', persona: 'pro' },
];

export const L4_CHOICES = [
  { label: 'Notes that summarise themselves', persona: 'student' },
  { label: 'AI edits for my reels', persona: 'creator' },
  { label: 'More FPS with AI upscaling', persona: 'gamer' },
  { label: 'Meetings that take their own notes', persona: 'pro' },
];

export const POPUPS = [
  'Uploading your file to a data centre…',
  'Allow CloudAI to keep a copy of your file?',
  'Server busy. You are #214 in the queue.',
  'Go Premium for faster AI: ₹499/month',
  'Your file is leaving this device.',
  'Session expired. Signing you in again…',
];

export const ENGINES = [
  { id: 'CPU', desc: 'Quick, light tasks', tops: 'Instant response' },
  { id: 'GPU', desc: 'Heavy creative and gaming AI', tops: '~120 TOPS Arc GPU' },
  { id: 'NPU', desc: 'All-day, low-power AI', tops: '~50 TOPS NPU' },
];

export const TASKS = [
  { text: 'Blur my background on a video call', engine: 'NPU', why: 'Background blur runs for hours, so it goes on the low-power NPU.' },
  { text: 'More FPS with AI upscaling', engine: 'GPU', why: 'XeSS upscaling runs on the Arc GPU, right where the game is drawn.' },
  { text: 'Autocorrect while I type', engine: 'CPU', why: 'Tiny, instant jobs are quickest on the CPU.' },
  { text: 'Live captions for my lecture', engine: 'NPU', why: 'Captions run all class long. The NPU does it on very little power.' },
  { text: 'Erase the background from a photo', engine: 'GPU', why: 'Heavy image AI is fastest on the Arc GPU.' },
  { text: 'Remove noise from my mic', engine: 'NPU', why: 'Always-on audio clean-up belongs on the NPU to save battery.' },
  { text: 'Generate an image from a prompt', engine: 'GPU', why: 'Image generation needs lots of parallel maths, the GPU speciality.' },
];

export const PERSONAS = {
  student: { title: "You're the All-Day Student", line: 'Lectures, notes and assignments on one charge.' },
  creator: { title: "You're the Creator", line: 'Photos, reels and edits, done on your own laptop.' },
  gamer: { title: "You're the Gamer", line: 'Frames, streams and squad calls without lag.' },
  pro: { title: "You're the Hustler", line: 'Meetings, decks and deadlines, sorted.' },
};

// Prices as listed on smartprix.com on 25 Nov 2026. Shown with a "check in store" note.
export const LAPTOPS = {
  student: {
    model: 'HP OmniBook 5 14',
    chip: 'Intel Core Ultra 5 320',
    specs: '14-inch touch, 512 GB SSD',
    price: '₹1,07,000',
    why: ['Live captions and noise removal on the NPU, even offline in class', 'Light 14-inch body for the college bag', 'Every Windows app your course needs runs natively'],
  },
  creator: {
    model: 'ASUS Zenbook 14 (2026)',
    chip: 'Intel Core Ultra 9 386H',
    specs: '14-inch 2880×1800 touch, 16 GB, 512 GB SSD',
    price: '₹1,84,990',
    why: ['AI photo and video edits on Intel Arc graphics', 'Sharp 2.8K touch screen for editing', 'Your raw files stay on your laptop'],
  },
  gamer: {
    model: 'Lenovo Yoga Pro 7i Gen 11',
    chip: 'Intel Core Ultra 7 356H + RTX 5050',
    specs: '15.3-inch 2560×1600, 32 GB, 1 TB SSD',
    price: '₹2,54,491',
    why: ['Core Ultra 7 with a dedicated RTX 5050 for real gaming', 'Windows games and anti-cheat run natively on x86', 'NPU handles stream blur and mic clean-up while you play'],
  },
  pro: {
    model: 'ASUS ExpertBook Ultra (2026)',
    chip: 'Intel Core Ultra X7 358H',
    specs: '14-inch touch, 32 GB, 1 TB SSD',
    price: '₹2,69,990',
    why: ['Core Ultra X7 with Intel Arc graphics and 32 GB memory', 'Call blur, noise removal and captions on the NPU', 'Client files never leave the device'],
  },
};

export const PRICE_NOTE = 'Prices as listed on Smartprix, 25 Nov 2026. Check today’s in-store price.';

// Most-picked persona wins; on a tie the latest pick wins.
export function topPersona(picks) {
  if (!picks.length) return 'student';
  const count = {};
  for (const p of picks) count[p] = (count[p] || 0) + 1;
  let best = picks[picks.length - 1];
  for (const p of picks) if (count[p] > count[best]) best = p;
  return best;
}
