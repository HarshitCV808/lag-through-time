import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { Button } from '../ui.js';
import { music } from '../audio.js';
import { LAPTOPS, readShare } from '../data.js';

const ERAS = [
  { th: THEMES.dos, year: '1981' },
  { th: THEMES.y2k, year: '2003' },
  { th: THEMES.cloud, year: '2015' },
  { th: THEMES.ai, year: '2026' },
];

// Readable on the navy title screen, one per era (1981, 2003, 2015).
const FLASH_INK = ['#3dff7a', '#ffffff', '#8fb8ff'];

export default class Title extends Base {
  constructor() { super('Title'); }

  build() {
    // QR / share link (?s=scores&b=budget, or older ?match=laptop): open straight on that result, once per page load.
    const share = readShare(location.search);
    const match = new URLSearchParams(location.search).get('match');
    if ((share || LAPTOPS[match]) && !this.registry.get('linkUsed')) {
      this.registry.set('linkUsed', true);
      this.scene.start('Result', share ? { share } : { match });
    }
    this.registry.set('answers', []);
    this.registry.set('budget', 'any');
    this.registry.set('privacy', null);
    this.registry.set('times', {});
    music('ai');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The one orchestrated moment: the title travels through all four eras, then settles.
    this.morph = reduce ? 3 : 0;
    this.th = ERAS[this.morph].th;
    this.flash = null;
    if (!reduce) {
      this.time.addEvent({
        delay: 420, repeat: 2,
        callback: () => { this.morph++; this.th = ERAS[this.morph].th; this.relayout(); },
      });
      // Attract loop for the store floor: every few seconds the title flickers back
      // through the eras so it catches the eye of people walking past.
      this.time.addEvent({ delay: 5200, loop: true, startAt: 0, callback: () => this.attract() });
    }
  }

  // Restyle only the title text (no relayout), so a tap on Start is never lost mid-flicker.
  attract() {
    if (this.morph !== 3 || this.leaving) return;
    [0, 1, 2, null].forEach((era, i) => this.time.delayedCall(i * 240, () => { this.flash = era; this.applyFlash(); }));
  }

  applyFlash() {
    const t = this.titleText;
    if (!t?.active) return;
    if (this.flash === null) t.setFontFamily(this.th.font).setColor(this.th.ink);
    else t.setFontFamily(ERAS[this.flash].th.font).setColor(FLASH_INK[this.flash]);
  }

  layout() {
    if (this.startBtn) this.tweens.killTweensOf(this.startBtn);
    this.startBtn = null;
    this.root?.destroy();
    const { W, H } = this;
    const s = (n) => this.s(n);
    const th = this.th;
    const settled = this.morph === 3;
    const root = (this.root = this.add.container(W / 2, 0));
    const cw = Math.min(W - s(40), s(640));
    let y = 0;

    const title = this.add.text(-cw / 2, y, 'Lag Through Time', {
      fontFamily: th.font, fontStyle: th.name === 'ai' ? '800' : '700',
      fontSize: s(th.name === 'dos' ? 64 : 46), color: th.name === 'y2k' ? '#ffffff' : th.ink,
      wordWrap: { width: cw, useAdvancedWrap: true }, lineSpacing: -s(4),
    });
    root.add(title);
    y += title.height + s(22);
    this.titleText = title;
    if (settled) this.applyFlash();

    // Era timeline: these really are a sequence, so they get a connecting line.
    const g = this.add.graphics();
    root.add(g);
    const step = cw / 3;
    g.lineStyle(s(2), hex(settled ? '#3a4a80' : th.dim), 1).lineBetween(-cw / 2, y + s(8), cw / 2, y + s(8));
    ERAS.forEach((e, i) => {
      const x = -cw / 2 + i * step;
      const on = i <= this.morph;
      g.fillStyle(hex(on ? e.th.accent : '#3a4a80')).fillCircle(x, y + s(8), s(i === 3 ? 9 : 6));
      const t = this.add.text(x, y + s(24), e.year, {
        fontFamily: th.body, fontStyle: '700', fontSize: s(15), color: on ? (th.name === 'y2k' ? '#ffffff' : th.ink) : th.dim,
      }).setOrigin(i === 0 ? 0 : i === 3 ? 1 : 0.5, 0);
      if (i === 0) t.x -= s(6);
      if (i === 3) t.x += s(6);
      root.add(t);
    });
    y += s(64);

    if (settled) {
      const sub = this.add.text(-cw / 2, y, 'Play through 45 years of laptops in about 3 minutes, and find the Intel AI PC that never makes you wait.', {
        fontFamily: th.body, fontStyle: '500', fontSize: s(18), color: th.dim,
        wordWrap: { width: cw, useAdvancedWrap: true }, lineSpacing: s(6),
      });
      root.add(sub);
      y += sub.height + s(28);
      const bw = Math.min(cw, s(320));
      const btn = new Button(this, th, 'Start the time trip', () => this.warp('L1', THEMES.dos));
      btn.place(-cw / 2 + bw / 2, y + s(30), bw, s(60), s(18));
      root.add(btn);
      this.startBtn = btn;
      if (!this.reduced) this.tweens.add({ targets: btn, scale: 1.05, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
      this.overlayKeys = { Enter: () => this.warp('L1', THEMES.dos), ' ': () => this.warp('L1', THEMES.dos) };
      y += s(60);
    }
    const sc = Math.min(1, (H - s(40)) / y);
    if (this.refit(sc)) return;
    root.y = Math.max(s(12), (H - y) / 2);
  }
}
