import { DPR } from './theme.js';

// Each level is played on the screen of a computer from its era, standing in a room from
// that era. All sizes are canvas (device) pixels. layoutFrame() decides where the screen
// sits; drawFrame() paints the room and the machine around it.

// Screen aspect and the machine parts around the screen, in units of screen height.
const SPEC = {
  dos: { aspect: 4 / 3, bezel: 0.1, below: 0.52 }, // CRT monitor + chin, system unit, keyboard
  y2k: { aspect: 4 / 3, bezel: 0.07, below: 0.3 }, // chunky laptop lid + thick deck
  cloud: { aspect: 16 / 10, bezel: 0.04, below: 0.24 }, // thin aluminium laptop
  ai: { aspect: 3 / 2, bezel: 0.025, below: 0.2 }, // near-borderless 2026 laptop, taller 3:2 screen
};

export function layoutFrame(W, H, era) {
  const css = (n) => n * DPR;
  // Full desk scene only where there is room for it: landscape laptop/kiosk screens.
  // Upright phones and short landscape phones get a slim bezel so the game stays big.
  const full = W > H && H / DPR >= 520 && W / DPR >= 760;
  if (!full) {
    const m = css(10);
    const b = css(era === 'dos' ? 12 : 8);
    return { full: false, era, x: m + b, y: m + b, w: W - 2 * (m + b), h: H - 2 * (m + b), m, b };
  }
  const sp = SPEC[era];
  const totalH = 1 + 2 * sp.bezel + sp.below;
  const totalW = (sp.aspect + 2 * sp.bezel) * (era === 'dos' ? 1.25 : 1.1);
  // Leave the room's edges visible so its decor reads as the era's wallpaper.
  const sh = Math.min((H * 0.94) / totalH, (W * 0.76) / totalW);
  const sw = sh * sp.aspect;
  const x = (W - sw) / 2;
  const top = (H - sh * totalH) / 2;
  const y = top + sh * sp.bezel;
  return { full: true, era, x, y, w: sw, h: sh, bez: sh * sp.bezel, below: sh * sp.below };
}

// ---------------------------------------------------------------------------------------
// Drawing helpers (Phaser Graphics). L = layoutFrame() result; addText(x, y, str, style).

export function drawFrame(g, addText, W, H, L) {
  if (!L.full) {
    // Slim mode: just the era's wall colour; room decor would only peek in as fragments.
    g.fillStyle(WALL[L.era]).fillRect(0, 0, W, H);
    return slimBezel(g, L);
  }
  const room = { dos: room1981, y2k: room2003, cloud: room2015, ai: room2026 }[L.era];
  const deskY = L.y + L.h + L.bez + L.below * 0.45;
  g.fillStyle(WALL[L.era]).fillRect(-W, -H, W * 3, H * 3); // beyond the edges, for the zoom-in intro
  room(g, addText, W, H, deskY, L);
  screenGlow(g, L, deskY);
  ({ dos: crtDesktop, y2k: laptop2003, cloud: laptop2015, ai: laptop2026 })[L.era](g, addText, L);
}

const WALL = { dos: 0x6b4426, y2k: 0x7aa6c2, cloud: 0x7a3b22, ai: 0x0d1433 };
const GLOW = { dos: 0x3dff7a, y2k: 0x9fd8ff, cloud: 0xfff4e0, ai: 0x00c7fd };

// Light from the screen spilling onto the wall behind and the desk in front.
function screenGlow(g, L, deskY) {
  const cx = L.x + L.w / 2;
  const cy = L.y + L.h / 2;
  const c = GLOW[L.era];
  [[1.0, 0.05], [0.78, 0.05], [0.56, 0.06]].forEach(([r, a]) => g.fillStyle(c, a).fillCircle(cx, cy, L.w * r));
  g.fillStyle(c, 0.08).fillEllipse(cx, deskY + L.h * 0.12, L.w * 1.5, L.h * 0.35);
}

function slimBezel(g, L) {
  const col = { dos: 0xd8cfb5, y2k: 0x2b2b2b, cloud: 0xc9ced6, ai: 0x1c2333 }[L.era];
  const o = L.b;
  g.fillStyle(0x000000, 0.35).fillRoundedRect(L.x - o + 4, L.y - o + 6, L.w + 2 * o, L.h + 2 * o, o * 1.2);
  g.fillStyle(col).fillRoundedRect(L.x - o, L.y - o, L.w + 2 * o, L.h + 2 * o, o * 1.2);
  g.fillStyle(0x000000).fillRect(L.x - 2, L.y - 2, L.w + 4, L.h + 4);
}

const desk = (g, W, H, deskY, top, front) => {
  g.fillStyle(top).fillRect(-W, deskY, W * 3, H * 2);
  g.fillStyle(front).fillRect(-W, deskY, W * 3, Math.max(4, (H - deskY) * 0.08));
};

// ---- rooms ------------------------------------------------------------------------------
function room1981(g, addText, W, H, deskY) {
  // Wood-panelled study.
  g.fillStyle(0x6b4426).fillRect(0, 0, W, H);
  const p = Math.max(40, W / 18);
  for (let x = 0; x < W; x += p) {
    g.fillStyle(0x7a4f2d).fillRect(x, 0, p * 0.92, deskY);
    g.fillStyle(0x5a371d).fillRect(x + p * 0.92, 0, p * 0.08, deskY);
  }
  // Framed picture and a wall calendar.
  g.fillStyle(0xc9a227).fillRect(W * 0.06, H * 0.1, W * 0.12, H * 0.16);
  g.fillStyle(0x3d6b4a).fillRect(W * 0.07, H * 0.115, W * 0.1, H * 0.13);
  g.fillStyle(0x8fb3d9).fillTriangle(W * 0.08, H * 0.24, W * 0.12, H * 0.15, W * 0.16, H * 0.24);
  g.fillStyle(0xf3ead2).fillRect(W * 0.84, H * 0.1, W * 0.09, H * 0.14);
  g.fillStyle(0xb3261e).fillRect(W * 0.84, H * 0.1, W * 0.09, H * 0.035);
  addText(W * 0.885, H * 0.185, '1981', { fontFamily: 'VT323', fontSize: Math.round(H * 0.045), color: '#2b1a0e' }).setOrigin(0.5);
  desk(g, W, H, deskY, 0x4a2f1b, 0x2e1c10);
  // Desk lamp (drawn after the desk so it stands on it): weighted base, two-part arm,
  // green shade angled down, soft light cone and a warm pool on the desk.
  const u = H * 0.01;
  const lx = W * 0.915;
  const elbow = { x: lx + u * 3, y: deskY - u * 17 };
  const head = { x: lx - u * 4, y: deskY - u * 26 };
  g.fillStyle(0xffe9a8, 0.1).fillTriangle(head.x - u * 3, head.y + u * 3, head.x - u * 15, deskY, head.x + u * 5, deskY);
  g.fillStyle(0xffe9a8, 0.16).fillEllipse(head.x - u * 5, deskY + u * 1.5, u * 22, u * 4);
  g.lineStyle(Math.max(3, u * 0.8), 0x2b2b2b).lineBetween(lx, deskY - u, elbow.x, elbow.y).lineBetween(elbow.x, elbow.y, head.x, head.y);
  g.fillStyle(0x2b2b2b).fillCircle(elbow.x, elbow.y, u * 0.9).fillEllipse(lx, deskY - u * 0.6, u * 10, u * 2.6);
  g.fillStyle(0x2e5d3a).fillPoints([
    { x: head.x - u * 1, y: head.y - u * 2 }, { x: head.x + u * 3, y: head.y - u * 0.5 },
    { x: head.x + u * 1, y: head.y + u * 4.5 }, { x: head.x - u * 7.5, y: head.y + u * 3 },
  ], true);
  g.fillStyle(0xfff3c4, 0.95).fillCircle(head.x - u * 3, head.y + u * 3.6, u * 1.2);
}

function room2003(g, addText, W, H, deskY) {
  // College hostel: painted wall, posters, window with blinds, a shelf.
  g.fillStyle(0x7aa6c2).fillRect(0, 0, W, H);
  g.fillStyle(0xdfeef7).fillRect(W * 0.015, H * 0.08, W * 0.1, H * 0.34);
  g.fillStyle(0xb8c9d6);
  for (let y = H * 0.09; y < H * 0.41; y += H * 0.025) g.fillRect(W * 0.015, y, W * 0.1, H * 0.012);
  g.fillStyle(0xe5383b).fillRect(W * 0.885, H * 0.07, W * 0.095, H * 0.2);
  g.fillStyle(0xffd23f).fillRect(W * 0.02, H * 0.5, W * 0.09, H * 0.14);
  g.fillStyle(0xffffff, 0.7).fillRect(W * 0.92, H * 0.065, W * 0.025, H * 0.012).fillRect(W * 0.055, H * 0.495, W * 0.025, H * 0.012);
  g.fillStyle(0x5a4632).fillRect(W * 0.87, H * 0.4, W * 0.13, H * 0.015);
  [0x1036a8, 0x31c45a, 0xe5383b, 0xffb020, 0x6b4f8a].forEach((c, i) => g.fillStyle(c).fillRect(W * (0.88 + i * 0.022), H * 0.33, W * 0.016, H * 0.07));
  addText(W * 0.9325, H * 0.17, 'EXAMS\n2003', { fontFamily: 'Silkscreen', fontSize: Math.round(H * 0.024), color: '#ffffff', align: 'center' }).setOrigin(0.5);
  desk(g, W, H, deskY, 0xc49a6c, 0x9a7148);
}

function room2015(g, addText, W, H, deskY) {
  // Café: brick wall, pendant lamps, chalk menu.
  g.fillStyle(0x7a3b22).fillRect(0, 0, W, H);
  const bw = Math.max(36, W / 22);
  const bh = bw * 0.42;
  for (let r = 0, y = 0; y < deskY; r++, y += bh) {
    for (let x = r % 2 ? -bw / 2 : 0; x < W; x += bw) {
      g.fillStyle((x + y) % 3 < 1.5 ? 0xa0522d : 0x8f4a28).fillRect(x + 2, y + 2, bw - 4, bh - 4);
    }
  }
  g.fillStyle(0x23282d).fillRect(W * 0.015, H * 0.12, W * 0.11, H * 0.3);
  g.lineStyle(3, 0x8b6b4a).strokeRect(W * 0.015, H * 0.12, W * 0.11, H * 0.3);
  addText(W * 0.07, H * 0.27, 'MENU\nlatte\ncold coffee\nfree wi-fi*', { fontFamily: 'Figtree', fontStyle: '700', fontSize: Math.round(Math.min(H * 0.024, W * 0.013)), color: '#f2f2f2', align: 'center', lineSpacing: 4 }).setOrigin(0.5);
  [0.9, 0.96].forEach((f) => {
    g.lineStyle(2, 0x222222).lineBetween(W * f, 0, W * f, H * 0.18);
    g.fillStyle(0x222222).fillTriangle(W * f - W * 0.03, H * 0.24, W * f + W * 0.03, H * 0.24, W * f, H * 0.18);
    g.fillStyle(0xffd27a, 0.25).fillCircle(W * f, H * 0.26, H * 0.08);
    g.fillStyle(0xffe9a8).fillCircle(W * f, H * 0.245, H * 0.012);
  });
  desk(g, W, H, deskY, 0x6e4a2e, 0x4a301d);
  // Coffee cup on the table.
  const cx = W * 0.92;
  g.fillStyle(0xffffff).fillRect(cx - W * 0.02, deskY - H * 0.07, W * 0.04, H * 0.07);
  g.lineStyle(3, 0xffffff).strokeCircle(cx + W * 0.026, deskY - H * 0.04, H * 0.016);
  g.fillStyle(0x6e3b1f).fillRect(cx - W * 0.018, deskY - H * 0.068, W * 0.036, H * 0.012);
}

function room2026(g, addText, W, H, deskY) {
  // Modern room at night: dark wall, neon strip, city window, plant.
  g.fillStyle(0x0d1433).fillRect(0, 0, W, H);
  g.fillStyle(0x0a1a40).fillRect(W * 0.015, H * 0.12, W * 0.11, H * 0.38);
  [0.02, 0.042, 0.064, 0.086, 0.104].forEach((f, i) => g.fillStyle(0x1b2a5c).fillRect(W * f, H * (0.32 - (i % 3) * 0.05), W * 0.018, H * (0.18 + (i % 3) * 0.05)));
  g.fillStyle(0xffd27a, 0.8);
  for (let i = 0; i < 14; i++) g.fillRect(W * (0.024 + (i % 5) * 0.022), H * (0.35 + Math.floor(i / 5) * 0.04), W * 0.005, H * 0.01);
  g.lineStyle(3, 0x3a4a80).strokeRect(W * 0.015, H * 0.12, W * 0.11, H * 0.38);
  // Neon strip light.
  g.fillStyle(0x00c7fd, 0.18).fillRect(0, H * 0.05, W, H * 0.03);
  g.fillStyle(0x00c7fd).fillRect(0, H * 0.06, W, H * 0.006);
  g.fillStyle(0xff5fa2, 0.12).fillRect(0, H * 0.075, W, H * 0.02);
  // Plant.
  const px = W * 0.93;
  g.fillStyle(0xf2f6ff).fillRect(px - W * 0.03, deskY - H * 0.1, W * 0.06, H * 0.1);
  [[-0.03, -0.17, 0.035], [0.02, -0.2, 0.04], [0, -0.26, 0.032], [0.035, -0.14, 0.03], [-0.035, -0.12, 0.028]].forEach(([dx, dy, r]) => g.fillStyle(0x2ef2c8, 0.85).fillCircle(px + W * dx, deskY + H * dy, H * r));
  desk(g, W, H, deskY, 0xdfe3ea, 0xb7bfcc);
}

// ---- machines ---------------------------------------------------------------------------
function crtDesktop(g, addText, L) {
  const { x, y, w, h, bez } = L;
  const beige = 0xd8cfb5;
  const shade = 0xb8ae92;
  const chin = h * 0.08;
  // Monitor case.
  g.fillStyle(0x000000, 0.3).fillRoundedRect(x - bez + 8, y - bez + 10, w + 2 * bez, h + 2 * bez + chin, bez * 0.4);
  g.fillStyle(beige).fillRoundedRect(x - bez, y - bez, w + 2 * bez, h + 2 * bez + chin, bez * 0.4);
  g.fillStyle(shade).fillRoundedRect(x - bez * 0.45, y - bez * 0.45, w + bez * 0.9, h + bez * 0.9, bez * 0.5);
  g.fillStyle(0x111111).fillRoundedRect(x - 6, y - 6, w + 12, h + 12, bez * 0.35);
  g.fillStyle(0x3dff7a).fillCircle(x + w + bez * 0.55, y + h + bez * 0.9, Math.max(3, h * 0.012));
  addText(x - bez * 0.4, y + h + bez * 0.65, 'MICRO-PC', { fontFamily: 'VT323', fontSize: Math.round(h * 0.05), color: '#6b6250' });
  // System unit with floppy slots.
  const uy = y + h + bez + chin + h * 0.02;
  const uw = (w + 2 * bez) * 1.12;
  const ux = x + w / 2 - uw / 2;
  const uh = h * 0.2;
  g.fillStyle(beige).fillRect(ux, uy, uw, uh);
  g.fillStyle(shade).fillRect(ux, uy + uh - h * 0.02, uw, h * 0.02);
  [0.55, 0.78].forEach((f) => {
    g.fillStyle(0x2b2b2b).fillRect(ux + uw * f - uw * 0.09, uy + uh * 0.4, uw * 0.18, uh * 0.12);
    g.fillStyle(0x6b6250).fillRect(ux + uw * f - uw * 0.02, uy + uh * 0.62, uw * 0.04, uh * 0.08);
  });
  // Keyboard slab in front.
  const ky = uy + uh + h * 0.05;
  const kw = uw * 0.95;
  const kx = x + w / 2 - kw / 2;
  const kh = h * 0.15;
  g.fillStyle(beige).fillRect(kx, ky, kw, kh);
  g.fillStyle(0x8a826b);
  const cols = 16;
  for (let r = 0; r < 4; r++) for (let c = 0; c < cols; c++) g.fillRect(kx + kw * 0.03 + c * (kw * 0.94 / cols), ky + kh * 0.12 + r * kh * 0.21, kw * 0.94 / cols - 3, kh * 0.16);
}

function laptopBase(g, L, { lid, deck, keys, keyGlow, sticker, edge }) {
  const { x, y, w, h, bez, below } = L;
  // Lid / screen bezel.
  g.fillStyle(0x000000, 0.3).fillRoundedRect(x - bez + 6, y - bez + 8, w + 2 * bez, h + 2 * bez, bez * 0.8 + 4);
  g.fillStyle(lid).fillRoundedRect(x - bez, y - bez, w + 2 * bez, h + 2 * bez, bez * 0.8 + 4);
  g.fillStyle(0x000000).fillRect(x - 2, y - 2, w + 4, h + 4);
  // Deck in perspective: wider at the front.
  const top = y + h + bez;
  const dh = below * 0.62;
  const backW = w + 2 * bez;
  const frontW = backW * 1.12;
  const cx = x + w / 2;
  g.fillStyle(deck).fillPoints([
    { x: cx - backW / 2, y: top }, { x: cx + backW / 2, y: top },
    { x: cx + frontW / 2, y: top + dh }, { x: cx - frontW / 2, y: top + dh },
  ], true);
  g.fillStyle(edge).fillRect(cx - frontW / 2, top + dh, frontW, Math.max(4, dh * 0.08));
  // Keyboard rows.
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const t = (r + 0.6) / (rows + 2.4);
    const rowW = backW * 0.82 + (frontW * 0.82 - backW * 0.82) * t;
    const ry = top + dh * 0.08 + t * dh * 0.62;
    const n = 14;
    for (let c = 0; c < n; c++) {
      const kx = cx - rowW / 2 + c * (rowW / n);
      g.fillStyle(keys).fillRect(kx + 2, ry, rowW / n - 4, dh * 0.09);
      if (keyGlow) g.fillStyle(keyGlow, 0.35).fillRect(kx + 2, ry + dh * 0.085, rowW / n - 4, 2);
    }
  }
  // Trackpad.
  g.fillStyle(0x000000, 0.12).fillRoundedRect(cx - backW * 0.13, top + dh * 0.7, backW * 0.26, dh * 0.24, 6);
  if (sticker) g.fillStyle(sticker).fillRect(cx + backW * 0.3, top + dh * 0.78, backW * 0.05, dh * 0.1);
}

function laptop2003(g, addText, L) {
  laptopBase(g, L, { lid: 0x2b2b2b, deck: 0xb9bcc2, keys: 0x3a3a3a, sticker: 0x1036a8, edge: 0x8d9097 });
}

function laptop2015(g, addText, L) {
  laptopBase(g, L, { lid: 0x111111, deck: 0xd5d9e0, keys: 0x2a2d33, edge: 0xaab0ba });
  g.fillStyle(0xc9ced6).fillRect(L.x - L.bez, L.y + L.h + L.bez - 3, L.w + 2 * L.bez, 3);
}

function laptop2026(g, addText, L) {
  laptopBase(g, L, { lid: 0x1c2333, deck: 0x2a3247, keys: 0x141a29, keyGlow: 0x00c7fd, sticker: 0x00c7fd, edge: 0x151b2b });
  const cx = L.x + L.w / 2;
  addText(cx + (L.w + 2 * L.bez) * 0.325, L.y + L.h + L.bez + L.below * 0.62 * 0.83, 'AI PC', {
    fontFamily: 'Manrope', fontStyle: '800', fontSize: Math.max(8, Math.round(L.h * 0.018)), color: '#04102e',
  }).setOrigin(0.5);
}
