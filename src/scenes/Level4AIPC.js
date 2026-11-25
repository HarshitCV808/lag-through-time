import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES, ENGINE_COLORS, hex } from '../theme.js';
import { drawCard } from '../ui.js';
import { music, sfx } from '../audio.js';
import { L4_CHOICES, TASKS, ENGINES } from '../data.js';

export default class Level4AIPC extends Base {
  constructor() { super('L4'); }

  build() {
    this.th = THEMES.ai;
    music('ai');
    Object.assign(this, { ti: 0, batt: 100, running: false, docks: [], card: null });
    this.tasks = Phaser.Utils.Array.Shuffle([...TASKS]);
    this.makeHud('Level 4 of 4   2026');
    this.statusT = this.add.text(0, 0, 'Offline   Battery 100%', { fontFamily: 'Manrope', fontStyle: '700', color: this.th.dim });
    this.countT = this.add.text(0, 0, '', { fontFamily: 'Manrope', fontStyle: '700', color: this.th.dim }).setOrigin(0.5, 0);
    this.hintT = this.add.text(0, 0, '', { fontFamily: 'Manrope', fontStyle: '700', color: '#ffd9e8', align: 'center' }).setOrigin(0.5, 0);
    this.docks = ENGINES.map((e, i) => this.makeDock(e, i));
    this.ask({
      kicker: 'Level 4 of 4',
      title: '2026: the Intel AI PC',
      body: 'Intel Core Ultra has three AI engines built in: CPU, GPU and NPU. Send each task to the right engine. No internet needed.',
      buttons: [{ label: 'Wake it up', onClick: () => this.choose() }],
    });
  }

  choose() {
    this.ask({
      kicker: 'Pick one',
      title: 'What would you use AI for most?',
      buttons: L4_CHOICES.map((c) => ({ label: c.label, onClick: () => { this.pick(c.persona); this.start(); } })),
    });
  }

  start() {
    this.running = true;
    this.t0 = this.time.now;
    this.nextCard();
  }

  makeDock(e, i) {
    const d = this.add.container(0, 0);
    d.engine = e;
    d.g = this.add.graphics();
    const col = ENGINE_COLORS[e.id];
    d.name = this.add.text(0, 0, e.id, { fontFamily: 'Unbounded', fontStyle: '800', color: col }).setOrigin(0.5, 0);
    d.desc = this.add.text(0, 0, e.desc, { fontFamily: 'Manrope', fontStyle: '700', color: this.th.ink, align: 'center' }).setOrigin(0.5, 0);
    d.tops = this.add.text(0, 0, e.tops, { fontFamily: 'Manrope', fontStyle: '500', color: this.th.dim, align: 'center' }).setOrigin(0.5, 1);
    d.add([d.g, d.name, d.desc, d.tops]);
    d.setSize(10, 10).setInteractive({ useHandCursor: true });
    d.on('pointerup', () => this.answer(d));
    d.idx = i;
    return d;
  }

  drawDock(d, lit = 0) {
    const s = (n) => this.s(n);
    const { bw: w, bh: h } = d;
    const col = hex(ENGINE_COLORS[d.engine.id]);
    d.g.clear();
    d.g.fillStyle(col, 0.1 + lit * 0.35).fillRoundedRect(-w / 2, -h / 2, w, h, s(18));
    d.g.lineStyle(s(2), col, 0.55 + lit * 0.45).strokeRoundedRect(-w / 2, -h / 2, w, h, s(18));
  }

  onKey(e) {
    const i = ['1', '2', '3'].indexOf(e.key);
    if (i >= 0) this.answer(this.docks[i]);
  }

  nextCard() {
    this.card?.destroy();
    this.card = null;
    this.hintT.setText('');
    const t = this.tasks[this.ti];
    if (!t) return this.finish();
    this.countT.setText(`Task ${this.ti + 1} of ${this.tasks.length}`);
    const c = (this.card = this.add.container(0, 0).setDepth(10));
    c.task = t;
    c.g = this.add.graphics();
    c.title = this.add.text(0, 0, t.text, { fontFamily: 'Unbounded', fontStyle: '600', color: this.th.ink, align: 'center' }).setOrigin(0.5);
    c.sub = this.add.text(0, 0, 'Drag me to an engine, or tap one', { fontFamily: 'Manrope', fontStyle: '500', color: this.th.dim }).setOrigin(0.5);
    c.add([c.g, c.title, c.sub]);
    c.setSize(10, 10).setInteractive({ draggable: true, useHandCursor: true });
    c.on('drag', (_, x, y) => c.setPosition(x, y));
    c.on('dragend', () => {
      const hit = this.docks.find((d) => Phaser.Geom.Rectangle.Contains(d.getBounds(), c.x, c.y));
      if (hit) this.answer(hit);
      else this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 180, ease: 'Quad.Out' });
    });
    this.placeCard();
    c.setAlpha(0).y -= this.s(20);
    this.tweens.add({ targets: c, alpha: 1, y: c.homeY, duration: 200, ease: 'Quad.Out' });
  }

  answer(d) {
    const c = this.card;
    if (!this.running || !c || c.answered) return;
    if (d.engine.id === c.task.engine) {
      c.answered = true;
      sfx('ok');
      this.batt -= 0.4;
      this.statusT.setText(`Offline   Battery ${Math.round(this.batt)}%`);
      this.drawDock(d, 1);
      this.tweens.add({ targets: c, x: d.x, y: d.y, scale: 0.2, alpha: 0, duration: 260, ease: 'Quad.In' });
      this.hintT.setColor(ENGINE_COLORS[d.engine.id]).setText(`Done on-device by the ${d.engine.id}`);
      this.time.delayedCall(520, () => { this.drawDock(d, 0); this.ti++; this.nextCard(); });
    } else {
      sfx('no');
      this.hintT.setColor('#ffd9e8').setText(c.task.why);
      this.tweens.add({ targets: c, x: c.homeX, y: c.homeY, duration: 150 });
      this.tweens.add({ targets: c, angle: { from: -3, to: 3 }, yoyo: true, repeat: 2, duration: 50, onComplete: () => c.setAngle(0) });
    }
  }

  placeCard() {
    const c = this.card;
    if (!c || !this.cardR) return;
    const s = (n) => this.s(n);
    const r = this.cardR;
    c.homeX = r.x;
    c.homeY = r.y;
    if (!c.answered) c.setPosition(r.x, r.y);
    c.setSize(r.w, r.h);
    c.input.hitArea.setTo(0, 0, r.w, r.h);
    c.g.clear();
    drawCard(c.g, this.th, -r.w / 2, -r.h / 2, r.w, r.h, s);
    c.title.setFontSize(s(this.portrait ? 20 : 19)).setWordWrapWidth(r.w - s(40), true).setY(-s(12));
    c.sub.setFontSize(s(13)).setY(r.h / 2 - s(22));
  }

  layout() {
    const s = (n) => this.s(n);
    const pad = s(18);
    const y = this.layoutHud();
    this.statusT.setPosition(pad, y).setFontSize(s(14));
    this.countT.setPosition(this.W / 2, y + s(26)).setFontSize(s(14));
    const tight = this.H / this.k < 470; // short landscape phones
    const cardH = s(tight ? 110 : 150);
    const dockH = s(tight ? 118 : 160);
    const cw = Math.min(this.W - pad * 2, s(460));
    const dockTop = this.H - pad - dockH;
    // Centre the card (plus room for the hint) in the space above the docks.
    const spare = dockTop - s(80) - (y + s(56)) - cardH;
    const cardTop = y + s(56) + Math.max(0, spare / 2);
    this.countT.setY(cardTop - s(30));
    this.cardR = { x: this.W / 2, y: cardTop + cardH / 2, w: cw, h: cardH };
    this.hintT.setPosition(this.W / 2, cardTop + cardH + s(12)).setFontSize(s(15)).setWordWrapWidth(Math.min(this.W - pad * 2, s(520)), true);
    const gap = s(10);
    const dw = Math.min((this.W - pad * 2 - gap * 2) / 3, s(220));
    const total = dw * 3 + gap * 2;
    this.docks.forEach((d, i) => {
      d.bw = dw;
      d.bh = dockH;
      d.setPosition(this.W / 2 - total / 2 + dw / 2 + i * (dw + gap), dockTop + dockH / 2);
      d.setSize(dw, dockH);
      d.input.hitArea.setTo(0, 0, dw, dockH);
      d.name.setFontSize(s(tight ? 18 : 22)).setY(-dockH / 2 + s(14));
      d.desc.setFontSize(s(13)).setWordWrapWidth(dw - s(16), true).setY(-dockH / 2 + s(tight ? 42 : 50));
      d.tops.setFontSize(s(11)).setWordWrapWidth(dw - s(12), true).setY(dockH / 2 - s(12));
      this.drawDock(d);
    });
    this.placeCard();
  }

  update() { this.tickHud(); }

  finish() {
    this.running = false;
    this.done = true;
    const sec = this.secs();
    this.record('L4', sec);
    this.hudT.setText(`${sec}s`);
    sfx('win');
    this.time.delayedCall(400, () => this.ask({
      kicker: `${this.tasks.length} AI tasks in ${sec}s`,
      title: 'Ekdum instant.',
      body: `All offline, battery at ${Math.round(this.batt)}%, and nothing left your laptop. That is on-device AI on Intel Core Ultra.`,
      buttons: [{ label: 'See the upgrade', onClick: () => this.go('Versus') }],
    }));
  }
}
