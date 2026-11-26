import Phaser from 'phaser';
import { DPR } from '../theme.js';
import { layoutFrame } from '../frame.js';

// Top layer over the level's screen: CRT scanlines and curved-glass shading in 1981, a
// faint glass reflection on the laptops. Purely visual; it never takes input.
export default class Glass extends Phaser.Scene {
  constructor() { super({ key: 'Glass', active: true }); }

  create() {
    this.era = null;
    this.input.enabled = false;
    this.g = this.add.graphics();
    this.scale.on('resize', () => this.draw());
  }

  setEra(era) {
    if (era === this.era) return;
    this.era = era;
    this.draw();
  }

  draw() {
    if (!this.g) return;
    const g = this.g.clear();
    if (!this.era) return;
    const L = layoutFrame(this.scale.width, this.scale.height, this.era);
    const { x, y, w, h } = L;
    if (this.era === 'dos') {
      // Scanlines.
      g.fillStyle(0x000000, 0.16);
      for (let yy = y; yy < y + h; yy += 3 * DPR) g.fillRect(x, yy, w, DPR);
      // Curved-glass vignette: darker towards the edges and corners.
      for (let i = 0; i < 6; i++) {
        const inset = (i * Math.min(w, h)) / 60;
        g.lineStyle(Math.min(w, h) / 40, 0x000000, 0.1).strokeRoundedRect(x + inset, y + inset, w - inset * 2, h - inset * 2, Math.min(w, h) / 12);
      }
      // Soft highlight where the room light catches the curved glass.
      g.fillStyle(0xffffff, 0.018).fillEllipse(x + w * 0.28, y + h * 0.14, w * 0.42, h * 0.12);
    } else {
      // Flat-panel glass: one faint diagonal reflection band.
      g.fillStyle(0xffffff, this.era === 'y2k' ? 0.045 : 0.03).fillPoints([
        { x, y }, { x: x + w * 0.32, y }, { x: x + w * 0.1, y: y + h }, { x, y: y + h },
      ], true);
    }
  }
}
