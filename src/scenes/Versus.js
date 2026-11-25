import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { Button } from '../ui.js';
import { music, sfx } from '../audio.js';
import { BUDGETS } from '../data.js';

const ROWS = [
  { key: 'L1', year: '1981', name: 'First PC', pain: 'Text only. One task at a time.', th: THEMES.dos },
  { key: 'L2', year: '2003', name: 'Wi-Fi laptop', pain: 'Dial-up downloads. 2 to 4 hour battery.', th: THEMES.y2k },
  { key: 'L3', year: '2015', name: 'Cloud AI laptop', pain: 'Needs internet. Your files leave the laptop.', th: THEMES.cloud },
  { key: 'L4', year: '2026', name: 'Intel Core Ultra AI PC', pain: 'AI runs on the laptop itself. Works offline. Private.', th: THEMES.ai },
];

// "up to" sits right on top of each big number so nobody reads the headline without it.
const STATS = [
  { n: '50', l: 'TOPS on the NPU' },
  { n: '120', l: 'TOPS on Arc graphics' },
  { n: '180', l: 'TOPS in total' },
];

const TOPS_HELP = 'TOPS = trillions of AI calculations per second. NPU = a mini AI brain that sips battery.';

const TRAP = {
  title: 'Tempted by a cheaper, shinier laptop?',
  body: 'Without an NPU, AI goes back to the cloud: it needs internet, sends your files away and drains the battery. That is 2015 again.',
};

// Tap-to-flip competitor cards. Facts only, each one checkable.
const CARDS = [
  {
    them: 'Snapdragon (ARM) laptop', themLine: 'Many Windows apps and games run through emulation, and some still don’t work.',
    us: 'Intel AI PC', usLine: 'Windows apps, games and anti-cheat run natively on x86.',
  },
  {
    them: 'MacBook', themLine: 'macOS: Windows-only college software and many games won’t install.',
    us: 'Intel AI PC', usLine: 'Windows, so your course software and games just install.',
  },
  {
    them: 'AMD Ryzen AI laptop', themLine: 'Radeon 890M graphics on Ryzen AI 300 and 400 chips.',
    // Source: Notebookcheck's Panther Lake gaming benchmarks (Arc B390 vs Radeon 890M).
    us: 'Intel Core Ultra X7 / X9', usLine: 'Arc B390 graphics beat the Radeon 890M by up to 80% in some games (Notebookcheck tests).',
  },
];

export default class Versus extends Base {
  constructor() { super('Versus'); }

  build() {
    this.th = THEMES.ai;
    music('ai');
    this.page = 0;
    this.animPage = -1;
    this.flipped = new Set();
    const next = () => (this.page === 0 ? this.turnPage() : this.askBudget());
    this.overlayKeys = { Enter: next, ' ': next };
    CARDS.forEach((_, i) => (this.overlayKeys[String(i + 1)] = () => this.page === 1 && this.flip(i)));
  }

  layout() {
    this.root?.destroy();
    this.cards = [];
    const s = (n) => this.s(n);
    const th = this.th;
    const { W, H } = this;
    const times = this.registry.get('times') || {};
    const cw = Math.min(W - s(36), s(680));
    const root = (this.root = this.add.container(W / 2, 0));
    const add = (o) => (root.add(o), o);
    const text = (x, y, str, fs, opts = {}) => add(this.add.text(x, y, str, {
      fontFamily: opts.font || th.body, fontStyle: opts.weight || '500', fontSize: s(fs),
      color: opts.color || th.ink, wordWrap: { width: opts.wrap || cw, useAdvancedWrap: true }, lineSpacing: s(3),
    }).setOrigin(opts.ox || 0, 0));
    let y = 0;

    const g = add(this.add.graphics());
    const button = (label, onClick) => {
      const bw = Math.min(cw, s(320));
      const btn = new Button(this, th, label, onClick);
      btn.place(-cw / 2 + bw / 2, y + s(28), bw, s(56), s(17));
      add(btn);
      y += s(56) + s(14);
    };

    if (this.page === 0) {
      y += text(-cw / 2, y, 'Same you, four laptops', 28, { font: 'Unbounded', weight: '800' }).height + s(18);
      ROWS.forEach((r, i) => {
        const last = i === ROWS.length - 1;
        const rh = s(64);
        if (last) {
          g.fillStyle(0x00c7fd, 0.12).fillRoundedRect(-cw / 2 - s(10), y - s(8), cw + s(20), rh + s(4), s(14));
          g.lineStyle(s(1.5), 0x00c7fd, 0.8).strokeRoundedRect(-cw / 2 - s(10), y - s(8), cw + s(20), rh + s(4), s(14));
        }
        g.fillStyle(hex(r.th.name === 'y2k' ? '#c9c6bd' : r.th.name === 'cloud' ? '#2f6fed' : r.th.accent)).fillCircle(-cw / 2 + s(6), y + s(12), s(6));
        text(-cw / 2 + s(22), y, `${r.year}  ${r.name}`, 17, { weight: '700', color: last ? th.accent : th.ink, wrap: cw - s(110) });
        const t = times[r.key];
        if (t) text(cw / 2, y, last ? `${t}s, full AI day` : `${t}s`, 15, { weight: '700', color: th.dim, ox: 1 });
        text(-cw / 2 + s(22), y + s(26), r.pain, 14, { color: th.dim, wrap: cw - s(22) });
        y += rh + (last ? s(10) : 0);
      });
      y += s(12);
      const sw = cw / 3;
      STATS.forEach((st, i) => {
        const x = -cw / 2 + i * sw;
        text(x, y, 'up to', 14, { weight: '700', color: th.accent });
        text(x, y + s(18), st.n, 34, { font: 'Unbounded', weight: '800', color: th.accent });
        text(x, y + s(64), st.l, 13, { color: th.dim, wrap: sw - s(10) });
      });
      y += s(116);
      y += text(-cw / 2, y, TOPS_HELP, 14, { color: th.dim }).height + s(20);
      button('Why not a cheaper laptop?', () => this.turnPage());
      y += text(-cw / 2, y, 'Top figures are for Core Ultra X9 with Arc B390 graphics. Other models are lower, and real-world results vary.', 13, { color: th.dim }).height;
    } else {
      // The cheap-laptop trap from the brief, called out in warm red.
      const trapT = text(-cw / 2 + s(18), y + s(16), TRAP.title, 20, { font: 'Unbounded', weight: '800', color: '#ffb3c7', wrap: cw - s(36) });
      const trapB = text(-cw / 2 + s(18), y + s(24) + trapT.height, TRAP.body, 15, { color: th.ink, wrap: cw - s(36) });
      const trapH = s(40) + trapT.height + trapB.height;
      g.fillStyle(0xff5fa2, 0.1).fillRoundedRect(-cw / 2, y, cw, trapH, s(16));
      g.lineStyle(s(1.5), 0xff5fa2, 0.6).strokeRoundedRect(-cw / 2, y, cw, trapH, s(16));
      y += trapH + s(22);
      y += text(-cw / 2, y, 'Intel vs the other laptops on the shelf', 18, { weight: '700' }).height + s(4);
      y += text(-cw / 2, y, 'Tap a card to flip it', 14, { color: th.accent, weight: '700' }).height + s(12);
      CARDS.forEach((c, i) => { y += this.card(root, c, i, -cw / 2, y, cw) + s(10); });
      y += text(-cw / 2, y, 'Plus 500+ AI models tuned for Core Ultra through Intel OpenVINO.', 13, { color: th.dim }).height + s(14);
      button('Get my laptop match', () => this.askBudget());
    }

    const sc = Math.min(1, (H - s(36)) / y);
    if (this.refit(sc)) return;
    root.y = Math.max(s(12), (H - y) / 2);
    // Staggered entrance, once per page (not on resize).
    if (this.animPage !== this.page && !this.reduced) {
      this.animPage = this.page;
      root.list.forEach((o, i) => {
        const y0 = o.y;
        o.setAlpha(0).setY(y0 + s(18));
        this.tweens.add({ targets: o, alpha: 1, y: y0, delay: 40 + i * 28, duration: 320, ease: 'Quad.Out' });
      });
    }
  }

  // A competitor card: "them" on the front, the Intel answer on the back. Sized to the
  // taller side so flipping never changes the layout. Returns its height.
  card(root, c, i, x, y, w) {
    const s = (n) => this.s(n);
    const th = this.th;
    const pad = s(14);
    const box = this.add.container(x + w / 2, y);
    const g = this.add.graphics();
    const mk = (str, size, weight, color) => this.add.text(-w / 2 + pad, 0, str, {
      fontFamily: th.body, fontStyle: weight, fontSize: s(size), color, wordWrap: { width: w - pad * 2 - s(28), useAdvancedWrap: true }, lineSpacing: s(2),
    });
    const front = [mk(c.them, 15, '700', '#c9d2ee'), mk(c.themLine, 14, '500', th.dim)];
    const back = [mk(c.us, 15, '700', '#2ef2c8'), mk(c.usLine, 14, '500', th.ink)];
    const hOf = (pair) => pad * 2 + pair[0].height + s(4) + pair[1].height;
    const h = Math.max(hOf(front), hOf(back));
    // Children are laid out around the centre: container tap areas are centred on the origin.
    [front, back].forEach((pair) => { pair[0].y = pad - h / 2; pair[1].y = pad - h / 2 + pair[0].height + s(4); });
    box.y = y + h / 2;
    const arrow = this.add.text(w / 2 - pad, 0, '⟳', { fontFamily: th.body, fontStyle: '700', fontSize: s(20), color: th.accent }).setOrigin(1, 0.5);
    box.add([g, ...front, ...back, arrow]);
    const paint = () => {
      const on = this.flipped.has(i);
      g.clear();
      g.fillStyle(on ? 0x00c7fd : 0x8a94b8, on ? 0.14 : 0.08).fillRoundedRect(-w / 2, -h / 2, w, h, s(14));
      g.lineStyle(s(1.5), on ? 0x00c7fd : 0x8a94b8, on ? 0.9 : 0.5).strokeRoundedRect(-w / 2, -h / 2, w, h, s(14));
      front.forEach((t) => t.setVisible(!on));
      back.forEach((t) => t.setVisible(on));
    };
    paint();
    box.setSize(w, h).setInteractive({ useHandCursor: true });
    box.input.hitArea.setTo(0, 0, w, h);
    box.on('pointerup', () => this.flip(i));
    box.paint = paint;
    this.cards[i] = box;
    root.add(box);
    return h;
  }

  flip(i) {
    const box = this.cards?.[i];
    if (!box) return;
    sfx('pop');
    const toggle = () => { this.flipped.has(i) ? this.flipped.delete(i) : this.flipped.add(i); box.paint(); };
    if (this.reduced) return toggle();
    this.tweens.add({ targets: box, scaleX: 0, duration: 110, ease: 'Quad.In', onComplete: () => {
      toggle();
      this.tweens.add({ targets: box, scaleX: 1, duration: 140, ease: 'Quad.Out' });
    } });
  }

  turnPage() {
    this.page = 1;
    this.relayout();
  }

  askBudget() {
    this.ask({
      kicker: 'Last question',
      title: 'What’s your budget?',
      body: 'We’ll match the best Intel AI PC inside it.',
      buttons: BUDGETS.map((b) => ({ label: b.label, onClick: () => { this.registry.set('budget', b.id); this.go('Result'); } })),
    });
  }
}
