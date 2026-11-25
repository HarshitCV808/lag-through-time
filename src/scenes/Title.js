import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { Button } from '../ui.js';
import { music } from '../audio.js';
import { LAPTOPS } from '../data.js';

const ERAS = [
  { th: THEMES.dos, year: '1981' },
  { th: THEMES.y2k, year: '2003' },
  { th: THEMES.cloud, year: '2015' },
  { th: THEMES.ai, year: '2026' },
];

export default class Title extends Base {
  constructor() { super('Title'); }

  build() {
    // QR / share link (?match=gamer): open straight on that match, once per page load.
    const match = new URLSearchParams(location.search).get('match');
    if (LAPTOPS[match] && !this.registry.get('linkUsed')) {
      this.registry.set('linkUsed', true);
      this.scene.start('Result', { match });
    }
    this.registry.set('picks', []);
    this.registry.set('times', {});
    music('ai');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // The one orchestrated moment: the title travels through all four eras, then settles.
    this.morph = reduce ? 3 : 0;
    this.th = ERAS[this.morph].th;
    if (!reduce) {
      this.time.addEvent({
        delay: 420, repeat: 2,
        callback: () => { this.morph++; this.th = ERAS[this.morph].th; this.relayout(); },
      });
    }
  }

  layout() {
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
      const sub = this.add.text(-cw / 2, y, 'Play through 45 years of laptops in about 3 minutes, and find the one that never makes you wait.', {
        fontFamily: th.body, fontStyle: '500', fontSize: s(18), color: th.dim,
        wordWrap: { width: cw, useAdvancedWrap: true }, lineSpacing: s(6),
      });
      root.add(sub);
      y += sub.height + s(28);
      const bw = Math.min(cw, s(320));
      const btn = new Button(this, th, 'Start the time trip', () => this.go('L1'));
      btn.place(-cw / 2 + bw / 2, y + s(30), bw, s(60), s(18));
      root.add(btn);
      this.overlayKeys = { Enter: () => this.go('L1'), ' ': () => this.go('L1') };
      y += s(60);
    }
    const sc = Math.min(1, (H - s(40)) / y);
    root.setScale(sc);
    root.y = (H - y * sc) / 2;
  }
}
