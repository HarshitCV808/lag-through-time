import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { Button } from '../ui.js';
import { music } from '../audio.js';

const ROWS = [
  { key: 'L1', year: '1981', name: 'First PC', pain: 'Text only. One task at a time.', th: THEMES.dos },
  { key: 'L2', year: '2003', name: 'Wi-Fi laptop', pain: 'Dial-up downloads. 2 to 4 hour battery.', th: THEMES.y2k },
  { key: 'L3', year: '2015', name: 'Cloud AI laptop', pain: 'Needs internet. Your files leave the laptop.', th: THEMES.cloud },
  { key: 'L4', year: '2026', name: 'Intel Core Ultra AI PC', pain: 'AI on-device. Works offline. Private.', th: THEMES.ai },
];

const STATS = [
  { n: '50', l: 'TOPS on the NPU' },
  { n: '120', l: 'TOPS on Arc graphics' },
  { n: '180', l: 'TOPS total, up to' },
];

const WHY = [
  'Every Windows app and game runs natively on x86, no emulation layer.',
  'Intel Arc graphics with XeSS AI upscaling for smoother games.',
  '500+ AI models tuned for Core Ultra through Intel OpenVINO.',
];

export default class Versus extends Base {
  constructor() { super('Versus'); }

  build() {
    this.th = THEMES.ai;
    music('ai');
    this.overlayKeys = { Enter: () => this.go('Result'), ' ': () => this.go('Result') };
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

    y += text(-cw / 2, y, 'Same you, four laptops', 28, { font: 'Unbounded', weight: '800' }).height + s(18);

    const g = add(this.add.graphics());
    ROWS.forEach((r, i) => {
      const last = i === ROWS.length - 1;
      const rh = s(64);
      if (last) {
        g.fillStyle(0x00c7fd, 0.12).fillRoundedRect(-cw / 2 - s(10), y - s(8), cw + s(20), rh + s(4), s(14));
        g.lineStyle(s(1.5), 0x00c7fd, 0.8).strokeRoundedRect(-cw / 2 - s(10), y - s(8), cw + s(20), rh + s(4), s(14));
      }
      g.fillStyle(hex(r.th.name === 'y2k' ? '#c9c6bd' : r.th.name === 'cloud' ? '#2f6fed' : r.th.accent)).fillCircle(-cw / 2 + s(6), y + s(12), s(6));
      text(-cw / 2 + s(22), y, `${r.year}  ${r.name}`, 17, { weight: '700', color: last ? th.accent : th.ink });
      const t = times[r.key];
      if (t) text(cw / 2, y, last ? `${t}s, 7 AI tasks` : `${t}s`, 15, { weight: '700', color: th.dim, ox: 1 });
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
    y += s(92);

    y += text(-cw / 2, y, 'Why Intel over other AI laptops', 17, { weight: '700' }).height + s(10);
    WHY.forEach((w) => {
      g.fillStyle(0x2ef2c8).fillRect(-cw / 2, y + s(8), s(8), s(8));
      y += text(-cw / 2 + s(20), y, w, 15, { color: th.dim, wrap: cw - s(20) }).height + s(8);
    });
    y += s(14);

    const bw = Math.min(cw, s(320));
    const btn = new Button(this, th, 'Get my laptop match', () => this.go('Result'));
    btn.place(-cw / 2 + bw / 2, y + s(28), bw, s(56), s(17));
    add(btn);
    y += s(56) + s(14);
    y += text(-cw / 2, y, 'Figures are Intel platform specs for Core Ultra Series 3. Real-world results vary by laptop.', 12, { color: th.dim }).setAlpha(0.8).height;

    const sc = Math.min(1, (H - s(36)) / y);
    root.setScale(sc);
    root.y = (H - y * sc) / 2;
  }
}
