import Base from './Base.js';
import { THEMES } from '../theme.js';
import { Button, drawCard } from '../ui.js';
import { music, sfx } from '../audio.js';
import qrcode from 'qrcode-generator';
import { LAPTOPS, PERSONAS, PRICE_NOTE, topPersona } from '../data.js';

const IDLE_RESET_MS = 120000; // in-store kiosk: return to the title for the next shopper

export default class Result extends Base {
  constructor() { super('Result'); }

  build(data) {
    this.th = THEMES.ai;
    music('ai');
    sfx('win');
    // Opened from the QR link on a phone: show that match, no kiosk reset.
    this.fromLink = !!(data?.match && LAPTOPS[data.match]);
    this.persona = this.fromLink ? data.match : topPersona(this.registry.get('picks') || []);
    this.laptop = LAPTOPS[this.persona];
    this.link = `${location.origin}${location.pathname}?match=${this.persona}`;
    if (!this.fromLink) this.time.delayedCall(IDLE_RESET_MS, () => this.go('Title'));
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
    const data = { title: 'My Intel AI PC match', text: `${this.laptop.model}, ${this.laptop.price}`, url: this.link };
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
    root.setScale(sc);
    root.y = (H - y * sc) / 2;
  }
}
