import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES, ENGINE_COLORS, hex } from '../theme.js';
import { drawCard, confetti } from '../ui.js';
import { music, sfx } from '../audio.js';
import { TASKS, ENGINES } from '../data.js';

// AI Rush: tasks fall down three lanes (CPU, GPU, NPU). Drag a card sideways, tap a lane,
// or press 1/2/3 to steer the lowest card before it lands. A cheap cloud laptop races you
// across the top and never gets past "Uploading…".
// Fall time in seconds for a card to cross the lanes, so the pace is the same on every
// screen size. Starts at 4 s and speeds up after every landed task.
const FALL_START_S = 4;
const FALL_STEP_S = 0.18;
const FALL_MIN_S = 2.2;
const RIVAL_PER_S = 2.6;
const RIVAL_CAP = 85;

export default class Level4AIPC extends Base {
  constructor() { super('L4'); }

  build() {
    this.th = THEMES.ai;
    music('ai');
    Object.assign(this, { running: false, cards: [], spawned: 0, landed: 0, correct: 0, streak: 0, best: 0, batt: 100, rival: 0, stall: 0, clock: 0 });
    this.tasks = Phaser.Utils.Array.Shuffle([...TASKS]);
    this.makeHud('Level 4 of 4   2026');
    this.g = this.add.graphics();
    const st = (color, weight = '700') => ({ fontFamily: 'Manrope', fontStyle: weight, color });
    this.youT = this.add.text(0, 0, '', st(this.th.ink));
    this.rivalT = this.add.text(0, 0, '', st(this.th.dim, '500'));
    this.hintT = this.add.text(0, 0, '', { ...st('#ffd9e8'), align: 'center', stroke: '#060d2b', strokeThickness: 6 }).setOrigin(0.5, 1).setDepth(20);
    this.docks = ENGINES.map((e, i) => this.makeDock(e, i));
    this.ask({
      kicker: 'Level 4 of 4',
      title: '2026: AI Rush',
      body: 'Intel Core Ultra has three AI engines: the CPU for quick jobs, the GPU for graphics-heavy AI, and the NPU, a mini AI brain that sips battery. Tasks are falling: drag or tap each into the right engine before it lands. A cheap cloud laptop is racing you.',
      buttons: [{ label: 'Next', onClick: () => this.askMulti('L4', 'Quick question', () => this.start()) }],
    });
  }

  start() {
    this.running = true;
    this.t0 = this.time.now;
    this.spawn();
    this.say('Drag the card, or tap the right engine below', '#ffffff');
  }

  makeDock(e, i) {
    const d = this.add.container(0, 0).setDepth(5);
    d.engine = e;
    d.idx = i;
    d.g = this.add.graphics();
    const col = ENGINE_COLORS[e.id];
    d.name = this.add.text(0, 0, e.id, { fontFamily: 'Unbounded', fontStyle: '800', color: col }).setOrigin(0.5, 0);
    d.desc = this.add.text(0, 0, e.desc, { fontFamily: 'Manrope', fontStyle: '700', color: this.th.ink, align: 'center' }).setOrigin(0.5, 0);
    d.tops = this.add.text(0, 0, e.tops, { fontFamily: 'Manrope', fontStyle: '500', color: this.th.dim, align: 'center' }).setOrigin(0.5, 1);
    d.add([d.g, d.name, d.desc, d.tops]);
    d.setSize(10, 10).setInteractive({ useHandCursor: true });
    d.on('pointerup', () => this.steer(this.target(), i));
    return d;
  }

  drawDock(d, lit = 0, bad = false) {
    const s = (n) => this.s(n);
    const { bw: w, bh: h } = d;
    const col = bad ? 0xe5383b : hex(ENGINE_COLORS[d.engine.id]);
    d.g.clear();
    d.g.fillStyle(col, 0.12 + lit * 0.35).fillRoundedRect(-w / 2, -h / 2, w, h, s(18));
    d.g.lineStyle(s(2), col, 0.6 + lit * 0.4).strokeRoundedRect(-w / 2, -h / 2, w, h, s(18));
  }

  laneX(i) { return this.lanes.x0 + this.lanes.w / 2 + i * (this.lanes.w + this.lanes.gap); }

  // The card the player is steering: the lowest one still falling.
  target() {
    return this.cards.reduce((a, c) => (!a || c.y > a.y ? c : a), null);
  }

  steer(c, lane) {
    if (!c || !this.running || lane < 0 || lane > 2) return;
    c.lane = lane;
    sfx('key');
    this.tweens.add({ targets: c, x: this.laneX(lane), duration: 110, ease: 'Quad.Out' });
    this.drawTaskCard(c);
  }

  onKey(e) {
    const t = this.target();
    const i = ['1', '2', '3'].indexOf(e.key);
    if (i >= 0) this.steer(t, i);
    if (t && e.key === 'ArrowLeft') this.steer(t, t.lane - 1);
    if (t && e.key === 'ArrowRight') this.steer(t, t.lane + 1);
  }

  spawn() {
    const task = this.tasks[this.spawned++];
    if (!task) return;
    const c = this.add.container(0, 0).setDepth(10);
    c.task = task;
    c.lane = Phaser.Math.Between(0, 2);
    c.g = this.add.graphics();
    c.t = this.add.text(0, 0, task.text, { fontFamily: 'Manrope', fontStyle: '700', color: this.th.ink, align: 'center', wordWrap: { width: 4000, useAdvancedWrap: true } }).setOrigin(0.5);
    c.add([c.g, c.t]);
    c.setSize(10, 10).setInteractive({ draggable: true, useHandCursor: true });
    c.on('drag', (_, x) => { c.x = Phaser.Math.Clamp(x, this.laneX(0), this.laneX(2)); });
    c.on('dragend', () => {
      const lane = [0, 1, 2].reduce((a, i) => (Math.abs(this.laneX(i) - c.x) < Math.abs(this.laneX(a) - c.x) ? i : a), 0);
      this.steer(c, lane);
    });
    this.cards.push(c);
    this.sizeTaskCard(c);
    c.setPosition(this.laneX(c.lane), this.playTop + c.ch / 2);
    c.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 200, ease: 'Back.Out' });
  }

  sizeTaskCard(c) {
    const s = (n) => this.s(n);
    const w = this.lanes.w - s(8);
    c.t.setFontSize(s(this.lanes.w < s(150) ? 13 : 15)).setWordWrapWidth(w - s(16), true);
    c.cw = w;
    c.ch = Math.max(s(64), c.t.height + s(24));
    c.setSize(w, c.ch);
    c.input.hitArea.setTo(0, 0, w, c.ch);
    this.drawTaskCard(c);
  }

  drawTaskCard(c) {
    const s = (n) => this.s(n);
    const col = hex(ENGINE_COLORS[ENGINES[c.lane].id]);
    c.g.clear();
    drawCard(c.g, this.th, -c.cw / 2, -c.ch / 2, c.cw, c.ch, s);
    c.g.lineStyle(s(2.5), col, 1).strokeRoundedRect(-c.cw / 2, -c.ch / 2, c.cw, c.ch, s(22));
  }

  land(c) {
    this.cards = this.cards.filter((x) => x !== c);
    this.landed++;
    const d = this.docks[c.lane];
    const engine = ENGINES[c.lane].id;
    c.disableInteractive();
    this.tweens.add({ targets: c, y: d.y, scale: 0.3, alpha: 0, duration: 220, ease: 'Quad.In', onComplete: () => c.destroy() });
    if (engine === c.task.engine) {
      this.correct++;
      this.streak++;
      this.best = Math.max(this.best, this.streak);
      this.batt -= 0.3;
      sfx('ok');
      confetti(this, d.x, d.y - d.bh / 2, [ENGINE_COLORS[engine], '#ffffff'], 16 + this.streak * 4, 0.7);
      this.drawDock(d, 1);
      this.tweens.add({ targets: d, scale: { from: 1.08, to: 1 }, duration: 260, ease: 'Back.Out' });
      this.say(this.streak > 1 ? `Done on-device by the ${engine}. Streak x${this.streak}!` : `Done on-device by the ${engine}`, ENGINE_COLORS[engine]);
    } else {
      this.streak = 0;
      sfx('no');
      this.cameras.main.shake(140, 0.005);
      this.drawDock(d, 0.5, true);
      this.say(`Wrong engine. ${c.task.why}`, '#ffd9e8');
    }
    this.time.delayedCall(320, () => d.active && this.drawDock(d));
    if (this.landed >= this.tasks.length) this.time.delayedCall(350, () => this.finish());
  }

  say(text, color) {
    this.hintT.setText(text).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.hintT);
    this.tweens.add({ targets: this.hintT, alpha: 0, delay: 2200, duration: 400 });
  }

  update(_, dtMs) {
    this.tickHud();
    const dt = Math.min(dtMs, 50) / 1000;
    if (this.running) {
      this.clock += dt;
      // The rival keeps stalling on its connection and never finishes.
      this.stall -= dt;
      if (this.stall < -2.4) this.stall = 1.2;
      if (this.stall <= 0) this.rival = Math.min(RIVAL_CAP, this.rival + RIVAL_PER_S * dt);
      const fallS = Math.max(FALL_MIN_S, FALL_START_S - FALL_STEP_S * this.landed);
      const speed = (this.dockTop - this.playTop) / fallS;
      for (const c of [...this.cards]) {
        c.y += speed * dt;
        if (c.y + c.ch / 2 >= this.dockTop) this.land(c);
      }
      // Next card once the last one is halfway down (at most two falling at once).
      const last = this.cards[this.cards.length - 1];
      const half = this.playTop + (this.dockTop - this.playTop) * 0.58;
      if (this.spawned < this.tasks.length && (!last || (last.y > half && this.cards.length < 2))) this.spawn();
    }
    this.draw();
  }

  layout() {
    const s = (n) => this.s(n);
    const pad = s(18);
    const y = this.layoutHud();
    const tight = this.H / this.k < 470; // short landscape phones
    this.race = { y, h: s(30) };
    this.youT.setPosition(pad, y).setFontSize(s(13));
    this.rivalT.setPosition(pad, y + this.race.h + s(6)).setFontSize(s(13));
    const gap = s(10);
    const laneW = Math.min((this.W - pad * 2 - gap * 2) / 3, s(220));
    this.lanes = { x0: (this.W - (laneW * 3 + gap * 2)) / 2, w: laneW, gap };
    const dockH = s(tight ? 86 : 124);
    this.dockTop = this.H - pad - dockH;
    this.playTop = y + this.race.h * 2 + s(22);
    this.hintT.setPosition(this.W / 2, this.dockTop - s(10)).setFontSize(s(14)).setWordWrapWidth(Math.min(this.W - pad * 2, s(520)), true);
    this.docks.forEach((d, i) => {
      d.bw = laneW;
      d.bh = dockH;
      d.setPosition(this.laneX(i), this.dockTop + dockH / 2);
      d.setSize(laneW, dockH);
      d.input.hitArea.setTo(0, 0, laneW, dockH);
      d.name.setFontSize(s(tight ? 17 : 21)).setY(-dockH / 2 + s(tight ? 8 : 14));
      d.desc.setFontSize(s(12)).setWordWrapWidth(laneW - s(14), true).setY(-dockH / 2 + s(tight ? 32 : 46)).setVisible(!tight);
      d.tops.setFontSize(s(11)).setWordWrapWidth(laneW - s(10), true).setY(dockH / 2 - s(10));
      this.drawDock(d);
    });
    for (const c of this.cards) {
      this.sizeTaskCard(c);
      c.setPosition(this.laneX(c.lane), Phaser.Math.Clamp(c.y, this.playTop + c.ch / 2, this.dockTop - c.ch / 2));
    }
  }

  draw() {
    if (!this.lanes) return;
    const s = (n) => this.s(n);
    const g = this.g.clear();
    const pad = s(18);
    // Lanes, tinted by engine.
    ENGINES.forEach((e, i) => {
      const x = this.laneX(i) - this.lanes.w / 2;
      g.fillStyle(hex(ENGINE_COLORS[e.id]), 0.06).fillRect(x, this.playTop, this.lanes.w, this.dockTop - this.playTop);
    });
    // Race bars: you vs the cheap cloud laptop.
    const total = this.tasks.length;
    const bw = this.W - pad * 2;
    const r = this.race;
    const by1 = r.y + s(19);
    const by2 = r.y + r.h + s(25);
    g.fillStyle(0xffffff, 0.12).fillRoundedRect(pad, by1, bw, s(6), s(3)).fillRoundedRect(pad, by2, bw, s(6), s(3));
    g.fillStyle(0x00c7fd).fillRoundedRect(pad, by1, Math.max(s(6), bw * (this.landed / total)), s(6), s(3));
    g.fillStyle(0x8a94b8).fillRoundedRect(pad, by2, Math.max(s(6), bw * (this.rival / 100)), s(6), s(3));
    this.youT.setText(`You, Intel AI PC: ${this.landed}/${total} done, offline, battery ${Math.round(this.batt)}%`);
    const status = this.rival >= RIVAL_CAP ? 'still uploading…' : this.stall > 0 ? 'buffering…' : 'uploading to the cloud…';
    this.rivalT.setText(`Cheap cloud laptop: ${Math.floor(this.rival)}%, ${status}`);
  }

  finish() {
    if (this.done) return;
    this.running = false;
    this.done = true;
    const sec = this.secs();
    this.record('L4', sec);
    this.hudT.setText(`${sec}s`);
    sfx('win');
    this.party();
    const rival = Math.floor(this.rival);
    this.time.delayedCall(500, () => this.ask({
      kicker: `${this.correct}/${this.tasks.length} right in ${sec}s, best streak x${this.best}`,
      title: 'Ekdum instant.',
      body: `All offline, battery at ${Math.round(this.batt)}%. The cheap cloud laptop? Stuck at ${rival}%, still uploading your stuff to a server.`,
      buttons: [{ label: 'See the upgrade', onClick: () => this.go('Versus') }],
    }));
  }
}
