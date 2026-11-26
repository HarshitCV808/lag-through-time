import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES, DPR } from '../theme.js';
import { readShare } from '../data.js';
import { confetti } from '../ui.js';
import { sfx } from '../audio.js';

// Opening gag (about 4.5 s): "loading your laptop" crawls and stalls in 1981, glitches into
// a stuck 2003 download, then 2015 buffering, then an Intel-blue flash snaps the bar to 100%:
// "Your AI PC is ready". Browsers only allow sound after the first tap, so it ends on
// "Tap anywhere to start". A tap at any point skips straight to the game.
const STAGES = [
  { at: 0, era: 'dos' },
  { at: 1300, era: 'y2k' },
  { at: 2400, era: 'cloud' },
  { at: 3500, era: 'ai' },
];
const GLITCH_MS = 220;

export default class Splash extends Base {
  constructor() { super({ key: 'Splash', active: true }); }

  build() {
    this.th = THEMES.ai;
    // Saved-match links (QR) skip the splash and open straight on the result.
    if (readShare(location.search) || new URLSearchParams(location.search).get('match')) {
      this.time.delayedCall(0, () => this.scene.start('Title'));
      return;
    }
    this.t = this.reduced ? 99999 : 0;
    this.stage = -1;
    this.g = this.add.graphics();
    const txt = () => this.add.text(0, 0, '', { color: '#ffffff' }).setOrigin(0.5);
    this.headT = txt();
    this.barT = txt();
    this.subT = txt();
    this.titleT = txt();
    this.tapT = txt();
    const start = () => this.go('Title');
    this.input.once('pointerup', start);
    this.overlayKeys = { Enter: start, ' ': start };
  }

  // Stage chosen from elapsed time; each stage restyles the same text objects.
  setStage(i) {
    this.stage = i;
    const s = (n) => this.s(n);
    const style = (t, font, weight, size, color) => t.setFontFamily(font).setFontStyle(weight).setFontSize(s(size)).setColor(color);
    const [h, b, sub, ti, tap] = [this.headT, this.barT, this.subT, this.titleT, this.tapT];
    [ti, tap].forEach((t) => t.setText(''));
    if (i === 0) {
      style(h, 'VT323', '', 30, '#3dff7a').setText('LOADING YOUR LAPTOP');
      style(b, 'VT323', '', 30, '#3dff7a');
      style(sub, 'VT323', '', 24, '#2fd35f').setText('PLEASE WAIT...');
    } else if (i === 1) {
      style(h, 'Silkscreen', '700', 18, '#ffffff').setText('Downloading laptop.exe');
      style(b, 'Verdana, Tahoma, sans-serif', '700', 16, '#111111');
      style(sub, 'Verdana, Tahoma, sans-serif', '700', 16, '#ffffff').setText('Time left: about 3 hours');
    } else if (i === 2) {
      style(h, 'Figtree', '800', 22, '#1b2330').setText('Buffering your laptop…');
      style(b, 'Figtree', '800', 26, '#2f6fed');
      style(sub, 'Figtree', '700', 16, '#4a5668').setText('No internet. Retrying…');
    } else {
      style(h, 'Manrope', '800', 18, '#00c7fd').setText('100%');
      style(b, 'Manrope', '700', 16, '#b7c4e8').setText('');
      style(sub, 'Manrope', '500', 15, '#b7c4e8').setText('');
      style(ti, 'Unbounded', '800', 30, '#f2f6ff').setText('Your AI PC is ready.');
      style(tap, 'Manrope', '800', 20, '#00c7fd').setText('Tap anywhere to start');
      if (!this.reduced) {
        this.cameras.main.flash(260, 0, 104, 181);
        sfx('whoosh');
        this.tweens.add({ targets: tap, alpha: 0.35, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
        this.time.delayedCall(150, () => confetti(this, this.W / 2, this.H * 0.42, ['#00c7fd', '#ffffff', '#ffc145', '#ff5fa2', '#2ef2c8'], 70));
      }
    }
    this.layout();
  }

  layout() {
    if (!this.headT) return;
    const s = (n) => this.s(n);
    const cx = this.W / 2;
    const cy = this.H / 2;
    this.cardW = Math.min(this.W - s(40), s(440));
    this.headT.setPosition(cx, cy - s(70));
    this.barT.setPosition(cx, cy);
    this.subT.setPosition(cx, cy + s(54));
    this.titleT.setPosition(cx, cy + s(8)).setWordWrapWidth(this.W - s(40), true).setAlign('center');
    this.tapT.setPosition(cx, cy + s(70));
  }

  update(_, dt) {
    if (!this.g) return;
    this.t += dt;
    const idx = STAGES.reduce((a, st, i) => (this.t >= st.at ? i : a), 0);
    if (idx !== this.stage) this.setStage(idx);
    this.draw();
  }

  draw() {
    const s = (n) => this.s(n);
    const g = this.g.clear();
    const { W, H } = this;
    const cx = W / 2;
    const cy = H / 2;
    const cw = this.cardW;
    const local = this.t - STAGES[this.stage].at;
    if (this.stage === 0) {
      g.fillStyle(0x030a05).fillRect(0, 0, W, H);
      g.fillStyle(0x000000, 0.45);
      for (let y = 0; y < H; y += 3 * DPR) g.fillRect(0, y, W, DPR);
      const pct = Math.min(3, Math.floor(local / 160));
      const n = Math.round((pct / 100) * 24) + (pct > 0 ? 1 : 0);
      const cursor = Math.floor(this.t / 400) % 2 ? '_' : ' ';
      this.barT.setText(`[${'#'.repeat(n)}${'.'.repeat(24 - n)}] ${pct}%${cursor}`);
    } else if (this.stage === 1) {
      g.fillStyle(0x2a7f86).fillRect(0, 0, W, H);
      const wh = s(150);
      const x = cx - cw / 2;
      const y = cy - wh / 2 - s(10);
      g.fillStyle(0xc9c6bd).fillRect(x, y, cw, wh);
      g.lineStyle(s(2), 0xffffff).lineBetween(x, y, x + cw, y).lineBetween(x, y, x, y + wh);
      g.lineStyle(s(2), 0x3a3a3a).lineBetween(x, y + wh, x + cw, y + wh).lineBetween(x + cw, y, x + cw, y + wh);
      g.fillStyle(0x1036a8).fillRect(x + s(4), y + s(4), cw - s(8), s(30));
      this.headT.setY(y + s(19));
      const bx = x + s(18);
      const bw = cw - s(36);
      const by = cy - s(18);
      g.fillStyle(0xffffff).fillRect(bx, by, bw, s(30));
      const blocks = Math.round(0.12 * 20);
      for (let i = 0; i < blocks; i++) g.fillStyle(0x1036a8).fillRect(bx + s(3) + i * ((bw - s(6)) / 20), by + s(4), (bw - s(6)) / 20 - s(3), s(22));
      this.barT.setText('12%').setY(cy + s(36));
      this.subT.setY(y + wh + s(26));
    } else if (this.stage === 2) {
      g.fillStyle(0xe9edf2).fillRect(0, 0, W, H);
      g.fillStyle(0xffffff).fillRoundedRect(cx - cw / 2, cy - s(110), cw, s(220), s(18));
      const r = s(30);
      const a = (this.t / 160) % (Math.PI * 2);
      g.lineStyle(s(5), 0xdfe5ee).strokeCircle(cx, cy - s(10), r);
      g.lineStyle(s(5), 0x2f6fed);
      g.beginPath();
      g.arc(cx, cy - s(10), r, a, a + Math.PI * 1.2);
      g.strokePath();
      this.headT.setY(cy - s(80));
      this.barT.setText('47%').setY(cy - s(10));
      this.subT.setY(cy + s(60));
    } else {
      g.fillStyle(0x060d2b).fillRect(0, 0, W, H);
      const R = Math.max(W, H);
      g.fillStyle(0x0068b5, 0.25).fillCircle(W * 0.85, H * 0.1, R * 0.4);
      g.fillStyle(0x00c7fd, 0.08).fillCircle(W * 0.1, H * 0.95, R * 0.35);
      // Bar snaps from where 2015 left it to 100% in a blink.
      const p = Phaser.Math.Clamp(0.47 + local / 260, 0, 1);
      const bw = cw;
      const bx = cx - bw / 2;
      const by = cy - s(58);
      g.fillStyle(0xffffff, 0.12).fillRoundedRect(bx, by, bw, s(12), s(6));
      g.fillStyle(0x00c7fd, 0.3).fillRoundedRect(bx - s(3), by - s(3), bw * p + s(6), s(18), s(9));
      g.fillStyle(0x00c7fd).fillRoundedRect(bx, by, Math.max(s(12), bw * p), s(12), s(6));
      this.headT.setText(`${Math.round(p * 100)}%`).setY(by - s(22));
      this.subT.setText('Lag Through Time').setY(cy + s(118));
    }
    // Glitch: torn horizontal slices and a colour shift right after each era change.
    if (this.stage > 0 && local < GLITCH_MS && !this.reduced) {
      const k = 1 - local / GLITCH_MS;
      for (let i = 0; i < 9; i++) {
        const y = Math.random() * H;
        g.fillStyle([0xff5fa2, 0x00c7fd, 0x3dff7a, 0xffffff][i % 4], 0.35 * k).fillRect((Math.random() - 0.5) * W * 0.2, y, W, s(4 + Math.random() * 18));
      }
      this.cameras.main.shake(60, 0.004);
    }
  }
}
