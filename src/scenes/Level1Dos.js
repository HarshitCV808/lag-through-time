import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES } from '../theme.js';
import { Button } from '../ui.js';
import { music, sfx } from '../audio.js';

const WORDS = ['DIR', 'RUN', 'PRINT'];
const DECOYS = 'AEKLMOSTXZ';
const LAG_MS = 900; // every keystroke echoes late, like a 4.77 MHz machine
const SPIN = ['|', '/', '-', '\\'];

export default class Level1Dos extends Base {
  constructor() { super('L1'); }

  build() {
    this.th = THEMES.dos;
    music('dos');
    Object.assign(this, { wi: 0, typed: '', queue: [], busy: true, keys: [], disk: null, cursorOn: true });
    this.lines = ['MICRO-PC 1981   64 KB MEMORY', 'TEXT MODE ONLY. NO MOUSE.', ''];
    this.makeHud('Level 1 of 4   1981');
    this.goal = this.add.text(0, 0, '', { fontFamily: 'VT323', color: '#b6ffcc' });
    this.term = this.add.text(0, 0, '', { fontFamily: 'VT323', color: this.th.ink });
    // Shows the lag: keys you pressed waiting for the CPU, and a spinner while it is busy.
    this.bufT = this.add.text(0, 0, '', { fontFamily: 'VT323', color: '#ffd23f' });
    this.time.addEvent({ delay: 500, loop: true, callback: () => { this.cursorOn = !this.cursorOn; this.render(); } });
    this.time.addEvent({ delay: LAG_MS, loop: true, callback: () => this.flush() });
    this.ask({
      kicker: 'Level 1 of 4',
      title: '1981: the first PC',
      body: 'No mouse, no colour, no internet. Just a blinking cursor. Type DIR, RUN and PRINT to finish your homework.',
      buttons: [{ label: 'Next', onClick: () => this.askMulti('L1', 'Quick question', () => this.boot()) }],
    });
  }

  // CRT power-on: a bright line snaps open into the screen.
  boot() {
    if (this.reduced) return this.start();
    const line = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.s(4), 0xb6ffcc).setDepth(50);
    const cover = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000).setDepth(49);
    this.tweens.add({ targets: line, scaleX: { from: 0.02, to: 1 }, duration: 220, ease: 'Quad.Out' });
    this.tweens.add({
      targets: [line, cover], scaleY: { from: 1, to: 0 }, delay: 240, duration: 0,
      onComplete: () => {
        cover.destroy();
        line.setSize(this.W, this.H).setPosition(this.W / 2, this.H / 2).setScale(1).setAlpha(0.35);
        this.tweens.add({ targets: line, alpha: 0, duration: 260, onComplete: () => line.destroy() });
        this.start();
      },
    });
  }

  start() {
    this.t0 = this.time.now;
    this.busy = false;
    this.makeKeys();
  }

  get word() { return WORDS[this.wi]; }

  setGoal(text) {
    this.goalText = text;
    this.goal.setText(text);
  }

  makeKeys() {
    this.keys.forEach((k) => k.destroy());
    this.keys = [];
    if (!this.word) return;
    this.setGoal(`TYPE: ${this.word}`);
    const letters = [...new Set(this.word)];
    const pool = DECOYS.split('').filter((c) => !letters.includes(c));
    Phaser.Utils.Array.Shuffle(pool);
    const all = Phaser.Utils.Array.Shuffle([...letters, ...pool.slice(0, 6 - letters.length)]);
    this.keys = all.map((ch) => new Button(this, this.th, ch, () => this.press(ch), { font: 'VT323' }));
    this.placeKeys();
  }

  onKey(e) {
    if (e.key.length === 1 && /[a-z]/i.test(e.key)) this.press(e.key.toUpperCase());
  }

  press(ch) {
    if (this.busy || !this.word || !this.t0) return;
    const next = this.word[this.typed.length + this.queue.length];
    if (ch !== next) { sfx('no'); this.cameras.main.shake(120, 0.004); return; }
    this.queue.push(ch);
    sfx('pop');
    // The key visibly goes down now; the letter only appears on screen much later.
    const k = this.keys.find((b) => b.t.text === ch);
    if (k) { k.setAlpha(0.35); this.time.delayedCall(LAG_MS * this.queue.length, () => k.active && k.setAlpha(1)); }
  }

  flush() {
    if (!this.queue.length) return;
    this.typed += this.queue.shift();
    sfx('key');
    this.render();
    if (this.typed === this.word) {
      this.busy = true;
      this.exec(this.word);
    }
  }

  exec(word) {
    this.lines.push(`C:\\> ${word}`);
    this.typed = '';
    this.keys.forEach((k) => k.setVisible(false));
    if (word === 'DIR') {
      this.lines.push('HOMEWORK BAS    4K', 'GAME     BAS    8K', '  2 FILE(S)', '');
      this.next();
    } else if (word === 'RUN') {
      this.setGoal('LOADING…');
      this.lines.push('LOADING HOMEWORK.BAS ');
      this.dots(6, 2600, () => {
        this.lines.push('INSERT DISK 2, THEN TAP THE DISK');
        this.setGoal('TAP THE FLOPPY DISK');
        this.showDisk();
      });
    } else {
      this.setGoal('PRINTING…');
      this.lines.push('PRINTING ');
      this.dots(6, 2600, () => {
        this.lines.push('DONE. TEXT ONLY. NO PHOTOS, NO COLOUR.');
        this.render();
        this.finish();
      });
    }
    this.render();
  }

  next() {
    this.wi++;
    this.busy = false;
    this.makeKeys();
    this.render();
  }

  dots(n, ms, cb) {
    let left = n;
    this.time.addEvent({
      delay: ms / n, repeat: n - 1,
      callback: () => {
        this.lines[this.lines.length - 1] += '.';
        this.render();
        if (--left === 0) cb();
      },
    });
  }

  showDisk() {
    const d = (this.disk = this.add.container(0, 0));
    d.g = this.add.graphics();
    d.add(d.g);
    d.setSize(10, 10).setInteractive({ useHandCursor: true });
    d.on('pointerup', () => {
      sfx('ok');
      d.destroy();
      this.disk = null;
      this.lines.push('READING DISK 2 ');
      this.setGoal('READING DISK…');
      this.dots(5, 2000, () => {
        this.lines.push('HOMEWORK READY.', '');
        this.next();
      });
    });
    this.tweens.add({ targets: d, scale: 1.08, yoyo: true, repeat: -1, duration: 420 });
    this.placeDisk();
  }

  placeDisk() {
    const d = this.disk;
    if (!d) return;
    const s = (n) => this.s(n);
    const z = s(this.portrait ? 120 : 110);
    d.setPosition(this.W / 2, this.keysTop - z / 2 - s(24));
    d.setSize(z, z);
    d.input.hitArea.setTo(0, 0, z, z);
    const g = d.g;
    const h = z / 2;
    g.clear();
    g.fillStyle(0x3dff7a).fillRect(-h, -h, z, z);
    g.fillStyle(0x030a05).fillRect(-h * 0.5, -h, h, h * 0.7);
    g.fillStyle(0x3dff7a).fillRect(-h * 0.05, -h * 0.9, h * 0.25, h * 0.5);
    g.fillStyle(0x030a05).fillRect(-h * 0.7, h * 0.05, h * 1.4, h * 0.8);
  }

  placeKeys() {
    if (!this.keys.length) return;
    const s = (n) => this.s(n);
    const pad = s(18);
    const gap = s(12);
    const perRow = this.portrait ? 3 : 6;
    const rows = Math.ceil(this.keys.length / perRow);
    const kw = Math.min((this.W - pad * 2 - gap * (perRow - 1)) / perRow, s(120));
    const kh = s(64);
    const totalW = perRow * kw + (perRow - 1) * gap;
    const top = this.H - pad - rows * kh - (rows - 1) * gap;
    this.keys.forEach((k, i) => {
      const c = i % perRow;
      const r = Math.floor(i / perRow);
      k.place(this.W / 2 - totalW / 2 + kw / 2 + c * (kw + gap), top + kh / 2 + r * (kh + gap), kw, kh, s(34));
    });
  }

  layout() {
    const s = (n) => this.s(n);
    const pad = s(18);
    const y = this.layoutHud();
    this.goal.setPosition(pad, y).setFontSize(s(30));
    this.bufT.setPosition(pad, y + s(36)).setFontSize(s(24));
    const rows = this.portrait ? 2 : 1;
    this.keysTop = this.H - pad - rows * s(64) - (rows - 1) * s(12);
    this.termTop = y + s(74);
    this.term.setPosition(pad, this.termTop).setFontSize(s(24)).setWordWrapWidth(this.W - pad * 2, true);
    this.placeKeys();
    this.placeDisk();
    this.render();
  }

  render() {
    if (!this.term) return;
    const fs = this.s(24);
    const avail = this.keysTop - this.termTop - this.s(16) - (this.disk ? this.s(150) : 0);
    const max = Math.max(3, Math.floor(avail / (fs * 1.05)));
    const prompt = this.t0 && !this.done && !this.busy ?`C:\\> ${this.typed}${this.cursorOn ? '█' : ' '}` : '';
    const shown = [...this.lines, prompt].slice(-max);
    this.term.setText(shown.join('\n'));
  }

  update(t) {
    this.tickHud();
    if (!this.t0 || this.done) return this.bufT.setText('');
    const spin = SPIN[Math.floor(t / 130) % SPIN.length];
    if (this.queue.length) this.bufT.setText(`KEYS WAITING FOR CPU: ${this.queue.join(' ')}  ${spin}`);
    else if (this.busy && !this.disk) this.bufT.setText(`CPU BUSY, PLEASE WAIT ${spin}`);
    else this.bufT.setText('');
  }

  finish() {
    this.done = true;
    const sec = this.secs();
    this.record('L1', sec);
    this.hudT.setText(`${sec}s`);
    sfx('win');
    this.party();
    this.time.delayedCall(700, () => this.ask({
      kicker: `Finished in ${sec}s`,
      title: 'Bhai, itna slow?',
      body: 'In 1981 a PC did one thing at a time, spoke only text and loaded programs from floppy disks.',
      buttons: [{ label: 'Jump to 2003', onClick: () => this.warp('L2', THEMES.y2k) }],
    }));
  }
}
