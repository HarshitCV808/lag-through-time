import Base from './Base.js';
import { THEMES } from '../theme.js';
import { Button, drawCard } from '../ui.js';
import { music, sfx } from '../audio.js';
import { LAPTOPS, PERSONAS, PRICE_NOTE, topPersona } from '../data.js';

const IDLE_RESET_MS = 120000; // in-store kiosk: return to the title for the next shopper

export default class Result extends Base {
  constructor() { super('Result'); }

  build() {
    this.th = THEMES.ai;
    music('ai');
    sfx('win');
    this.persona = topPersona(this.registry.get('picks') || []);
    this.laptop = LAPTOPS[this.persona];
    this.idle = this.time.delayedCall(IDLE_RESET_MS, () => this.go('Title'));
  }

  demo() {
    this.ask({
      kicker: 'Next step',
      title: 'Show this screen to a store expert',
      body: `Ask for a hands-on demo of the ${this.laptop.model}. Try background blur, live captions and AI photo edits yourself, with Wi-Fi off.`,
      buttons: [{ label: 'Got it', onClick: () => {} }],
    });
  }

  layout() {
    this.root?.destroy();
    const s = (n) => this.s(n);
    const th = this.th;
    const { W, H } = this;
    const p = PERSONAS[this.persona];
    const L = this.laptop;
    const cw = Math.min(W - s(36), s(600));
    const root = (this.root = this.add.container(W / 2, 0));
    const add = (o) => (root.add(o), o);
    const text = (x, y, str, fs, opts = {}) => add(this.add.text(x, y, str, {
      fontFamily: opts.font || th.body, fontStyle: opts.weight || '500', fontSize: s(fs),
      color: opts.color || th.ink, wordWrap: { width: opts.wrap || cw, useAdvancedWrap: true }, lineSpacing: s(3),
    }));
    let y = 0;
    y += text(-cw / 2, y, p.title, 30, { font: 'Unbounded', weight: '800' }).height + s(8);
    y += text(-cw / 2, y, p.line, 17, { color: th.dim }).height + s(20);

    // Laptop card.
    const ip = s(22);
    const cardTop = y;
    const cardG = add(this.add.graphics()); // card behind, bullets on top
    const g = add(this.add.graphics());
    let cy = cardTop + ip;
    const parts = [];
    const ctext = (str, fs, opts) => { const t = text(-cw / 2 + ip, cy, str, fs, { wrap: cw - ip * 2, ...opts }); parts.push(t); cy += t.height; return t; };
    ctext('Your Intel AI PC match', 14, { weight: '700', color: th.accent }); cy += s(6);
    ctext(L.model, 22, { font: 'Unbounded', weight: '800' }); cy += s(6);
    ctext(L.chip, 16, { weight: '700' }); cy += s(2);
    ctext(L.specs, 15, { color: th.dim }); cy += s(12);
    ctext(L.price, 30, { font: 'Unbounded', weight: '800', color: th.accent }); cy += s(4);
    ctext(PRICE_NOTE, 12, { color: th.dim }); cy += s(14);
    L.why.forEach((w) => {
      g.fillStyle(0x2ef2c8).fillRect(-cw / 2 + ip, cy + s(8), s(8), s(8));
      const t = text(-cw / 2 + ip + s(20), cy, w, 15, { wrap: cw - ip * 2 - s(20) });
      cy += t.height + s(8);
    });
    cy += ip - s(8);
    drawCard(cardG, th, -cw / 2, cardTop, cw, cy - cardTop, s);
    y = cy + s(20);

    const gap = s(12);
    const twoUp = cw > s(440);
    const bw = twoUp ? (cw - gap) / 2 : cw;
    const demo = new Button(this, th, 'Get a hands-on demo', () => this.demo());
    const again = new Button(this, th, 'Play again', () => this.go('Title'), { ghost: true });
    demo.place(-cw / 2 + bw / 2, y + s(28), bw, s(56), s(17));
    if (twoUp) again.place(-cw / 2 + bw + gap + bw / 2, y + s(28), bw, s(56), s(17));
    else again.place(0, y + s(56) + gap + s(28), bw, s(56), s(17));
    add(demo);
    add(again);
    y += twoUp ? s(56) : s(56) * 2 + gap;
    this.overlayKeys = { Enter: () => this.demo() };

    const sc = Math.min(1, (H - s(36)) / y);
    root.setScale(sc);
    root.y = (H - y * sc) / 2;
  }
}
