import Phaser from 'phaser';
import { DPR } from '../theme.js';

// Topmost layer: a tap ripple wherever you touch, and a cursor trail behind the mouse,
// both styled to the current era (title and result screens use the 2026 style).
// Purely visual: it reads pointer positions from the window and never takes input.
const RIPPLE_MS = 480;
const TRAIL_MS = 300;

export default class Fx extends Phaser.Scene {
  constructor() { super({ key: 'Fx', active: true }); }

  create() {
    this.input.enabled = false;
    this.g = this.add.graphics();
    this.ripples = [];
    this.trail = [];
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Canvas is pinned to the viewport, so CSS pixels × DPR = canvas pixels.
    const at = (e) => ({ x: e.clientX * DPR, y: e.clientY * DPR });
    const down = (e) => this.ripples.push({ ...at(e), t: 0, seed: Math.random() * 6.28 });
    const move = (e) => {
      if (e.pointerType !== 'mouse' || this.reduce) return;
      this.trail.push({ ...at(e), t: 0 });
      if (this.trail.length > 28) this.trail.shift();
    };
    addEventListener('pointerdown', down, true);
    addEventListener('pointermove', move, true);
    this.events.once('destroy', () => { removeEventListener('pointerdown', down, true); removeEventListener('pointermove', move, true); });
  }

  get era() { return this.scene.get('Frame')?.era || 'ai'; }

  update(_, dt) {
    const g = this.g.clear();
    this.ripples.forEach((r) => (r.t += dt));
    this.trail.forEach((p) => (p.t += dt));
    this.ripples = this.ripples.filter((r) => r.t < RIPPLE_MS);
    this.trail = this.trail.filter((p) => p.t < TRAIL_MS);
    const era = this.era;
    const k = DPR;
    // Cursor trail.
    this.trail.forEach((p, i) => {
      const life = 1 - p.t / TRAIL_MS;
      const n = (i + 1) / this.trail.length;
      if (era === 'dos') {
        const sz = 5 * k * life;
        g.fillStyle(0x3dff7a, 0.8 * life).fillRect(Math.round(p.x / (4 * k)) * 4 * k, Math.round(p.y / (4 * k)) * 4 * k, sz, sz);
      } else if (era === 'y2k') {
        if (i % 4 === 0) this.arrow(g, p.x, p.y, 0.55 * life * n, k);
      } else if (era === 'cloud') {
        g.fillStyle(0x2f6fed, 0.35 * life).fillCircle(p.x, p.y, 4 * k * life + k);
      } else {
        g.fillStyle(0x00c7fd, 0.18 * life).fillCircle(p.x, p.y, 9 * k * n * life);
        g.fillStyle(0xbff4ff, 0.7 * life).fillCircle(p.x, p.y, 2.2 * k * n);
      }
    });
    // Tap ripples.
    this.ripples.forEach((r) => {
      const p = r.t / RIPPLE_MS;
      const life = 1 - p;
      const ease = 1 - (1 - p) ** 3;
      if (era === 'dos') {
        const sz = (8 + 34 * ease) * k;
        g.lineStyle(2 * k, 0x3dff7a, life).strokeRect(r.x - sz / 2, r.y - sz / 2, sz, sz);
        g.fillStyle(0x3dff7a, life).fillRect(r.x - 2 * k, r.y - 2 * k, 4 * k, 4 * k);
      } else if (era === 'y2k') {
        const rad = (6 + 22 * ease) * k;
        g.lineStyle(2.5 * k, 0x1036a8, life).strokeCircle(r.x, r.y, rad);
        g.lineStyle(1.5 * k, 0xffffff, life * 0.8).strokeCircle(r.x, r.y, rad - 3 * k);
      } else if (era === 'cloud') {
        g.fillStyle(0x2f6fed, 0.22 * life).fillCircle(r.x, r.y, (10 + 30 * ease) * k);
        g.lineStyle(1.5 * k, 0x2f6fed, 0.5 * life).strokeCircle(r.x, r.y, (10 + 30 * ease) * k);
      } else {
        const rad = (8 + 30 * ease) * k;
        g.lineStyle(6 * k, 0x00c7fd, 0.18 * life).strokeCircle(r.x, r.y, rad);
        g.lineStyle(2 * k, 0x7fe3ff, life).strokeCircle(r.x, r.y, rad);
        if (!this.reduce) {
          for (let i = 0; i < 6; i++) {
            const a = r.seed + (i * Math.PI) / 3;
            const d = rad + 10 * k * ease;
            g.fillStyle(0xffffff, life).fillCircle(r.x + Math.cos(a) * d, r.y + Math.sin(a) * d, 1.8 * k);
          }
        }
      }
    });
  }

  // A little 2003-style pointer arrow (Windows used to offer "pointer trails").
  arrow(g, x, y, alpha, k) {
    const s = 1.1 * k;
    const pts = [[0, 0], [0, 14], [4, 10], [7, 16], [9, 15], [6, 9], [11, 9]].map(([px, py]) => ({ x: x + px * s, y: y + py * s }));
    g.fillStyle(0xffffff, alpha).fillPoints(pts, true);
    g.lineStyle(k, 0x111111, alpha).strokePoints(pts, true, true);
  }
}
