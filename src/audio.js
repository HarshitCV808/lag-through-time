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

// Filtered white noise: the raw material for whirrs, modems and crowd murmur.
let noiseBuf = null;
function noise(dur, vol, when = 0, f = 1000, q = 1, sweepTo = null, type = 'bandpass') {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + when;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = type;
  bp.frequency.setValueAtTime(f, t);
  if (sweepTo) bp.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  bp.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// Era sound effects.
const floppy = () => {
  tone(70, 0.08, 'square', 0.15); // drive clunk
  noise(0.9, 0.12, 0.05, 900, 3); // spinning whirr
  for (let i = 0; i < 7; i++) tone(180 + (i % 2) * 40, 0.03, 'square', 0.08, 0.15 + i * 0.11); // head steps
};
const printer = () => {
  for (let i = 0; i < 14; i++) noise(0.03, 0.2, i * 0.07, 3500, 2); // dot-matrix ticks
  noise(0.25, 0.1, 1.0, 600, 1); // paper feed
};
const modem = () => {
  // Dial-up: four dial tones, then the handshake screech.
  [[697, 1209], [770, 1336], [852, 1477], [941, 1336]].forEach(([a, b], i) => {
    tone(a, 0.09, 'sine', 0.05, i * 0.12);
    tone(b, 0.09, 'sine', 0.05, i * 0.12);
  });
  tone(2100, 0.35, 'sine', 0.05, 0.6);
  noise(0.45, 0.07, 1.0, 1800, 4);
  tone(1200, 0.3, 'sawtooth', 0.03, 1.45, 2400);
  noise(0.6, 0.06, 1.75, 2600, 2, 900);
};
const whoosh = () => {
  noise(0.5, 0.18, 0, 300, 1.5, 3500);
  tone(1320, 0.3, 'sine', 0.06, 0.2);
  tone(1980, 0.35, 'sine', 0.05, 0.3);
};

const SFX = {
  floppy,
  printer,
  modem,
  whoosh,
  ping: () => { tone(1320, 0.08, 'sine', 0.12); tone(1760, 0.12, 'sine', 0.1, 0.07); },
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

// Café ambience for 2015: crowd murmur that swells and dips, plus the odd cup clink.
let amb = null;
let ambName = null;
function stopAmb() {
  if (amb) clearInterval(amb);
  amb = null;
}
function startAmb() {
  stopAmb();
  if (muted || !ctx || ambName !== 'cafe') return;
  const tick = () => {
    noise(0.7, 0.025 + Math.random() * 0.03, 0, 450 + Math.random() * 500, 0.8);
    if (Math.random() < 0.12) tone(2600 + Math.random() * 600, 0.12, 'sine', 0.03);
  };
  tick();
  amb = setInterval(tick, 380);
}

export function ambience(name) {
  ambName = name;
  startAmb();
}

export const isMuted = () => muted;

// Called on user gestures until audio is actually running. Browsers only allow audio to
// start inside a real gesture (on phones that's the finger lifting, not pointerdown), and
// older iPhones also need a sound played inside that gesture, hence the silent sample.
export function unlock() {
  ensure();
  if (ctx.state === 'running') return;
  const src = ctx.createBufferSource();
  src.buffer = ctx.createBuffer(1, 1, 22050);
  src.connect(ctx.destination);
  src.start(0);
  ctx.resume().then(() => { startLoop(); startAmb(); }).catch(() => {});
}

export const audioRunning = () => ctx?.state === 'running';

export function setMuted(m) {
  muted = m;
  if (!m) {
    ensure();
    ctx.resume();
  }
  startLoop();
  startAmb();
}

export function sfx(name) {
  if (muted || !ctx) return;
  SFX[name]?.();
}

export function music(name) {
  era = name;
  startLoop();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopLoop(); stopAmb(); } else { startLoop(); startAmb(); }
});
