import Phaser from 'phaser';
import { sfx } from './audio.js';
import { hex } from './theme.js';

// A themed, tappable button. Size is set later with place() so layouts can reflow.
export class Button extends Phaser.GameObjects.Container {
  constructor(scene, th, label, onClick, opts = {}) {
    super(scene, 0, 0);
    scene.add.existing(this);
    Object.assign(this, { th, opts, bw: 10, bh: 10, hover: false });
    this.g = scene.add.graphics();
    this.t = scene.add
      .text(0, 0, label, {
        fontFamily: opts.font || th.body,
        fontStyle: '700',
        color: opts.ink || (opts.ghost ? th.ink : th.btnInk),
        align: 'center',
      })
      .setOrigin(0.5);
    this.add([this.g, this.t]);
    this.setSize(10, 10).setInteractive({ useHandCursor: true });
    this.on('pointerover', () => { this.hover = true; this.draw(); });
    this.on('pointerout', () => { this.hover = false; this.setScale(1); this.draw(); });
    this.on('pointerdown', () => this.setScale(0.96));
    this.on('pointerup', () => { this.setScale(1); sfx('click'); onClick(); });
  }

  place(x, y, w, h, fs) {
    this.setPosition(x, y);
    this.bw = w;
    this.bh = h;
    this.setSize(w, h);
    this.input.hitArea.setTo(0, 0, w, h);
    this.t.setFontSize(fs).setWordWrapWidth(w - fs, true);
    this.draw();
    return this;
  }

  draw() {
    const { g, bw: w, bh: h, th, opts } = this;
    const x = -w / 2;
    const y = -h / 2;
    const lw = Math.max(2, h * 0.05);
    g.clear();
    this.setAlpha(opts.disabled ? 0.4 : 1);
    const fill = hex(opts.fill || th.btnFill);
    if (th.name === 'y2k') {
      const [hi, lo] = opts.pressed ? [0x3a3a3a, 0xffffff] : [0xffffff, 0x3a3a3a];
      g.fillStyle(this.hover && !opts.fill ? 0xdedbd2 : fill).fillRect(x, y, w, h);
      g.lineStyle(lw, hi).lineBetween(x, y, x + w, y).lineBetween(x, y, x, y + h);
      g.lineStyle(lw, lo).lineBetween(x, y + h, x + w, y + h).lineBetween(x + w, y, x + w, y + h);
      return;
    }
    const r = th.name === 'cloud' ? h / 2 : th.name === 'ai' ? h * 0.28 : 0;
    if (opts.ghost) {
      g.lineStyle(lw, hex(th.ink), this.hover ? 1 : 0.6);
      if (r) g.strokeRoundedRect(x, y, w, h, r);
      else g.strokeRect(x, y, w, h);
      return;
    }
    if (th.name === 'ai') {
      g.lineStyle(lw * 3, hex(opts.fill || th.accent), this.hover ? 0.45 : 0.2)
        .strokeRoundedRect(x - lw, y - lw, w + 2 * lw, h + 2 * lw, r + lw);
    }
    g.fillStyle(fill, this.hover ? 0.85 : 1);
    if (r) g.fillRoundedRect(x, y, w, h, r);
    else g.fillRect(x, y, w, h);
  }
}

// Era-styled window/card background.
export function drawCard(g, th, x, y, w, h, s, title) {
  if (th.name === 'dos') {
    g.fillStyle(hex(th.panel)).fillRect(x, y, w, h);
    g.lineStyle(s(2), hex(th.panelStroke)).strokeRect(x, y, w, h);
  } else if (th.name === 'y2k') {
    g.fillStyle(hex(th.panel)).fillRect(x, y, w, h);
    g.lineStyle(s(2), 0xffffff).lineBetween(x, y, x + w, y).lineBetween(x, y, x, y + h);
    g.lineStyle(s(2), 0x3a3a3a).lineBetween(x, y + h, x + w, y + h).lineBetween(x + w, y, x + w, y + h);
    if (title) g.fillStyle(hex(th.accent)).fillRect(x + s(4), y + s(4), w - s(8), s(30));
  } else if (th.name === 'cloud') {
    g.fillStyle(0x1b2330, 0.08).fillRoundedRect(x, y + s(6), w, h, s(18));
    g.fillStyle(hex(th.panel)).fillRoundedRect(x, y, w, h, s(18));
    g.lineStyle(s(1), hex(th.panelStroke)).strokeRoundedRect(x, y, w, h, s(18));
  } else {
    g.fillStyle(hex(th.panel), 0.92).fillRoundedRect(x, y, w, h, s(22));
    g.lineStyle(s(1.5), hex(th.panelStroke), 0.7).strokeRoundedRect(x, y, w, h, s(22));
  }
}

// Modal panel: kicker, title, body, buttons. Built for the current screen size.
export function panel(scene, th, opts) {
  const c = buildPanel(scene, th, opts);
  const avail = scene.H - scene.s(24);
  if (c.ph <= avail) return c;
  // Too tall: rebuild with smaller type (see Base.refit) instead of scaling the text.
  c.destroy();
  const prev = scene.fitMul || 1;
  scene.fitMul = prev * (avail / c.ph) * 0.98;
  const fitted = buildPanel(scene, th, opts);
  scene.fitMul = prev;
  return fitted;
}

function buildPanel(scene, th, { kicker, title, body, question, buttons = [], footer = [], hint }) {
  const s = (n) => scene.s(n);
  const { W, H } = scene;
  const pw = Math.min(W - s(32), s(580));
  const pad = s(24);
  const iw = pw - pad * 2;
  const c = scene.add.container(0, 0).setDepth(100);
  c.add(scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.5).setInteractive());
  const inner = scene.add.container(W / 2, 0);
  c.add(inner);
  const bar = th.name === 'y2k';
  const items = [];
  let y = pad + (bar ? s(30) : 0);

  if (kicker && bar) {
    items.push(scene.add.text(-pw / 2 + s(14), s(9), kicker, { fontFamily: th.body, fontStyle: '700', fontSize: s(16), color: '#ffffff' }));
  } else if (kicker) {
    const k = scene.add.text(-iw / 2, y, kicker, { fontFamily: th.body, fontStyle: '700', fontSize: s(th.name === 'dos' ? 22 : 15), color: th.accent });
    items.push(k);
    y += k.height + s(6);
  }
  if (title) {
    const t = scene.add.text(-iw / 2, y, title, {
      fontFamily: th.font, fontStyle: th.name === 'ai' ? '800' : '700',
      fontSize: s(th.name === 'dos' ? 40 : th.name === 'ai' ? 26 : 30), color: th.ink,
      wordWrap: { width: iw, useAdvancedWrap: true }, lineSpacing: s(2),
    });
    items.push(t);
    y += t.height + s(10);
  }
  if (body) {
    const b = scene.add.text(-iw / 2, y, body, {
      fontFamily: th.body, fontStyle: '500', fontSize: s(th.name === 'dos' ? 24 : 17),
      color: th.dim, wordWrap: { width: iw, useAdvancedWrap: true }, lineSpacing: s(5),
    });
    items.push(b);
    y += b.height + s(18);
  }
  if (question) {
    const q = scene.add.text(-iw / 2, y, question, {
      fontFamily: th.body, fontStyle: '700', fontSize: s(th.name === 'dos' ? 26 : 18),
      color: th.name === 'y2k' ? th.accent : th.ink, wordWrap: { width: iw, useAdvancedWrap: true }, lineSpacing: s(3),
    });
    items.push(q);
    y += q.height + s(14);
  }
  const two = buttons.length > 2 && iw > s(400);
  const gap = s(footer.length ? 10 : 12);
  const bh = s(footer.length && buttons.length > 4 && !two ? 48 : 56);
  const bw = two ? (iw - gap) / 2 : iw;
  buttons.forEach((b, i) => {
    const col = two ? i % 2 : 0;
    const row = two ? Math.floor(i / 2) : i;
    const btn = new Button(scene, th, b.label, b.onClick, b.opts);
    btn.place(-iw / 2 + bw / 2 + col * (bw + gap), y + bh / 2 + row * (bh + gap), bw, bh, s(th.name === 'dos' ? 24 : 17));
    items.push(btn);
  });
  const rows = two ? Math.ceil(buttons.length / 2) : buttons.length;
  if (rows) y += rows * bh + (rows - 1) * gap;
  if (hint) {
    const h = scene.add.text(0, y + s(12), hint, { fontFamily: th.body, fontStyle: '700', fontSize: s(th.name === 'dos' ? 20 : 14), color: th.name === 'y2k' ? '#8a1010' : th.name === 'cloud' ? '#c42b2e' : '#ffb3c7', align: 'center' }).setOrigin(0.5, 0);
    items.push(h);
    y += s(12) + h.height;
  }
  footer.forEach((b) => {
    y += s(18);
    const btn = new Button(scene, th, b.label, b.onClick, b.opts);
    btn.place(0, y + s(28), iw, s(56), s(th.name === 'dos' ? 24 : 17));
    items.push(btn);
    y += s(56);
  });
  const ph = y + pad;

  const g = scene.add.graphics();
  drawCard(g, th, -pw / 2, 0, pw, ph, s, bar);
  inner.add(g);
  inner.add(items);
  inner.y = Math.max(s(12), (H - ph) / 2);
  c.ph = ph;
  c.inner = inner;
  c.dim = c.list[0];
  return c;
}

// One-shot confetti burst. Canvas can't tint, so each colour gets its own tiny texture.
export function confetti(scene, x, y, colors, count = 40, spread = 1) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  colors.forEach((col) => {
    const key = `px-${col}`;
    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ add: false });
      g.fillStyle(hex(col)).fillRect(0, 0, 8, 12);
      g.generateTexture(key, 8, 12);
      g.destroy();
    }
    const k = scene.k;
    const em = scene.add.particles(x, y, key, {
      speed: { min: 180 * k * spread, max: 520 * k * spread },
      angle: { min: 200, max: 340 },
      gravityY: 900 * k,
      lifespan: 1400,
      rotate: { start: 0, end: 540 },
      scale: { start: k * 0.9, end: k * 0.5 },
      alpha: { start: 1, end: 0 },
      emitting: false,
    }).setDepth(200);
    em.explode(Math.ceil(count / colors.length));
    scene.time.delayedCall(1600, () => em.destroy());
  });
}

// Per-era background.
export function backdrop(scene, th) {
  const g = scene.add.graphics().setDepth(-10);
  const { W, H } = scene;
  const s = (n) => scene.s(n);
  g.fillStyle(hex(th.bg)).fillRect(0, 0, W, H);
  if (th.name === 'dos') {
    g.fillStyle(0x000000, 0.45);
    for (let y = 0; y < H; y += s(4)) g.fillRect(0, y, W, s(1.5));
    g.fillStyle(0x3dff7a, 0.035).fillCircle(W / 2, H / 2, Math.max(W, H) * 0.45);
  } else if (th.name === 'y2k') {
    g.fillStyle(0xc9c6bd).fillRect(0, H - s(38), W, s(38));
    g.lineStyle(s(2), 0xffffff).lineBetween(0, H - s(38), W, H - s(38));
  } else if (th.name === 'cloud') {
    g.fillStyle(0x2f6fed, 0.06);
    for (let x = s(20); x < W; x += s(28)) for (let y = s(20); y < H; y += s(28)) g.fillCircle(x, y, s(1.5));
  } else {
    const R = Math.max(W, H);
    g.fillStyle(0x0068b5, 0.22).fillCircle(W * 0.9, H * 0.05, R * 0.4);
    g.fillStyle(0x00c7fd, 0.07).fillCircle(W * 0.05, H * 0.95, R * 0.35);
    g.fillStyle(0xffffff, 0.06);
    for (let x = s(16); x < W; x += s(32)) for (let y = s(16); y < H; y += s(32)) g.fillCircle(x, y, s(1));
  }
  return g;
}
