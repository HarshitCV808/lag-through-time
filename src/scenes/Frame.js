import Phaser from 'phaser';
import { layoutFrame, drawFrame } from '../frame.js';

// Background scene, always running underneath the others: draws the era room and the
// computer whose screen the current level is played on. Levels call setEra().
export default class Frame extends Phaser.Scene {
  constructor() { super({ key: 'Frame', active: true }); }

  create() {
    this.era = null;
    this.g = this.add.graphics();
    this.labels = [];
    this.scale.on('resize', () => this.draw());
  }

  setEra(era) {
    this.scene.get('Glass')?.setEra(era);
    if (era === this.era) return;
    this.era = era;
    this.draw();
  }

  draw() {
    if (!this.g) return;
    this.g.clear();
    this.labels.forEach((t) => t.destroy());
    this.labels = [];
    if (!this.era) return;
    const W = this.scale.width;
    const H = this.scale.height;
    const addText = (x, y, str, style) => {
      const t = this.add.text(x, y, str, style);
      this.labels.push(t);
      return t;
    };
    drawFrame(this.g, addText, W, H, layoutFrame(W, H, this.era));
  }
}
