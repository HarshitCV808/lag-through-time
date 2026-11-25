import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES } from '../theme.js';
import { drawCard } from '../ui.js';
import { music, sfx } from '../audio.js';
import { L2_CHOICES } from '../data.js';

const DOWNLOAD_PER_S = 4.6; // ~22 s of pure downloading
const DRAIN_PER_S = 6.5;
const PLUG_EVERY_MS = 2100;
const PLUG_LIFE_MS = 1700;

export default class Level2Battery extends Base {
  constructor() { super('L2'); }

  build() {
    this.th = THEMES.y2k;
    music('y2k');
    Object.assign(this, { prog: 0, batt: 50, running: false, dead: false, plug: null, file: 'file.zip' });
    this.makeHud('Level 2 of 4   2003');
    this.g = this.add.graphics();
    const st = (color = '#111111') => ({ fontFamily: this.th.body, fontStyle: '700', color });
    this.winTitle = this.add.text(0, 0, '', st('#ffffff'));
    this.winLine = this.add.text(0, 0, '56 kbps dial-up modem', { ...st('#2b2b2b'), fontStyle: '500' });
    this.pct = this.add.text(0, 0, '', st()).setOrigin(1, 0);
    this.battT = this.add.text(0, 0, '', st('#ffffff')).setOrigin(0.5);
    this.status = this.add.text(0, 0, '', st('#ffffff')).setOrigin(0.5, 0);
    this.ask({
      kicker: 'Level 2 of 4',
      title: '2003: laptops go wireless',
      body: 'Wi-Fi is new and batteries last 2 to 4 hours. Finish your download before the battery dies. Tap the charger plug whenever it pops up.',
      buttons: [{ label: 'Boot up', onClick: () => this.choose() }],
    });
  }

  choose() {
    this.ask({
      kicker: 'Pick one',
      title: 'What are you downloading?',
      buttons: L2_CHOICES.map((c) => ({
        label: c.label,
        onClick: () => { this.pick(c.persona); this.file = c.file; this.start(); },
      })),
    });
  }

  start() {
    this.winTitle.setText(`Downloading ${this.file}`);
    this.running = true;
    this.t0 = this.time.now;
    this.plugTimer = this.time.addEvent({ delay: PLUG_EVERY_MS, loop: true, callback: () => this.spawnPlug() });
    this.time.delayedCall(500, () => this.spawnPlug());
  }

  spawnPlug() {
    if (!this.running || this.dead) return;
    this.plug?.destroy();
    const s = (n) => this.s(n);
    const z = s(84);
    const p = (this.plug = this.add.container(0, 0).setDepth(10));
    const g = this.add.graphics();
    g.fillStyle(0xffd23f).fillCircle(0, 0, z / 2);
    g.lineStyle(s(3), 0x111111).strokeCircle(0, 0, z / 2);
    g.fillStyle(0x111111).fillRect(-z * 0.18, -z * 0.12, z * 0.36, z * 0.26);
    g.fillRect(-z * 0.12, -z * 0.3, z * 0.06, z * 0.18).fillRect(z * 0.06, -z * 0.3, z * 0.06, z * 0.18);
    g.fillRect(-z * 0.03, z * 0.14, z * 0.06, z * 0.2);
    p.add(g);
    p.setSize(z, z).setInteractive({ useHandCursor: true });
    const r = this.playRect;
    p.setPosition(Phaser.Math.Between(r.x + z / 2, r.x + r.w - z / 2), Phaser.Math.Between(r.y + z / 2, r.y + r.h - z / 2));
    p.setScale(0.2);
    this.tweens.add({ targets: p, scale: 1, duration: 140, ease: 'Back.Out' });
    p.on('pointerdown', () => {
      this.batt = Math.min(100, this.batt + 30);
      sfx('charge');
      this.flash('+30% charging');
      p.destroy();
      this.plug = null;
    });
    this.time.delayedCall(PLUG_LIFE_MS, () => { if (this.plug === p) { p.destroy(); this.plug = null; } });
  }

  flash(text) {
    this.status.setText(text);
    this.time.delayedCall(900, () => { if (!this.dead) this.status.setText(''); });
  }

  die() {
    this.dead = true;
    this.plug?.destroy();
    this.plug = null;
    sfx('fail');
    this.status.setText('Arre! Battery dead. Rebooting…');
    this.cameras.main.flash(200, 0, 0, 0);
    this.time.delayedCall(2200, () => {
      this.prog = Math.max(0, this.prog - 20);
      this.batt = 40;
      this.dead = false;
      this.status.setText('Download resumed, but you lost some progress');
    });
  }

  update(_, dt) {
    this.tickHud();
    if (this.running && !this.dead) {
      this.prog += (dt / 1000) * DOWNLOAD_PER_S;
      this.batt -= (dt / 1000) * DRAIN_PER_S;
      if (this.batt <= 0) { this.batt = 0; this.die(); }
      if (this.prog >= 100) { this.prog = 100; this.finish(); }
    }
    this.draw();
  }

  layout() {
    const s = (n) => this.s(n);
    const pad = s(18);
    const y = this.layoutHud();
    const ww = Math.min(this.W - pad * 2, s(540));
    const wh = s(148);
    this.win = { x: (this.W - ww) / 2, y: y + s(12), w: ww, h: wh };
    const w = this.win;
    this.winTitle.setPosition(w.x + s(14), w.y + s(9)).setFontSize(s(16));
    this.winLine.setPosition(w.x + s(18), w.y + s(48)).setFontSize(s(15));
    this.pct.setPosition(w.x + w.w - s(18), w.y + s(48)).setFontSize(s(15));
    this.bar = { x: w.x + s(18), y: w.y + s(84), w: w.w - s(36), h: s(36) };
    const bw = s(150);
    const bh = s(64);
    this.battR = { x: this.W / 2 - bw / 2, y: w.y + wh + s(26), w: bw, h: bh };
    this.battT.setPosition(this.W / 2, this.battR.y + bh / 2).setFontSize(s(24));
    this.status.setPosition(this.W / 2, this.battR.y + bh + s(14)).setFontSize(s(17)).setWordWrapWidth(this.W - pad * 2);
    // Plugs pop up below the battery; on short landscape screens fall back to the whole area.
    const below = this.battR.y + bh + s(48);
    const room = this.H - below - s(38) - pad;
    this.playRect = room > s(110)
      ? { x: pad, y: below, w: this.W - pad * 2, h: room }
      : { x: pad, y, w: this.W - pad * 2, h: this.H - y - s(38) - pad };
    if (this.plug) {
      const r = this.playRect;
      this.plug.setPosition(Phaser.Math.Clamp(this.plug.x, r.x + s(42), r.x + r.w - s(42)), Phaser.Math.Clamp(this.plug.y, r.y + s(42), r.y + r.h - s(42)));
    }
  }

  draw() {
    if (!this.win) return;
    const s = (n) => this.s(n);
    const g = this.g.clear();
    const w = this.win;
    drawCard(g, this.th, w.x, w.y, w.w, w.h, s, true);
    // Sunken progress well with chunky blocks, era-accurate.
    const b = this.bar;
    g.fillStyle(0xffffff).fillRect(b.x, b.y, b.w, b.h);
    g.lineStyle(s(2), 0x3a3a3a).lineBetween(b.x, b.y, b.x + b.w, b.y).lineBetween(b.x, b.y, b.x, b.y + b.h);
    const n = 20;
    const bw = (b.w - s(6)) / n;
    g.fillStyle(0x1036a8);
    for (let i = 0; i < Math.floor(this.prog / 5); i++) g.fillRect(b.x + s(3) + i * bw, b.y + s(4), bw - s(3), b.h - s(8));
    this.pct.setText(`${Math.floor(this.prog)}%`);
    // Battery.
    const r = this.battR;
    const col = this.batt > 40 ? 0x31c45a : this.batt > 20 ? 0xffb020 : 0xe5383b;
    g.fillStyle(0x111111).fillRect(r.x, r.y, r.w, r.h).fillRect(r.x + r.w, r.y + r.h * 0.3, s(10), r.h * 0.4);
    g.fillStyle(col).fillRect(r.x + s(5), r.y + s(5), (r.w - s(10)) * (this.batt / 100), r.h - s(10));
    this.battT.setText(`${Math.ceil(this.batt)}%`);
  }

  finish() {
    this.running = false;
    this.done = true;
    this.plugTimer?.remove();
    this.plug?.destroy();
    this.plug = null;
    const sec = this.secs();
    this.record('L2', sec);
    this.hudT.setText(`${sec}s`);
    sfx('win');
    this.time.delayedCall(500, () => this.ask({
      kicker: `Downloaded in ${sec}s`,
      title: 'Plug point life, every day',
      body: 'Wi-Fi set laptops free, but batteries lasted 2 to 4 hours and big downloads took ages on dial-up.',
      buttons: [{ label: 'Jump to 2015', onClick: () => this.go('L3') }],
    }));
  }
}
