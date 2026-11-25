import Phaser from 'phaser';
import { DPR, hex } from '../theme.js';

const DURATION = 1300;

// Hyperspace jump between eras: streaks fly out from the centre while the year counts up,
// then the type snaps into the next era's font.
export default class Warp extends Phaser.Scene {
  constructor() { super('Warp'); }

  create({ next, from, to }) {
    this.next = next;
    this.from = from;
    this.to = to;
    this.t = 0;
    this.done = false; // scene instances are reused between warps
    this.snapped = false;
    this.y0 = Number(from.year);
    this.y1 = Number(to.year);
    const W = this.scale.width;
    const H = this.scale.height;
    const k = DPR * Phaser.Math.Clamp(Math.min(W, H) / DPR / 420, 0.78, 1.45);
    this.k = k;
    this.g = this.add.graphics();
    this.stars = Array.from({ length: 90 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random() * 0.2, v: 0.6 + Math.random() * 1.4 }));
    this.year = this.add.text(W / 2, H / 2, from.year, {
      fontFamily: from.font, fontStyle: '700', fontSize: 96 * k, color: from.name === 'y2k' ? '#ffffff' : from.ink,
    }).setOrigin(0.5);
    this.label = this.add.text(W / 2, H / 2 + 70 * k, 'Time-travelling…', {
      fontFamily: 'Manrope', fontStyle: '700', fontSize: 16 * k, color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.8);
  }

  update(_, dt) {
    this.t += dt;
    const p = Math.min(1, this.t / DURATION);
    const W = this.scale.width;
    const H = this.scale.height;
    const R = Math.hypot(W, H) / 2;
    const bg = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(hex(this.from.bg)), Phaser.Display.Color.ValueToColor(hex(this.to.bg)), 100, Math.floor(p * 100));
    const g = this.g.clear();
    g.fillStyle(Phaser.Display.Color.GetColor(bg.r, bg.g, bg.b)).fillRect(0, 0, W, H);
    const accent = hex(p < 0.5 ? this.from.accent : this.to.accent);
    const speed = 0.4 + p * 2.6;
    for (const s of this.stars) {
      s.r += s.v * speed * (dt / 1000);
      if (s.r > 1) s.r = Math.random() * 0.1;
      const r1 = s.r * R;
      const r2 = r1 + (20 + p * 160) * this.k * s.r;
      g.lineStyle(2 * this.k, accent, 0.25 + s.r * 0.75);
      g.lineBetween(W / 2 + Math.cos(s.a) * r1, H / 2 + Math.sin(s.a) * r1, W / 2 + Math.cos(s.a) * r2, H / 2 + Math.sin(s.a) * r2);
    }
    const eased = Phaser.Math.Easing.Cubic.InOut(p);
    this.year.setText(String(Math.round(this.y0 + (this.y1 - this.y0) * eased)));
    this.year.setScale(1 + Math.sin(p * Math.PI) * 0.25);
    if (p >= 0.85 && !this.snapped) {
      this.snapped = true;
      this.year.setFontFamily(this.to.font).setFontSize(96 * this.k).setColor(this.to.name === 'y2k' ? '#ffffff' : this.to.ink);
      this.label.setText(`Welcome to ${this.to.year}`);
    }
    if (p >= 1 && !this.done) {
      this.done = true;
      this.scene.start(this.next);
    }
  }
}
