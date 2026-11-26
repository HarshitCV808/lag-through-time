import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES, ENGINE_COLORS } from '../theme.js';
import { drawCard, confetti } from '../ui.js';
import { music, sfx } from '../audio.js';
import { MOMENTS } from '../data.js';

// AI Day: five 4-second microgames across a Gen-Z day on an Intel AI PC
// (learning, work, creativity, gaming, everyday). Everything is drawn each frame from the
// current screen size, so rotating the phone mid-game just reflows.
const PLAY_S = 4.5;
const INTRO_S = 1.1;
const RESULT_S = 2.4;
const MASH_NEED = 8;
const HOLD_S = 1.2;

export default class Level4AIPC extends Base {
  constructor() { super('L4'); }

  build() {
    this.th = THEMES.ai;
    music('ai');
    Object.assign(this, { mi: -1, phase: 'idle', timer: 0, wins: 0, batt: 100, mg: null, clock: 0, log: [] });
    this.makeHud('Level 4 of 4   2026');
    this.g = this.add.graphics();
    const st = (font, weight, color) => ({ fontFamily: font, fontStyle: weight, color });
    this.clockT = this.add.text(0, 0, '', st('Unbounded', '800', this.th.ink));
    this.placeT = this.add.text(0, 0, '', st('Manrope', '700', this.th.dim));
    this.instrT = this.add.text(0, 0, '', { ...st('Unbounded', '800', this.th.accent), align: 'center' }).setOrigin(0.5, 0);
    this.statusT = this.add.text(0, 0, '', st('Manrope', '700', this.th.dim)).setOrigin(0.5, 0);
    // What each moment did stays on screen: a running "Done today" list on wide screens,
    // the latest feature in a band under the play area on tall ones.
    this.logC = this.add.container(0, 0);
    this.stampT = this.add.text(0, 0, '', { ...st('Manrope', '800', '#ffffff'), align: 'center', stroke: '#060d2b', strokeThickness: 8 }).setOrigin(0.5).setDepth(20);
    // Reusable in-stage labels (each microgame uses some of them).
    this.la = this.add.text(0, 0, '', st('Manrope', '700', '#ffffff')).setOrigin(0.5).setDepth(5);
    this.lb = this.add.text(0, 0, '', st('Unbounded', '800', '#04102e')).setOrigin(0.5).setDepth(5);
    this.lc = this.add.text(0, 0, '', { ...st('Manrope', '700', '#ffffff'), align: 'center' }).setOrigin(0.5).setDepth(5);
    // World coordinates: the level is drawn on the era laptop's screen, not the full canvas.
    this.input.on('pointerdown', (p) => this.down({ x: p.worldX, y: p.worldY }));
    this.input.on('pointermove', (p) => this.move({ x: p.worldX, y: p.worldY, isDown: p.isDown }));
    this.input.on('pointerup', () => this.up());
    this.input.keyboard.on('keyup', () => this.up());
    this.askMulti('L4', 'Level 4 of 4', () => this.start(), {
      title: '2026: AI Day',
      body: 'Five quick moments in one day on an Intel AI PC: tap, swipe, hold, mash. All on the laptop itself, even with Wi-Fi off.',
    });
  }

  start() {
    this.t0 = this.time.now;
    this.startMoment(0);
  }

  get m() { return MOMENTS[this.mi]; }

  startMoment(i) {
    this.mi = i;
    this.phase = 'intro';
    this.timer = INTRO_S;
    this.mg = {
      lecture: { rx: Phaser.Math.FloatBetween(0.35, 1), ry: Phaser.Math.FloatBetween(0, 1) },
      call: { blur: 0, last: null },
      reel: { px: Phaser.Math.FloatBetween(0.3, 0.7), cut: 0 },
      game: { boost: 0, holding: false, scroll: 0, acc: 0 },
      notes: { taps: 0 },
    }[this.m.id];
    this.stampT.setText('');
    sfx('pop');
    if (!this.reduced) {
      this.clockT.setAlpha(0);
      this.tweens.add({ targets: this.clockT, alpha: 1, duration: 250 });
      this.instrT.setScale(1.25);
      this.tweens.add({ targets: this.instrT, scale: 1, duration: 300, ease: 'Back.Out' });
    }
  }

  // ---- input -------------------------------------------------------------------------
  inStage(p) {
    const R = this.R;
    return p.x >= R.x && p.x <= R.x + R.w && p.y >= R.y && p.y <= R.y + R.h;
  }

  down(p) {
    if (this.phase !== 'play' || this.overlay) return;
    const { mg, R } = this;
    const id = this.m.id;
    if (id === 'lecture') {
      const b = this.ccBox();
      if (p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) this.win();
      else if (this.inStage(p)) this.nudge();
    } else if (id === 'call' && this.inStage(p)) {
      mg.last = { x: p.x, y: p.y };
    } else if (id === 'reel' && this.inStage(p)) {
      const px = R.x + mg.px * R.w;
      const hit = Math.abs(p.x - px) < this.s(50) && p.y > R.y + R.h * 0.3;
      if (hit) this.win(); else this.nudge();
    } else if (id === 'game' && this.inStage(p)) {
      mg.holding = true;
    } else if (id === 'notes' && this.inStage(p)) {
      this.mash();
    }
  }

  move(p) {
    if (this.phase !== 'play' || !p.isDown || this.m.id !== 'call') return;
    const mg = this.mg;
    if (!mg.last) return;
    mg.blur = Math.min(1, mg.blur + (Math.abs(p.x - mg.last.x) + Math.abs(p.y - mg.last.y)) / (this.R.w * 1.6));
    mg.last = { x: p.x, y: p.y };
    if (mg.blur >= 1) this.win();
  }

  up() {
    if (this.mg) { this.mg.holding = false; this.mg.last = null; }
  }

  // Keyboard: any key is the action (tap, mash, hold; repeated presses swipe).
  onKey(e) {
    if (this.phase !== 'play') return;
    const id = this.m.id;
    if (id === 'lecture' || id === 'reel') this.win();
    else if (id === 'call') { this.mg.blur += 0.25; if (this.mg.blur >= 1) this.win(); }
    else if (id === 'game') this.mg.holding = true;
    else if (id === 'notes' && !e.repeat) this.mash();
  }

  mash() {
    this.mg.taps++;
    sfx('key');
    this.cameras.main.shake(60, 0.002);
    if (this.mg.taps >= MASH_NEED) this.win();
  }

  nudge() {
    sfx('no');
    this.cameras.main.shake(100, 0.004);
  }

  // ---- flow --------------------------------------------------------------------------
  settle() {
    // Show the finished effect whether the player made it or not.
    const mg = this.mg;
    if (this.m.id === 'call') mg.blur = 1;
    if (this.m.id === 'game') mg.boost = 1;
    if (this.m.id === 'notes') mg.taps = MASH_NEED;
  }

  win() {
    if (this.phase !== 'play') return;
    this.phase = 'result';
    this.timer = RESULT_S;
    this.wins++;
    this.batt -= 6;
    sfx('ok');
    sfx('whoosh');
    const col = ENGINE_COLORS[this.m.engine];
    this.stampT.setText(this.m.done).setColor(col);
    this.addLog(true);
    confetti(this, this.R.x + this.R.w / 2, this.R.y + this.R.h / 2, [col, '#ffffff', '#00c7fd'], 40);
    if (this.m.id === 'reel') this.tweens.add({ targets: this.mg, cut: 1, duration: 400 });
    this.settle();
    if (!this.reduced) {
      this.stampT.setScale(0.6);
      this.tweens.add({ targets: this.stampT, scale: 1, duration: 260, ease: 'Back.Out' });
    }
  }

  lose() {
    this.phase = 'result';
    this.timer = RESULT_S + 0.3;
    this.batt -= 6;
    sfx('no');
    this.stampT.setText(`Too slow! ${this.m.done}`).setColor('#ffd9e8');
    this.addLog(false);
    if (this.m.id === 'reel') this.mg.cut = 1;
    this.settle();
  }

  update(_, dtMs) {
    this.tickHud();
    const dt = Math.min(dtMs, 50) / 1000;
    this.clock += dt;
    if (this.phase === 'intro') {
      this.timer -= dt;
      if (this.timer <= 0) { this.phase = 'play'; this.timer = PLAY_S; }
    } else if (this.phase === 'play') {
      this.timer -= dt;
      const mg = this.mg;
      if (this.m.id === 'game') {
        mg.boost = Phaser.Math.Clamp(mg.boost + (mg.holding ? dt / HOLD_S : -dt * 0.5), 0, 1);
        if (mg.boost >= 1) this.win();
      }
      if (this.phase === 'play' && this.timer <= 0) this.lose();
    } else if (this.phase === 'result') {
      this.timer -= dt;
      if (this.timer <= 0) {
        if (this.mi + 1 < MOMENTS.length) this.startMoment(this.mi + 1);
        else this.finish();
      }
    }
    this.draw(dt);
  }

  // ---- layout + drawing ----------------------------------------------------------------
  layout() {
    const s = (n) => this.s(n);
    const pad = s(18);
    const y = this.layoutHud();
    // Wide screens (the 2026 laptop, landscape phones): header in a left column, play
    // area on the right. Tall screens: header stacked above the play area.
    const wide = this.W > this.H * 1.25;
    if (wide) {
      const lw = Math.min(this.W * 0.34, s(300));
      const x0 = pad;
      this.clockT.setPosition(x0, y).setFontSize(s(28));
      this.placeT.setPosition(x0, y + s(40)).setFontSize(s(14));
      this.instrT.setOrigin(0, 0).setAlign('left').setPosition(x0, y + s(68)).setFontSize(s(17)).setWordWrapWidth(lw, true);
      const barY = y + s(68) + s(17) * 1.3 * 3 + s(12); // room for a three-line instruction
      this.bar = { x: x0, y: barY, w: lw, h: s(8) };
      this.statusT.setOrigin(0, 0).setAlign('left').setPosition(x0, barY + s(20)).setFontSize(s(13)).setWordWrapWidth(lw, true);
      const sx = x0 + lw + s(22);
      this.R = { x: sx, y, w: this.W - sx - pad, h: Math.max(s(150), this.H - y - pad) };
      this.logBox = { wide: true, x: x0, y: barY + s(62), w: lw };
    } else {
      const cw = Math.min(this.W - pad * 2, s(560));
      const x0 = (this.W - cw) / 2;
      const tight = this.H / this.k < 470;
      this.clockT.setPosition(x0, y).setFontSize(s(tight ? 22 : 30));
      this.placeT.setPosition(x0, y + s(tight ? 30 : 42)).setFontSize(s(14));
      const iy = y + s(tight ? 52 : 70);
      this.instrT.setOrigin(0.5, 0).setAlign('center').setPosition(this.W / 2, iy).setFontSize(s(tight ? 16 : 18)).setWordWrapWidth(cw, true);
      const barY = iy + s(tight ? 30 : 66); // room for a two-line instruction
      this.bar = { x: x0, y: barY, w: cw, h: s(8) };
      const stageTop = barY + s(16);
      const band = s(46); // latest feature stays readable here
      this.R = { x: x0, y: stageTop, w: cw, h: Math.max(s(140), this.H - pad - s(30) - band - stageTop) };
      this.logBox = { wide: false, x: x0, y: this.R.y + this.R.h + s(8), w: cw };
      this.statusT.setOrigin(0.5, 0).setAlign('center').setPosition(this.W / 2, this.R.y + this.R.h + band + s(8)).setFontSize(s(13)).setWordWrapWidth(cw, true);
    }
    const R = this.R;
    this.stampT.setPosition(R.x + R.w / 2, R.y + R.h / 2).setFontSize(s(18)).setWordWrapWidth(R.w - s(30), true);
    this.la.setFontSize(s(15));
    this.lc.setFontSize(s(14)).setWordWrapWidth(R.w - s(40), true);
    this.renderLog();
  }

  addLog(ok) {
    this.log.push({ m: this.m, ok });
    this.renderLog(true);
  }

  renderLog(fresh = false) {
    const b = this.logBox;
    if (!b) return;
    const s = (n) => this.s(n);
    this.logC.removeAll(true);
    const text = (x, y, str, size, color, weight = '700') => {
      const t = this.add.text(x, y, str, { fontFamily: 'Manrope', fontStyle: weight, fontSize: s(size), color, wordWrap: { width: b.w, useAdvancedWrap: true } });
      this.logC.add(t);
      return t;
    };
    let last = null;
    if (b.wide) {
      if (!this.log.length) return;
      let y = b.y;
      y += text(b.x, y, 'Done today, all on-device', 13, this.th.dim).height + s(8);
      this.log.forEach((l) => {
        last = text(b.x, y, `${l.ok ? '✓' : '•'} ${l.m.short}`, 15, l.ok ? ENGINE_COLORS[l.m.engine] : this.th.dim);
        y += last.height + s(6);
      });
    } else {
      const l = this.log[this.log.length - 1];
      if (!l) return;
      last = text(b.x, b.y, `✓ ${l.m.done}`, 14, ENGINE_COLORS[l.m.engine]);
    }
    if (fresh && last && !this.reduced) {
      last.setAlpha(0);
      this.tweens.add({ targets: last, alpha: 1, duration: 300, delay: 250 });
    }
  }

  // CC sits below the speech bubble and right of the lecturer, so it never covers either.
  ccBox() {
    const R = this.R;
    const s = (n) => this.s(n);
    const w = s(96);
    const h = s(60);
    const mg = this.mg;
    const top = this.bubbleY() + s(52);
    const bottom = R.y + R.h - h - s(12);
    const left = R.x + R.w * 0.3;
    const right = R.x + R.w - w - s(12);
    return { x: left + mg.rx * Math.max(0, right - left), y: top + mg.ry * Math.max(0, bottom - top), w, h };
  }

  bubbleY() { return this.R.y + this.s(24) + this.R.h * 0.34; }

  draw(dt) {
    if (!this.R) return;
    const s = (n) => this.s(n);
    const g = this.g.clear();
    const { R } = this;
    [this.la, this.lb, this.lc].forEach((t) => t.setVisible(false));
    const m = this.m;
    if (!m) return;
    this.statusT.setText(`Moment ${this.mi + 1} of ${MOMENTS.length}   Wi-Fi off   Battery ${Math.round(this.batt)}%`);
    this.clockT.setText(m.clock);
    this.placeT.setText(m.place === m.useCase ? m.place : `${m.place} (${m.useCase})`);
    this.instrT.setText(m.instruction);
    // Timer bar: turns pink in the last third.
    const b = this.bar;
    const frac = this.phase === 'play' ? this.timer / PLAY_S : this.phase === 'intro' ? 1 : 0;
    g.fillStyle(0xffffff, 0.12).fillRoundedRect(b.x, b.y, b.w, b.h, b.h / 2);
    g.fillStyle(frac < 0.33 ? 0xff5fa2 : 0x00c7fd).fillRoundedRect(b.x, b.y, Math.max(b.h, b.w * frac), b.h, b.h / 2);
    drawCard(g, this.th, R.x, R.y, R.w, R.h, s);
    this.lb.setFontSize(s(20));
    this[`draw_${m.id}`](g, s, dt);
    if (this.phase === 'intro') {
      // Big verb flash over the stage.
      g.fillStyle(0x060d2b, 0.75).fillRoundedRect(R.x, R.y, R.w, R.h, s(22));
      this.la.setVisible(false);
      this.lc.setVisible(false);
      this.lb.setVisible(true).setText(`${m.verb}!`).setColor('#00c7fd').setFontSize(s(48)).setPosition(R.x + R.w / 2, R.y + R.h / 2);
    } else if (this.phase === 'result') {
      g.fillStyle(0x060d2b, 0.6).fillRoundedRect(R.x, R.y, R.w, R.h, s(22));
      this.lb.setVisible(false);
    }
  }

  draw_lecture(g, s) {
    const { R } = this;
    // Chalkboard and lecturer.
    g.fillStyle(0x1f3b2c).fillRect(R.x + s(16), R.y + s(16), R.w - s(32), R.h * 0.34);
    g.lineStyle(s(2), 0xd9e8d0, 0.7);
    for (let i = 0; i < 3; i++) g.lineBetween(R.x + s(34), R.y + s(40) + i * s(18), R.x + R.w * (0.5 + i * 0.12), R.y + s(40) + i * s(18));
    const px = R.x + R.w * 0.16;
    const py = R.y + R.h * 0.62;
    g.fillStyle(0xffc145).fillCircle(px, py, s(18));
    g.fillStyle(0x3a4a80).fillRoundedRect(px - s(22), py + s(20), s(44), s(50), s(10));
    // Speech bubble of mumbling.
    const bw = Math.min(s(190), R.w * 0.55);
    const bx = px + s(30);
    const by = this.bubbleY();
    g.fillStyle(0xffffff, 0.92).fillRoundedRect(bx, by, bw, s(40), s(14));
    this.la.setVisible(true).setText('mumble mumble NPU…').setColor('#04102e').setPosition(bx + bw / 2, by + s(20));
    if (this.phase !== 'result') {
      const b = this.ccBox();
      const pulse = 1 + Math.sin(this.clock * 8) * 0.06;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      g.fillStyle(0x00c7fd, 0.25).fillRoundedRect(cx - (b.w / 2) * pulse * 1.15, cy - (b.h / 2) * pulse * 1.2, b.w * pulse * 1.15, b.h * pulse * 1.2, s(16));
      g.fillStyle(0x00c7fd).fillRoundedRect(b.x, b.y, b.w, b.h, s(12));
      this.lb.setVisible(true).setText('CC').setColor('#04102e').setPosition(cx, cy);
    } else {
      g.fillStyle(0x000000, 0.85).fillRect(R.x + s(16), R.y + R.h - s(64), R.w - s(32), s(48));
      this.lc.setVisible(true).setText('“NPUs run AI on very little power.”').setPosition(R.x + R.w / 2, R.y + R.h - s(40));
    }
  }

  draw_call(g, s) {
    const { R, mg } = this;
    // Messy room: posters, a shelf, a laundry pile.
    g.fillStyle(0x6b4f8a).fillRect(R.x + s(10), R.y + s(10), R.w - s(20), R.h - s(20));
    g.fillStyle(0xffc145).fillRect(R.x + R.w * 0.08, R.y + R.h * 0.12, R.w * 0.18, R.h * 0.26);
    g.fillStyle(0xff5fa2).fillRect(R.x + R.w * 0.72, R.y + R.h * 0.1, R.w * 0.16, R.h * 0.22);
    g.fillStyle(0x2ef2c8).fillRect(R.x + R.w * 0.76, R.y + R.h * 0.4, R.w * 0.08, R.h * 0.3);
    [[0.12, 0.85, 26], [0.2, 0.82, 20], [0.85, 0.86, 24], [0.78, 0.88, 18]].forEach(([fx, fy, r]) => g.fillStyle(0xe5e7ef).fillCircle(R.x + R.w * fx, R.y + R.h * fy, s(r)));
    // Blur: a frosted wash over the room that thickens as you swipe.
    if (mg.blur > 0) g.fillStyle(0x9fb0d9, 0.92 * mg.blur).fillRect(R.x + s(10), R.y + s(10), R.w - s(20), R.h - s(20));
    // You, always sharp.
    const cx = R.x + R.w / 2;
    const cy = R.y + R.h * 0.5;
    g.fillStyle(0x2b2b5a).fillRoundedRect(cx - s(60), cy + s(36), s(120), R.h * 0.5 - s(46), s(30));
    g.fillStyle(0xffc145).fillCircle(cx, cy, s(40));
    g.fillStyle(0x04102e).fillCircle(cx - s(14), cy - s(6), s(4)).fillCircle(cx + s(14), cy - s(6), s(4));
    if (this.phase === 'play' && mg.blur < 0.3) {
      this.la.setVisible(true).setText('<<  swipe across  >>').setColor('#ffffff').setPosition(cx, R.y + s(34));
    }
  }

  draw_reel(g, s) {
    const { R, mg } = this;
    const cut = mg.cut;
    // Busy city photo behind you; becomes a clean cut-out backdrop.
    g.fillStyle(0x7fc8ff).fillRect(R.x + s(10), R.y + s(10), R.w - s(20), R.h * 0.55);
    g.fillStyle(0xffe066).fillCircle(R.x + R.w * 0.82, R.y + R.h * 0.2, s(26));
    [0.05, 0.22, 0.6, 0.78].forEach((f, i) => g.fillStyle(i % 2 ? 0x3a4a80 : 0x56628f).fillRect(R.x + R.w * f, R.y + R.h * (0.25 + i * 0.05), R.w * 0.14, R.h * 0.75 - R.h * (0.25 + i * 0.05) + R.h * 0.2));
    g.fillStyle(0x4a7a3a).fillRect(R.x + s(10), R.y + R.h * 0.8, R.w - s(20), R.h * 0.2 - s(10));
    if (cut > 0) {
      const sq = s(18);
      const x1 = R.x + R.w - s(10);
      const y1 = R.y + R.h - s(10);
      for (let x = R.x + s(10); x < x1; x += sq) {
        for (let y = R.y + s(10); y < y1; y += sq) {
          const odd = (Math.round((x - R.x) / sq) + Math.round((y - R.y) / sq)) % 2;
          g.fillStyle(odd ? 0xffffff : 0xdfe5ee, cut).fillRect(x, y, Math.min(sq, x1 - x), Math.min(sq, y1 - y));
        }
      }
    }
    // You.
    const px = R.x + mg.px * R.w;
    const base = R.y + R.h - s(10);
    g.fillStyle(0xff5fa2).fillRoundedRect(px - s(34), base - R.h * 0.4, s(68), R.h * 0.4, s(24));
    g.fillStyle(0xffc145).fillCircle(px, base - R.h * 0.4 - s(22), s(28));
    if (this.phase === 'play') {
      g.lineStyle(s(3), 0x00c7fd, 0.85).strokeCircle(px, base - R.h * 0.32, s(58 + Math.sin(this.clock * 6) * 4));
    }
  }

  draw_game(g, s, dt) {
    const { R, mg } = this;
    const fps = 22 + 68 * mg.boost;
    // Choppy at low FPS: the road only moves in whole game frames.
    if (this.phase !== 'intro') {
      mg.acc += dt;
      const step = 1 / fps;
      while (mg.acc >= step) { mg.scroll += s(520) * step; mg.acc -= step; }
    }
    g.fillStyle(0x0b1030).fillRect(R.x + s(10), R.y + s(10), R.w - s(20), R.h - s(20));
    const cx = R.x + R.w / 2;
    const top = R.y + R.h * 0.2;
    const bot = R.y + R.h - s(10);
    g.fillStyle(0x2a2f55).fillTriangle(cx - s(16), top, cx + s(16), top, cx + R.w * 0.42, bot);
    g.fillTriangle(cx - s(16), top, cx - R.w * 0.42, bot, cx + R.w * 0.42, bot);
    const seg = s(70);
    for (let d = seg - (mg.scroll % seg); d < bot - top; d += seg) {
      const t = d / (bot - top);
      const dashH = Math.min(s(14) + t * s(20), bot - (top + d)); // never past the stage edge
      if (dashH > 0) g.fillStyle(0xffc145).fillRect(cx - s(3) - t * s(4), top + d, s(6) + t * s(8), dashH);
    }
    g.fillStyle(0xff5fa2).fillRoundedRect(cx - s(30), bot - s(70), s(60), s(50), s(10));
    this.la.setVisible(true).setText(`${Math.round(fps)} FPS`).setColor(fps > 60 ? '#2ef2c8' : '#ff8a8a').setPosition(R.x + s(64), R.y + s(32));
    // Boost button that fills while held.
    const bw = Math.min(R.w * 0.6, s(260));
    const bh = s(54);
    const bx = cx - bw / 2;
    const by = R.y + R.h * 0.42;
    g.fillStyle(0x00c7fd, 0.25).fillRoundedRect(bx, by, bw, bh, s(16));
    g.fillStyle(0x00c7fd).fillRoundedRect(bx, by, Math.max(s(16), bw * mg.boost), bh, s(16));
    this.lb.setVisible(true).setText(mg.boost >= 1 ? 'XeSS ON' : 'HOLD BOOST').setColor('#ffffff').setPosition(cx, by + bh / 2);
  }

  draw_notes(g, s) {
    const { R, mg } = this;
    g.fillStyle(0x0a0f24).fillRect(R.x + s(10), R.y + s(10), R.w - s(20), R.h - s(20));
    // A small laptop with true proportions: 16:10 lid on a wider base, sized to the stage.
    const lw = Math.min(R.w * 0.62, (R.h * 0.55) * 1.6, s(320));
    const lh = lw / 1.6;
    const cx = R.x + R.w / 2;
    const lx = cx - lw / 2;
    const ly = R.y + (R.h - lh * 1.2) / 2 - s(6);
    const bz = Math.max(s(5), lw * 0.03);
    g.fillStyle(0x2b2f55).fillRoundedRect(lx, ly, lw, lh, s(8));
    g.fillStyle(0xf2f6ff).fillRect(lx + bz, ly + bz, lw - bz * 2, lh - bz * 2);
    const lineH = Math.max(s(9), (lh - bz * 2) / 9);
    const maxLines = Math.floor((lh - bz * 2 - lineH) / lineH);
    const lines = Math.min(maxLines, Math.round((mg.taps / MASH_NEED) * maxLines));
    for (let i = 0; i < lines; i++) {
      g.fillStyle(i === 0 ? 0x00c7fd : 0x9fb0d9).fillRect(lx + bz * 2.2, ly + bz + lineH * (i + 0.6), (lw - bz * 4.4) * (i === 0 ? 0.5 : 0.7 + (i % 3) * 0.1), lineH * 0.45);
    }
    const bw = lw * 1.14;
    const bh = lh * 0.1;
    g.fillStyle(0x3a4a80).fillPoints([
      { x: cx - lw / 2, y: ly + lh }, { x: cx + lw / 2, y: ly + lh },
      { x: cx + bw / 2, y: ly + lh + bh }, { x: cx - bw / 2, y: ly + lh + bh },
    ], true);
    this.la.setVisible(true).setText('Wi-Fi off, AI still on').setColor('#2ef2c8').setPosition(cx, R.y + R.h - s(24));
    if (this.phase === 'play') this.lc.setVisible(true).setText(`${mg.taps}/${MASH_NEED}`).setPosition(R.x + R.w - s(40), R.y + s(28));
  }

  finish() {
    if (this.done) return;
    this.phase = 'done';
    this.done = true;
    const sec = this.secs();
    this.record('L4', sec);
    this.hudT.setText(`${sec}s`);
    sfx('win');
    this.party();
    this.time.delayedCall(500, () => this.ask({
      kicker: `${this.wins}/${MOMENTS.length} moments nailed in ${sec}s`,
      title: 'Ekdum instant.',
      body: `${this.log.map((l) => `✓ ${l.m.short}`).join('\n')}\n\nA whole day, all on-device, battery still at ${Math.round(this.batt)}%.`,
      buttons: [{ label: 'See the upgrade', onClick: () => this.go('Versus') }],
    }));
  }
}
