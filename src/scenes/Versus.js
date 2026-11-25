import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { Button } from '../ui.js';
import { music } from '../audio.js';
import { BUDGETS } from '../data.js';

const ROWS = [
  { key: 'L1', year: '1981', name: 'First PC', pain: 'Text only. One task at a time.', th: THEMES.dos },
  { key: 'L2', year: '2003', name: 'Wi-Fi laptop', pain: 'Dial-up downloads. 2 to 4 hour battery.', th: THEMES.y2k },
  { key: 'L3', year: '2015', name: 'Cloud AI laptop', pain: 'Needs internet. Your files leave the laptop.', th: THEMES.cloud },
  { key: 'L4', year: '2026', name: 'Intel Core Ultra AI PC', pain: 'AI runs on the laptop itself. Works offline. Private.', th: THEMES.ai },
];

const STATS = [
  { n: '50', l: 'TOPS on the NPU, up to' },
  { n: '120', l: 'TOPS on Arc graphics, up to' },
  { n: '180', l: 'TOPS total, up to' },
];

const TOPS_HELP = 'TOPS = trillions of AI calculations per second. NPU = a mini AI brain that sips battery.';

const TRAP = {
  title: 'Tempted by a cheaper, shinier laptop?',
  body: 'Without an NPU, AI goes back to the cloud: it needs internet, sends your files away and drains the battery. That is 2015 again.',
};

// Competitor lines: facts only, kept checkable.
const WHY = [
  'Snapdragon (ARM) laptops run many Windows apps and games through emulation, and some still don’t work. Intel runs them natively.',
  'MacBooks run macOS, so Windows-only college software and many games won’t install. Intel AI PCs run Windows.',
  'Intel Arc graphics with XeSS AI upscaling for smoother games, plus 500+ AI models tuned through OpenVINO.',
];

export default class Versus extends Base {
  constructor() { super('Versus'); }

  build() {
    this.th = THEMES.ai;
    music('ai');
    this.page = 0;
    this.animPage = -1;
    const next = () => (this.page === 0 ? this.turnPage() : this.askBudget());
    this.overlayKeys = { Enter: next, ' ': next };
  }

  layout() {
    this.root?.destroy();
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
        if (t) text(cw / 2, y, last ? `${t}s, 7 tasks` : `${t}s`, 15, { weight: '700', color: th.dim, ox: 1 });
        text(-cw / 2 + s(22), y + s(26), r.pain, 14, { color: th.dim, wrap: cw - s(22) });
        y += rh + (last ? s(10) : 0);
      });
      y += s(12);
      const sw = cw / 3;
      STATS.forEach((st, i) => {
        const x = -cw / 2 + i * sw;
        text(x, y, st.n, 34, { font: 'Unbounded', weight: '800', color: th.accent });
        text(x, y + s(46), st.l, 13, { color: th.dim, wrap: sw - s(10) });
      });
      y += s(98);
      y += text(-cw / 2, y, TOPS_HELP, 14, { color: th.dim }).height + s(20);
      button('Why not a cheaper laptop?', () => this.turnPage());
      y += text(-cw / 2, y, 'Top figures are for Core Ultra X9 with Arc B390 graphics. Other models are lower, and real-world results vary.', 12, { color: th.dim }).setAlpha(0.8).height;
    } else {
      // The cheap-laptop trap from the brief, called out in warm red.
      const trapT = text(-cw / 2 + s(18), y + s(16), TRAP.title, 22, { font: 'Unbounded', weight: '800', color: '#ffb3c7', wrap: cw - s(36) });
      const trapB = text(-cw / 2 + s(18), y + s(26) + trapT.height, TRAP.body, 16, { color: th.ink, wrap: cw - s(36) });
      const trapH = s(44) + trapT.height + trapB.height;
      g.fillStyle(0xff5fa2, 0.1).fillRoundedRect(-cw / 2, y, cw, trapH, s(16));
      g.lineStyle(s(1.5), 0xff5fa2, 0.6).strokeRoundedRect(-cw / 2, y, cw, trapH, s(16));
      y += trapH + s(26);
      y += text(-cw / 2, y, 'Intel vs the other laptops on the shelf', 18, { weight: '700' }).height + s(12);
      WHY.forEach((w) => {
        g.fillStyle(0x2ef2c8).fillRect(-cw / 2, y + s(8), s(8), s(8));
        y += text(-cw / 2 + s(20), y, w, 15, { color: th.dim, wrap: cw - s(20) }).height + s(12);
      });
      y += s(10);
      button('Get my laptop match', () => this.askBudget());
    }

    const sc = Math.min(1, (H - s(36)) / y);
    root.setScale(sc);
    root.y = (H - y * sc) / 2;
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
