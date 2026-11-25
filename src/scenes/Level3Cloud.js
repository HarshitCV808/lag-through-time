import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { Button, drawCard } from '../ui.js';
import { music, sfx } from '../audio.js';
import { L3_CHOICES, POPUPS } from '../data.js';

const PROGRESS_PER_S = 6.8; // ~15 s when nothing gets in the way
const WIFI_EVERY_MS = 4300;
const WIFI_DOWN_MS = 2000;
const POPUP_EVERY_MS = 2500;

export default class Level3Cloud extends Base {
  constructor() { super('L3'); }

  build() {
    this.th = THEMES.cloud;
    music('cloud');
    Object.assign(this, { prog: 0, wifi: true, running: false, popups: [], choice: L3_CHOICES[1], pi: 0 });
    this.makeHud('Level 3 of 4   2015');
    this.g = this.add.graphics();
    const st = (weight = '700', color = this.th.ink) => ({ fontFamily: 'Figtree', fontStyle: weight, color });
    this.appT = this.add.text(0, 0, 'Cloud AI', st('800'));
    this.taskT = this.add.text(0, 0, '', st('500', this.th.dim));
    this.pctT = this.add.text(0, 0, '', st('800', this.th.accent)).setOrigin(1, 0);
    this.statusT = this.add.text(0, 0, '', st('700'));
    this.wifiT = this.add.text(0, 0, '', st('700')).setOrigin(1, 0.5);
    this.ask({
      kicker: 'Level 3 of 4',
      title: '2015: AI lives in the cloud',
      body: "Your laptop can't run AI itself, so it sends your files to a server far away. Close the pop-ups and wait out the Wi-Fi.",
      buttons: [{ label: 'Open the app', onClick: () => this.choose() }],
    });
  }

  choose() {
    this.ask({
      kicker: 'Pick one',
      title: 'What should cloud AI do?',
      buttons: L3_CHOICES.map((c) => ({
        label: c.label,
        onClick: () => { this.pick(c.persona); this.choice = c; this.start(); },
      })),
    });
  }

  start() {
    this.taskT.setText(`${this.choice.label} (${this.choice.file})`);
    this.running = true;
    this.t0 = this.time.now;
    this.time.addEvent({ delay: WIFI_EVERY_MS, loop: true, callback: () => this.dropWifi() });
    this.time.addEvent({ delay: POPUP_EVERY_MS, loop: true, callback: () => this.spawnPopup() });
    this.time.delayedCall(900, () => this.spawnPopup());
  }

  dropWifi() {
    if (!this.running) return;
    this.wifi = false;
    sfx('no');
    this.time.delayedCall(WIFI_DOWN_MS, () => (this.wifi = true));
  }

  spawnPopup() {
    if (!this.running || this.popups.length >= 3) return;
    sfx('pop');
    const msg = POPUPS[this.pi++ % POPUPS.length];
    const p = this.add.container(0, 0).setDepth(20);
    p.msg = msg;
    p.rx = Math.random();
    p.ry = Math.random();
    this.popups.push(p);
    this.buildPopup(p);
    p.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: p, scale: 1, alpha: 1, duration: 160, ease: 'Back.Out' });
  }

  buildPopup(p) {
    p.removeAll(true);
    const s = (n) => this.s(n);
    const pw = Math.min(this.W - s(40), s(320));
    const t = this.add.text(-pw / 2 + s(18), 0, p.msg, {
      fontFamily: 'Figtree', fontStyle: '700', fontSize: s(16), color: this.th.ink,
      wordWrap: { width: pw - s(36), useAdvancedWrap: true },
    });
    const bh = s(48);
    const ph = s(18) + t.height + s(14) + bh + s(16);
    t.y = -ph / 2 + s(18);
    const g = this.add.graphics();
    drawCard(g, this.th, -pw / 2, -ph / 2, pw, ph, s);
    g.fillStyle(0xe5383b).fillRect(-pw / 2 + s(18), -ph / 2, s(40), s(4));
    const close = new Button(this, this.th, 'Close', () => this.closePopup(p), { fill: '#1b2330' });
    close.place(0, ph / 2 - s(16) - bh / 2, pw - s(36), bh, s(16));
    p.add([g, t, close]);
    const r = this.playRect;
    p.setPosition(r.x + pw / 2 + p.rx * Math.max(0, r.w - pw), r.y + ph / 2 + p.ry * Math.max(0, r.h - ph));
  }

  closePopup(p) {
    this.popups = this.popups.filter((q) => q !== p);
    p.destroy();
  }

  update(_, dt) {
    this.tickHud();
    if (!this.running) return this.draw();
    const blocked = this.popups.length > 0;
    if (this.wifi && !blocked) this.prog += (dt / 1000) * PROGRESS_PER_S;
    if (this.prog >= 100) { this.prog = 100; this.finish(); return this.draw(); }
    let status;
    if (!this.wifi) status = 'No internet. Reconnecting…';
    else if (blocked) status = 'Paused. Answer the pop-up first.';
    else if (this.prog < 35) status = 'Uploading your file to the server…';
    else if (this.prog < 70) status = 'Waiting in the data centre queue…';
    else status = 'Downloading the result…';
    this.statusT.setText(status).setColor(!this.wifi || blocked ? '#c42b2e' : this.th.ink);
    this.draw();
  }

  layout() {
    const s = (n) => this.s(n);
    const pad = s(18);
    const y = this.layoutHud();
    const cw = Math.min(this.W - pad * 2, s(560));
    const ch = s(220);
    this.card = { x: (this.W - cw) / 2, y: y + s(10), w: cw, h: ch };
    const c = this.card;
    const ip = s(22);
    this.appT.setPosition(c.x + ip, c.y + ip).setFontSize(s(24));
    this.wifiT.setPosition(c.x + c.w - ip - s(40), c.y + ip + s(14)).setFontSize(s(14));
    this.taskT.setPosition(c.x + ip, c.y + ip + s(36)).setFontSize(s(15)).setWordWrapWidth(c.w - ip * 2, true);
    this.bar = { x: c.x + ip, y: c.y + s(128), w: c.w - ip * 2, h: s(14) };
    this.pctT.setPosition(c.x + c.w - ip, c.y + s(100)).setFontSize(s(18));
    this.statusT.setPosition(c.x + ip, c.y + s(160)).setFontSize(s(16)).setWordWrapWidth(c.w - ip * 2, true);
    this.playRect = { x: pad, y: c.y + ch + s(16), w: this.W - pad * 2, h: Math.max(s(160), this.H - (c.y + ch + s(16)) - pad) };
    if (this.playRect.y + this.playRect.h > this.H) this.playRect = { x: pad, y, w: this.W - pad * 2, h: this.H - y - pad };
    this.popups.forEach((p) => this.buildPopup(p));
  }

  draw() {
    if (!this.card) return;
    const s = (n) => this.s(n);
    const g = this.g.clear();
    const c = this.card;
    drawCard(g, this.th, c.x, c.y, c.w, c.h, s);
    const b = this.bar;
    g.fillStyle(0xdfe5ee).fillRoundedRect(b.x, b.y, b.w, b.h, b.h / 2);
    if (this.prog > 1) g.fillStyle(hex(this.th.accent)).fillRoundedRect(b.x, b.y, Math.max(b.h, (b.w * this.prog) / 100), b.h, b.h / 2);
    this.pctT.setText(`${Math.floor(this.prog)}%`);
    // Wi-Fi icon: three arcs, greyed out when down.
    const wx = c.x + c.w - s(36);
    const wy = c.y + s(46);
    const on = this.wifi;
    for (let i = 0; i < 3; i++) {
      g.lineStyle(s(3), on ? hex(this.th.accent) : 0xc4ccd8, 1);
      g.beginPath();
      g.arc(wx, wy, s(8 + i * 7), Phaser.Math.DegToRad(225), Phaser.Math.DegToRad(315));
      g.strokePath();
    }
    g.fillStyle(on ? hex(this.th.accent) : 0xc4ccd8).fillCircle(wx, wy, s(3));
    if (!on) g.lineStyle(s(3), 0xe5383b).lineBetween(wx - s(20), wy - s(26), wx + s(20), wy + s(4));
    this.wifiT.setText(on ? '' : 'Offline');
  }

  finish() {
    this.running = false;
    this.done = true;
    this.popups.forEach((p) => p.destroy());
    this.popups = [];
    const sec = this.secs();
    this.record('L3', sec);
    this.hudT.setText(`${sec}s`);
    this.statusT.setText('Done. A copy of your file now sits on a server.');
    sfx('win');
    this.time.delayedCall(700, () => this.ask({
      kicker: `Done in ${sec}s`,
      title: 'Itna wait? Seriously?',
      body: 'Cloud AI needed internet, waited in server queues, and a copy of your file left your laptop.',
      buttons: [{ label: 'Jump to 2026', onClick: () => this.go('L4') }],
    }));
  }
}
