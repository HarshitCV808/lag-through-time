// Tiny WebAudio synth: no audio files to load. Sound is on by default; browsers only
// allow audio after the first tap or key press, so unlock() runs on that first gesture.
let ctx = null;
let master = null;
let muted = false;
let era = null;
let loop = null;

const ensure = () => {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = 0.3;
  master.connect(ctx.destination);
};

const freq = (midi) => 440 * 2 ** ((midi - 69) / 12);

function tone(f, dur, type = 'square', vol = 0.2, when = 0, slideTo = null) {
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const SFX = {
  click: () => tone(660, 0.06, 'square', 0.12),
  key: () => tone(1200, 0.03, 'square', 0.08),
  ok: () => { tone(660, 0.1, 'triangle', 0.2); tone(990, 0.16, 'triangle', 0.2, 0.08); },
  no: () => tone(180, 0.22, 'sawtooth', 0.15),
  charge: () => tone(400, 0.25, 'triangle', 0.2, 0, 1200),
  fail: () => tone(500, 0.6, 'sawtooth', 0.18, 0, 60),
  pop: () => tone(880, 0.08, 'sine', 0.2),
  warp: () => tone(200, 0.35, 'sine', 0.2, 0, 1600),
  win: () => [523, 659, 784, 1047].forEach((n, i) => tone(n, 0.25, 'triangle', 0.18, i * 0.1)),
};

const SONGS = {
  dos: { bpm: 110, type: 'square', notes: [45, 0, 52, 0, 45, 0, 52, 0, 43, 0, 50, 0, 43, 0, 50, 0] },
  y2k: { bpm: 120, type: 'triangle', notes: [57, 60, 64, 60, 57, 60, 64, 67, 55, 59, 62, 59, 55, 59, 62, 64] },
  cloud: { bpm: 96, type: 'sine', notes: [64, 0, 67, 0, 71, 0, 67, 0, 62, 0, 66, 0, 69, 0, 66, 0] },
  ai: { bpm: 124, type: 'triangle', notes: [52, 59, 64, 71, 52, 59, 64, 69, 50, 57, 62, 69, 50, 57, 62, 66] },
};

function stopLoop() {
  if (loop) clearInterval(loop);
  loop = null;
}

function startLoop() {
  stopLoop();
  const song = SONGS[era];
  if (muted || !song || !ctx) return;
  const step = 60000 / song.bpm / 2;
  let i = 0;
  loop = setInterval(() => {
    const n = song.notes[i++ % song.notes.length];
    if (n) tone(freq(n), (step / 1000) * 0.9, song.type, 0.07);
  }, step);
}

export const isMuted = () => muted;

export function unlock() {
  ensure();
  ctx.resume();
  if (!loop) startLoop();
}

export function setMuted(m) {
  muted = m;
  if (!m) {
    ensure();
    ctx.resume();
  }
  startLoop();
}

export function sfx(name) {
  if (muted || !ctx) return;
  SFX[name]?.();
}

export function music(name) {
  era = name;
  startLoop();
}

document.addEventListener('visibilitychange', () => (document.hidden ? stopLoop() : startLoop()));
