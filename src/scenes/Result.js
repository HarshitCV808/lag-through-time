import Base from './Base.js';
import { THEMES } from '../theme.js';
import { Button, drawCard } from '../ui.js';
import { music, sfx } from '../audio.js';
import qrcode from 'qrcode-generator';
import { LAPTOPS, PERSONAS, PRICE_NOTE, BUDGETS, recommend, personaOf, rupees, shareQuery } from '../data.js';

const SHORT = { student: 'Student', creator: 'Creator', gamer: 'Gamer', pro: 'Hustler' };


export default class Result extends Base {
  constructor() { super('Result'); }

  build(data) {
    this.th = THEMES.ai;
    music('ai');
    sfx('win');
    this.animated = false;
    // Opened from the QR / share link on a phone: rebuild the same result from the link.
    this.fromLink = !!(data?.share || (data?.match && LAPTOPS[data.match]));
    if (data?.share) {
      this.budget = BUDGETS.find((b) => b.id === data.share.budget && b.id !== 'any') || null;
      const rec = recommend([data.share.scores], data.share.budget);
      Object.assign(this, { laptop: rec.best, runnerUp: rec.runnerUp, persona: rec.persona, scores: rec.scores });
    } else if (this.fromLink) {
      // Older links that only named a laptop.
      this.laptop = { id: data.match, ...LAPTOPS[data.match] };
      this.persona = personaOf(data.match);
      this.runnerUp = null;
      this.scores = null;
      this.budget = null;
    } else {
      this.budget = BUDGETS.find((b) => b.id === this.registry.get('budget') && b.id !== 'any') || null;
      const rec = recommend(this.registry.get('answers') || [], this.budget?.id || 'any');
      Object.assign(this, { laptop: rec.best, runnerUp: rec.runnerUp, persona: rec.persona, scores: rec.scores });
    }
    this.link = this.scores
      ? `${location.origin}${location.pathname}?${shareQuery(this.scores, this.budget?.id)}`
      : `${location.origin}${location.pathname}?match=${this.laptop.id}`;
  }

  // QR code drawn as vector squares on a white tile (quiet zone included).
  drawQr(x, y, size) {
    const qr = qrcode(0, 'M');
    qr.addData(this.link);
    qr.make();
    const n = qr.getModuleCount();
    const cell = size / (n + 4);
    const g = this.add.graphics();
    g.fillStyle(0xffffff).fillRoundedRect(x, y, size, size, this.s(8));
    g.fillStyle(0x04102e);
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) g.fillRect(x + (c + 2) * cell, y + (r + 2) * cell, Math.ceil(cell), Math.ceil(cell));
    }
    return g;
  }

  async save() {
    const data = { title: 'My Intel AI PC match', text: `${this.laptop.model}, ${rupees(this.laptop.price)}`, url: this.link };
    try {
      if (navigator.share) return await navigator.share(data);
      await navigator.clipboard.writeText(this.link);
      this.ask({ title: 'Link copied', body: 'Paste it anywhere to open your laptop match later.', buttons: [{ label: 'Done', onClick: () => {} }] });
    } catch (e) {
      if (e?.name === 'AbortError') return; // share sheet dismissed
      // Clipboard blocked: show the link instead.
      this.ask({ title: 'Your match link', body: this.link, buttons: [{ label: 'Done', onClick: () => {} }] });
    }
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
    y += text(-cw / 2, y, p.line, 17, { color: th.dim }).height + s(6);
    if (this.scores) {
      const total = Object.values(this.scores).reduce((a, b) => a + b, 0) || 1;
      const parts = Object.entries(this.scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => [k, Math.round((v / total) * 100)]);
      // Rounding can drift to 99% or 101%; the top persona absorbs the difference.
      if (parts.length) parts[0][1] += 100 - parts.reduce((t, [, p]) => t + p, 0);
      const mix = parts.slice(0, 3).map(([k, p]) => `${p}% ${SHORT[k]}`).join(', ');
      if (mix) y += text(-cw / 2, y, `Your mix: ${mix}`, 14, { weight: '700', color: th.accent }).height;
    }
    y += s(16);

    // Laptop card.
    const ip = s(22);
    const cardTop = y;
    const cardG = add(this.add.graphics()); // card behind, bullets on top
    const g = add(this.add.graphics());
    let cy = cardTop + ip;
    const parts = [];
    const ctext = (str, fs, opts) => { const t = text(-cw / 2 + ip, cy, str, fs, { wrap: cw - ip * 2, ...opts }); parts.push(t); cy += t.height; return t; };
    ctext(this.budget ? `Your best match, ${this.budget.label.toLowerCase()}` : 'Your Intel AI PC match', 14, { weight: '700', color: th.accent }); cy += s(6);
    ctext(L.model, 22, { font: 'Unbounded', weight: '800' }); cy += s(6);
    ctext(L.chip, 16, { weight: '700' }); cy += s(2);
    ctext(L.specs, 15, { color: th.dim }); cy += s(12);
    const priceT = ctext(rupees(L.price), 30, { font: 'Unbounded', weight: '800', color: th.accent }); cy += s(4);
    ctext(PRICE_NOTE, 12, { color: th.dim }); cy += s(14);
    L.why.forEach((w) => {
      g.fillStyle(0x2ef2c8).fillRect(-cw / 2 + ip, cy + s(8), s(8), s(8));
      const t = text(-cw / 2 + ip + s(20), cy, w, 15, { wrap: cw - ip * 2 - s(20) });
      cy += t.height + s(8);
    });
    cy += ip - s(8);
    drawCard(cardG, th, -cw / 2, cardTop, cw, cy - cardTop, s);
    y = cy + s(14);

    // Runner-up: a better pick just above budget, or the next best inside it.
    if (this.runnerUp) {
      const r = this.runnerUp;
      const rg = add(this.add.graphics());
      const t1 = text(-cw / 2 + s(16), y + s(12), r.tag, 13, { weight: '700', color: '#ffc145', wrap: cw - s(32) });
      const t2 = text(-cw / 2 + s(16), y + s(16) + t1.height, `${r.model}, ${rupees(r.price)}`, 15, { weight: '700', wrap: cw - s(32) });
      const rh = s(28) + t1.height + t2.height;
      rg.lineStyle(s(1.5), 0xffc145, 0.6).strokeRoundedRect(-cw / 2, y, cw, rh, s(14));
      y += rh + s(16);
    } else {
      y += s(6);
    }

    const gap = s(12);
    const wide = cw > s(440);
    // Kiosk / laptop screens: QR to carry the match to your phone.
    if (wide && !this.fromLink) {
      const q = s(112);
      add(this.drawQr(-cw / 2, y, q));
      const tx = -cw / 2 + q + s(18);
      const t1 = text(tx, y + s(14), 'Scan to save your match', 17, { weight: '700', wrap: cw - q - s(18) });
      text(tx, y + s(20) + t1.height, 'Opens this laptop pick on your phone, to show staff or decide later.', 14, { color: th.dim, wrap: cw - q - s(18) });
      y += q + s(20);
    }
    const buttons = [{ label: 'Get a hands-on demo', fn: () => this.demo() }];
    if (!wide && !this.fromLink) buttons.push({ label: 'Save my match', fn: () => this.save(), ghost: true });
    buttons.push({ label: this.fromLink ? 'Play the game' : 'Play again', fn: () => this.go('Title'), ghost: true });
    const perRow = wide ? buttons.length : 1;
    const bw = (cw - gap * (perRow - 1)) / perRow;
    buttons.forEach((b, i) => {
      const btn = new Button(this, th, b.label, b.fn, { ghost: b.ghost });
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      btn.place(-cw / 2 + bw / 2 + col * (bw + gap), y + s(28) + row * (s(56) + gap), bw, s(56), s(wide && perRow > 2 ? 15 : 17));
      add(btn);
    });
    const rows = Math.ceil(buttons.length / perRow);
    y += rows * s(56) + (rows - 1) * gap;
    this.overlayKeys = { Enter: () => this.demo() };

    const sc = Math.min(1, (H - s(36)) / y);
    if (this.refit(sc)) return;
    root.y = Math.max(s(12), (H - y) / 2);

    // First time in: slide up, count the price up, throw confetti.
    if (!this.animated && !this.reduced) {
      this.animated = true;
      root.list.forEach((o, i) => {
        const y0 = o.y;
        o.setAlpha(0).setY(y0 + s(24));
        this.tweens.add({ targets: o, alpha: 1, y: y0, delay: i * 22, duration: 360, ease: 'Quad.Out' });
      });
      const n = { v: 0 };
      this.tweens.add({ targets: n, v: L.price, duration: 900, delay: 250, ease: 'Cubic.Out', onUpdate: () => priceT.active && priceT.setText(rupees(Math.round(n.v / 10) * 10)), onComplete: () => priceT.active && priceT.setText(rupees(L.price)) });
      this.time.delayedCall(450, () => this.party(W / 2, H * 0.25, 90));
    }
  }
}
