import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES } from '../theme.js';
import { music, sfx } from '../audio.js';

// Battery Dash: a 2003 laptop runs to class. Jump the clutter, grab plug points,
// don't let the battery hit zero.
const PROGRESS_PER_S = 5.0; // ~20 s to reach class
const DRAIN_PER_S = 6;
const PLUG_CHARGE = 30;
const HIT_COST = 15;
const GRAVITY = 2600; // design px / s²
const JUMP_V = 900;
const OBSTACLES = [
  { kind: 'cup', w: 26, h: 34 },
  { kind: 'bag', w: 44, h: 40 },
  { kind: 'books', w: 36, h: 54 },
];

export default class Level2Battery extends Base {
  constructor() { super('L2'); }

  build() {
    this.th = THEMES.y2k;
    music('y2k');
    Object.assign(this, {
      prog: 0, batt: 70, running: false, dead: false, vy: 0, py: 0, invuln: 0,
      items: [], gapLeft: 0, sincePlug: 0, plugs: 0, hits: 0, scroll: 0, clock: 0, jumped: false,
    });
    this.makeHud('Level 2 of 4   2003');
    this.world = this.add.graphics();
    const st = (color, size = 16) => ({ fontFamily: this.th.body, fontStyle: '700', color, fontSize: this.s(size) });
    this.progT = this.add.text(0, 0, 'To class', st('#ffffff', 14));
    this.battT = this.add.text(0, 0, '', st('#ffffff', 14)).setOrigin(1, 0);
    this.hint = this.add.text(0, 0, 'Tap anywhere or press Space to jump', { ...st('#ffffff', 18), align: 'center', stroke: '#0b3d40', strokeThickness: this.s(5) }).setOrigin(0.5).setAlpha(0);
    this.status = this.add.text(0, 0, '', { ...st('#ffffff', 26), fontFamily: 'Silkscreen', align: 'center' }).setOrigin(0.5).setDepth(20);
    this.input.on('pointerdown', () => this.jump());
    this.askMulti('L2', 'Level 2 of 4', () => this.start(), {
      title: '2003: Battery Dash',
      body: 'Batteries last 2 to 4 hours. Tap to jump the clutter, grab plug points, reach class.',
    });
  }

  start() {
    this.running = true;
    this.t0 = this.time.now;
    this.gapLeft = this.s(260);
    this.tweens.add({ targets: this.hint, alpha: 1, duration: 300 });
  }

  onKey(e) {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.jump();
  }

  jump() {
    if (!this.running || this.dead || this.overlay || this.py < 0) return;
    this.vy = -this.s(JUMP_V);
    sfx('pop');
    if (!this.jumped) {
      this.jumped = true;
      this.tweens.add({ targets: this.hint, alpha: 0, duration: 400 });
    }
  }

  spawn() {
    const s = (n) => this.s(n);
    const plug = this.sincePlug >= 2 || Math.random() < 0.28;
    if (plug) {
      this.sincePlug = 0;
      const air = Math.random() < 0.5;
      this.items.push({ kind: 'plug', x: this.W + s(40), y: this.groundY - (air ? s(118) : s(26)) });
    } else {
      this.sincePlug++;
      const o = Phaser.Utils.Array.GetRandom(OBSTACLES);
      this.items.push({ ...o, x: this.W + s(40) });
    }
    this.gapLeft = s(Phaser.Math.Between(250, 430));
  }

  float(text, color, x, y) {
    const t = this.add.text(x, y, text, { fontFamily: this.th.body, fontStyle: '700', fontSize: this.s(20), color }).setOrigin(0.5).setDepth(15);
    this.tweens.add({ targets: t, y: y - this.s(60), alpha: 0, duration: 800, ease: 'Quad.Out', onComplete: () => t.destroy() });
  }

  die() {
    this.dead = true;
    this.batt = 0;
    sfx('fail');
    this.status.setText('Arre! Battery dead.\nRebooting…');
    this.cameras.main.shake(250, 0.01);
    this.time.delayedCall(1800, () => {
      this.prog = Math.max(0, this.prog - 12);
      this.batt = 45;
      this.dead = false;
      this.status.setText('');
    });
  }

  update(_, dtMs) {
    this.tickHud();
    const dt = Math.min(dtMs, 50) / 1000;
    this.clock += dt;
    if (this.running && !this.dead) {
      const s = (n) => this.s(n);
      const speed = s(330 + this.prog * 1.4);
      const dx = speed * dt;
      this.scroll += dx;
      this.prog += PROGRESS_PER_S * dt;
      this.batt -= DRAIN_PER_S * dt;
      this.invuln = Math.max(0, this.invuln - dt);
      // Jump physics.
      this.vy += s(GRAVITY) * dt;
      this.py = Math.min(0, this.py + this.vy * dt);
      if (this.py === 0) this.vy = 0;
      // Scroll and spawn.
      this.gapLeft -= dx;
      if (this.gapLeft <= 0) this.spawn();
      for (const it of this.items) it.x -= dx;
      this.items = this.items.filter((it) => it.x > -s(80) && !it.gone);
      // Collisions with the hero's box.
      const hx = this.heroX;
      const feet = this.groundY + this.py;
      const hero = { l: hx - s(20), r: hx + s(20), t: feet - s(56), b: feet };
      for (const it of this.items) {
        if (it.kind === 'plug') {
          if (Math.abs(it.x - hx) < s(36) && it.y > hero.t - s(16) && it.y < hero.b + s(8)) {
            it.gone = true;
            this.batt = Math.min(100, this.batt + PLUG_CHARGE);
            this.plugs++;
            sfx('charge');
            this.float(`+${PLUG_CHARGE}%`, '#ffd23f', it.x, it.y - s(30));
          }
        } else if (!it.hit && !this.invuln) {
          const l = it.x - s(it.w) / 2 + s(4);
          const r = it.x + s(it.w) / 2 - s(4);
          if (hero.r > l && hero.l < r && hero.b > this.groundY - s(it.h) + s(4)) {
            it.hit = true;
            this.hits++;
            this.invuln = 1;
            this.batt -= HIT_COST;
            sfx('no');
            this.cameras.main.shake(120, 0.006);
            this.float(`-${HIT_COST}%`, '#ff8a8a', hx, hero.t - s(10));
          }
        }
      }
      if (this.batt <= 0) this.die();
      else if (this.prog >= 100) { this.prog = 100; this.finish(); }
    }
    this.draw();
  }

  layout() {
    const s = (n) => this.s(n);
    const pad = s(18);
    const y = this.layoutHud();
    this.barY = y + s(4);
    this.progT.setPosition(pad, this.barY).setFontSize(s(14));
    this.battT.setPosition(this.W - pad, this.barY).setFontSize(s(14));
    // Tall phones: lift the floor so the action sits mid-screen.
    this.groundY = this.portrait ? Math.min(this.H - s(102), this.H * 0.64) : this.H - s(102);
    this.heroX = Math.max(s(70), this.W * 0.2);
    this.hint.setPosition(this.W / 2, Math.max(this.barY + s(70), this.groundY - s(290))).setFontSize(s(18)).setWordWrapWidth(this.W - pad * 2);
    this.status.setPosition(this.W / 2, (this.barY + this.groundY) / 2).setFontSize(s(26));
  }

  draw() {
    if (!this.groundY) return;
    const s = (n) => this.s(n);
    const g = this.world.clear();
    const { W } = this;
    const pad = s(18);
    // Parallax windows on the café wall.
    const winW = s(120);
    const step = s(230);
    const off = (this.scroll * 0.3) % step;
    for (let x = -off; x < W + step; x += step) {
      g.fillStyle(0x9fd8dc, 0.35).fillRect(x, this.groundY - s(250), winW, s(130));
      g.lineStyle(s(4), 0x1f5f64, 0.6).strokeRect(x, this.groundY - s(250), winW, s(130));
      g.lineBetween(x + winW / 2, this.groundY - s(250), x + winW / 2, this.groundY - s(120));
    }
    // Wooden floor with moving planks.
    const floorH = this.H - s(38) - this.groundY;
    g.fillStyle(0x8b6b4a).fillRect(0, this.groundY, W, floorH);
    g.fillStyle(0x6e5238);
    const plank = s(70);
    for (let x = -(this.scroll % plank); x < W; x += plank) g.fillRect(x, this.groundY + s(10), s(3), floorH - s(10));
    g.fillStyle(0x3a2a1c).fillRect(0, this.groundY, W, s(4));
    // Items.
    for (const it of this.items) {
      if (it.kind === 'plug') this.drawPlug(g, it.x, it.y);
      else this.drawObstacle(g, it);
    }
    // Hero laptop (blinks while invulnerable).
    if (!(this.invuln > 0 && Math.floor(this.clock * 14) % 2)) this.drawHero(g);
    // Progress + battery bars.
    const barW = (W - pad * 2 - s(16)) / 2;
    const by = this.barY + s(22);
    g.fillStyle(0xffffff).fillRect(pad, by, barW, s(14));
    g.fillStyle(0x1036a8).fillRect(pad + s(2), by + s(2), (barW - s(4)) * (this.prog / 100), s(10));
    const bx = W - pad - barW;
    const col = this.batt > 40 ? 0x31c45a : this.batt > 20 ? 0xffb020 : 0xe5383b;
    g.fillStyle(0x111111).fillRect(bx, by, barW, s(14));
    g.fillStyle(col).fillRect(bx + s(2), by + s(2), (barW - s(4)) * Math.max(0, this.batt) / 100, s(10));
    this.progT.setText(`To class ${Math.floor(this.prog)}%`);
    this.battT.setText(`Battery ${Math.max(0, Math.ceil(this.batt))}%`);
  }

  drawHero(g) {
    const s = (n) => this.s(n);
    const x = this.heroX;
    const feet = this.groundY + this.py;
    const run = this.running && !this.dead && this.py === 0;
    const phase = Math.sin(this.scroll / s(18));
    const bob = run ? Math.abs(phase) * s(3) : 0;
    const base = feet - s(14) - bob;
    // Legs.
    g.lineStyle(s(4), 0x111111);
    if (run) {
      g.lineBetween(x - s(8), base, x - s(8) + phase * s(9), feet);
      g.lineBetween(x + s(8), base, x + s(8) - phase * s(9), feet);
    } else {
      g.lineBetween(x - s(8), base, x - s(12), base + s(9));
      g.lineBetween(x + s(8), base, x + s(12), base + s(9));
    }
    // Keyboard base and screen.
    g.fillStyle(0xc9c6bd).fillRect(x - s(28), base - s(8), s(56), s(8));
    g.lineStyle(s(2), 0x3a3a3a).strokeRect(x - s(28), base - s(8), s(56), s(8));
    g.fillStyle(0x2b2b2b).fillRect(x - s(24), base - s(46), s(48), s(38));
    g.fillStyle(this.dead ? 0x111111 : 0x1036a8).fillRect(x - s(20), base - s(42), s(40), s(30));
    if (this.dead) return;
    // Face: worried when the battery is low.
    g.fillStyle(0xffffff).fillRect(x - s(10), base - s(34), s(5), s(7)).fillRect(x + s(5), base - s(34), s(5), s(7));
    g.lineStyle(s(2), 0xffffff);
    const low = this.batt < 25;
    g.beginPath();
    g.arc(x, base - (low ? s(16) : s(24)), s(7), low ? Math.PI * 1.15 : Math.PI * 0.15, low ? Math.PI * 1.85 : Math.PI * 0.85);
    g.strokePath();
  }

  drawPlug(g, x, y) {
    const s = (n) => this.s(n);
    const pulse = 1 + Math.sin(this.clock * 8) * 0.08;
    const r = s(20) * pulse;
    g.fillStyle(0xffd23f, 0.3).fillCircle(x, y, r * 1.5);
    g.fillStyle(0xffd23f).fillCircle(x, y, r);
    g.lineStyle(s(2), 0x111111).strokeCircle(x, y, r);
    g.fillStyle(0x111111).fillRect(x - s(8), y - s(5), s(16), s(11));
    g.fillRect(x - s(6), y - s(12), s(3), s(7)).fillRect(x + s(3), y - s(12), s(3), s(7));
    g.fillRect(x - s(1.5), y + s(6), s(3), s(8));
  }

  drawObstacle(g, it) {
    const s = (n) => this.s(n);
    const w = s(it.w);
    const h = s(it.h);
    const x = it.x - w / 2;
    const y = this.groundY - h;
    if (it.kind === 'cup') {
      g.fillStyle(0xffffff).fillRect(x, y, w, h);
      g.fillStyle(0x6e3b1f).fillRect(x + s(3), y + s(3), w - s(6), s(5));
      g.lineStyle(s(3), 0xffffff).strokeCircle(x + w + s(5), y + h / 2, s(6));
      g.lineStyle(s(2), 0x3a3a3a).strokeRect(x, y, w, h);
    } else if (it.kind === 'bag') {
      g.fillStyle(0xe5383b).fillRoundedRect(x, y, w, h, s(8));
      g.fillStyle(0xa8222a).fillRect(x + s(8), y + s(14), w - s(16), s(12));
      g.lineStyle(s(3), 0xa8222a).strokeRoundedRect(x + w * 0.3, y - s(8), w * 0.4, s(14), s(5));
    } else {
      const cols = [0x1036a8, 0x31c45a, 0xffb020];
      const bh = h / 3;
      cols.forEach((c, i) => g.fillStyle(c).fillRect(x + (i % 2) * s(4), y + i * bh, w - s(4), bh - s(2)));
    }
  }

  finish() {
    this.running = false;
    this.done = true;
    const sec = this.secs();
    this.record('L2', sec);
    this.hudT.setText(`${sec}s`);
    sfx('win');
    this.party();
    this.time.delayedCall(600, () => this.ask({
      kicker: `Made it in ${sec}s with ${this.plugs} plug ${this.plugs === 1 ? 'point' : 'points'}`,
      title: 'Plug point life, every day',
      body: 'Wi-Fi set laptops free, but you lived next to the charger.',
      buttons: [{ label: 'Jump to 2015', onClick: () => this.warp('L3', THEMES.cloud) }],
    }));
  }
}
