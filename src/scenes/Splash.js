import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { readShare } from '../data.js';

// First screen. Browsers only allow sound after the visitor's first tap, so the game opens
// on "Tap anywhere to start": that tap starts the music and the title animation together.
const ERA_COLS = ['#3dff7a', '#2a7f86', '#e9edf2', '#00c7fd'];

export default class Splash extends Base {
  constructor() { super({ key: 'Splash', active: true }); }

  build() {
    this.th = THEMES.ai;
    // Saved-match links (QR) skip the splash and open straight on the result.
    const q = new URLSearchParams(location.search);
    if (readShare(location.search) || q.get('match')) {
      this.time.delayedCall(0, () => this.scene.start('Title'));
      return;
    }
    this.clock = 0;
    this.g = this.add.graphics();
    this.titleT = this.add.text(0, 0, 'Lag Through Time', { fontFamily: 'Unbounded', fontStyle: '800', color: this.th.ink }).setOrigin(0.5);
    this.tapT = this.add.text(0, 0, 'Tap anywhere to start', { fontFamily: 'Manrope', fontStyle: '800', color: this.th.accent }).setOrigin(0.5);
    this.soundT = this.add.text(0, 0, 'Best with sound on', { fontFamily: 'Manrope', fontStyle: '500', color: this.th.dim }).setOrigin(0.5);
    if (!this.reduced) this.tweens.add({ targets: this.tapT, alpha: 0.35, duration: 750, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const start = () => this.go('Title');
    this.input.once('pointerup', start);
    this.overlayKeys = { Enter: start, ' ': start };
  }

  layout() {
    if (!this.titleT) return;
    const s = (n) => this.s(n);
    const cx = this.W / 2;
    const cy = this.H / 2;
    this.lw = Math.min(this.W * 0.6, s(260));
    this.lc = { x: cx, y: cy - s(70) };
    this.titleT.setPosition(cx, cy + s(60)).setFontSize(s(30));
    this.tapT.setPosition(cx, cy + s(112)).setFontSize(s(20));
    this.soundT.setPosition(cx, cy + s(148)).setFontSize(s(14));
  }

  // A small laptop whose screen cycles through the four eras' colours.
  update(_, dt) {
    if (!this.g) return;
    this.clock += dt / 1000;
    const s = (n) => this.s(n);
    const g = this.g.clear();
    const { x, y } = this.lc;
    const w = this.lw;
    const h = w * 0.62;
    const era = Math.floor(this.clock / 0.7) % ERA_COLS.length;
    g.fillStyle(0x00c7fd, 0.12 + Math.sin(this.clock * 3) * 0.06).fillCircle(x, y, w * 0.75); // glow behind
    g.fillStyle(0x1c2333).fillRoundedRect(x - w / 2, y - h / 2, w, h, s(10));
    g.fillStyle(hex(ERA_COLS[era])).fillRect(x - w / 2 + s(8), y - h / 2 + s(8), w - s(16), h - s(16));
    g.fillStyle(0x2a3247).fillPoints([
      { x: x - w / 2, y: y + h / 2 }, { x: x + w / 2, y: y + h / 2 },
      { x: x + w * 0.58, y: y + h / 2 + s(16) }, { x: x - w * 0.58, y: y + h / 2 + s(16) },
    ], true);
  }
}
