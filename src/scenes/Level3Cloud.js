import Phaser from 'phaser';
import Base from './Base.js';
import { THEMES, hex } from '../theme.js';
import { Button, drawCard } from '../ui.js';
import { music, sfx } from '../audio.js';
import { PERMISSIONS } from '../data.js';

// Swipe the permissions: cloud AI keeps asking for your data while your selfie
// crawls to a server. Swipe right to allow, left to deny. Wi-Fi drops freeze everything.
const PROGRESS_PER_S = 4.6;
const WIFI_EVERY_MS = 5200;
const WIFI_DOWN_MS = 1700;

export default class Level3Cloud extends Base {
  constructor() { super('L3'); }

  build() {
    this.th = THEMES.cloud;
    music('cloud');
    Object.assign(this, { prog: 0, wifi: true, running: false, ci: 0, card: null, correct: 0, leaks: 0, busyCard: false });
    this.deck = PERMISSIONS;
    this.makeHud('Level 3 of 4   2015');
    this.g = this.add.graphics();
    const st = (weight, color, size) => ({ fontFamily: 'Figtree', fontStyle: weight, color, fontSize: this.s(size) });
    this.appT = this.add.text(0, 0, 'Cloud AI is editing your selfie', st('800', this.th.ink, 17));
    this.statusT = this.add.text(0, 0, '', st('700', this.th.dim, 14));
    this.pctT = this.add.text(0, 0, '', st('800', this.th.accent, 15)).setOrigin(1, 0);
    this.countT = this.add.text(0, 0, '', st('700', this.th.dim, 14)).setOrigin(0.5, 0);
    this.toast = this.add.text(0, 0, '', { ...st('700', this.th.ink, 15), align: 'center' }).setOrigin(0.5, 0).setDepth(30);
    this.deny = new Button(this, this.th, 'Deny', () => this.decide(false), { fill: '#e5383b', ink: '#ffffff' });
    this.allow = new Button(this, this.th, 'Allow', () => this.decide(true), { fill: '#1f9d55', ink: '#ffffff' });
    this.deny.setVisible(false);
    this.allow.setVisible(false);
    this.askMulti('L3', 'Level 3 of 4', () => this.start(), {
      title: '2015: Swipe the permissions',
      body: 'Cloud AI keeps asking for your data. Swipe right to allow, left to deny.',
    });
  }

  start() {
    this.running = true;
    this.t0 = this.time.now;
    this.deny.setVisible(true);
    this.allow.setVisible(true);
    this.time.addEvent({ delay: WIFI_EVERY_MS, loop: true, callback: () => this.dropWifi() });
    this.nextCard();
  }

  dropWifi() {
    if (!this.running) return;
    this.wifi = false;
    sfx('no');
    this.card?.setAlpha(0.45);
    this.time.delayedCall(WIFI_DOWN_MS, () => { this.wifi = true; this.card?.setAlpha(1); });
  }

  onKey(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.decide(false);
    if (e.key === 'ArrowRight' || e.key === 'd') this.decide(true);
  }

  nextCard() {
    const p = this.deck[this.ci];
    this.card = null;
    if (!p) {
      this.deny.setVisible(false);
      this.allow.setVisible(false);
      this.countT.setText('No more requests');
      return;
    }
    this.countT.setText(`Request ${this.ci + 1} of ${this.deck.length}`);
    const c = (this.card = this.add.container(0, 0).setDepth(10));
    c.perm = p;
    c.g = this.add.graphics();
    c.who = this.add.text(0, 0, 'CloudAI wants to:', { fontFamily: 'Figtree', fontStyle: '700', color: this.th.dim });
    c.req = this.add.text(0, 0, p.text, { fontFamily: 'Figtree', fontStyle: '800', color: this.th.ink, wordWrap: { width: 4000, useAdvancedWrap: true } });
    c.tip = this.add.text(0, 0, 'Swipe right to allow, left to deny', { fontFamily: 'Figtree', fontStyle: '500', color: this.th.dim }).setOrigin(0.5, 1);
    c.yes = this.add.text(0, 0, 'ALLOW', { fontFamily: 'Figtree', fontStyle: '800', color: '#1f9d55' }).setAngle(-12).setAlpha(0);
    c.no = this.add.text(0, 0, 'DENY', { fontFamily: 'Figtree', fontStyle: '800', color: '#e5383b' }).setOrigin(1, 0).setAngle(12).setAlpha(0);
    c.add([c.g, c.who, c.req, c.tip, c.yes, c.no]);
    c.setSize(10, 10).setInteractive({ draggable: true, useHandCursor: true });
    c.on('drag', (_, x) => {
      if (!this.wifi || this.busyCard) return;
      c.x = x;
      const dx = x - c.homeX;
      c.setAngle(Phaser.Math.Clamp(dx / this.W * 40, -18, 18));
      c.yes.setAlpha(Phaser.Math.Clamp(dx / this.s(90), 0, 1));
      c.no.setAlpha(Phaser.Math.Clamp(-dx / this.s(90), 0, 1));
    });
    c.on('dragend', () => {
      const dx = c.x - c.homeX;
      if (Math.abs(dx) > this.s(80)) this.decide(dx > 0);
      else this.tweens.add({ targets: c, x: c.homeX, angle: 0, duration: 200, ease: 'Back.Out', onUpdate: () => { c.yes.setAlpha(0); c.no.setAlpha(0); } });
    });
    this.placeCard();
    c.setScale(0.85).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: this.wifi ? 1 : 0.45, duration: 220, ease: 'Back.Out' });
  }

  decide(allow) {
    const c = this.card;
    if (!this.running || !c || this.busyCard || this.overlay) return;
    if (!this.wifi) { this.say('No internet. Wait for Wi-Fi…', '#c42b2e'); sfx('no'); return; }
    this.busyCard = true;
    const p = c.perm;
    const right = allow === p.ok;
    (allow ? c.yes : c.no).setAlpha(1);
    this.tweens.add({
      targets: c, x: c.homeX + (allow ? 1 : -1) * this.W, angle: allow ? 25 : -25, duration: 280, ease: 'Quad.In',
      onComplete: () => { c.destroy(); this.busyCard = false; this.ci++; this.nextCard(); },
    });
    if (right) {
      this.correct++;
      sfx('ok');
      this.say(p.ok ? p.note : 'Good call. Denied!', p.ok ? '#b26a00' : '#1f9d55');
    } else if (allow) {
      this.leaks++;
      sfx('fail');
      this.cameras.main.shake(160, 0.006);
      this.say(p.note, '#c42b2e');
    } else {
      sfx('no');
      this.say('Cloud AI can’t edit without it, so it asks again… and you give in.', '#b26a00');
    }
  }

  say(text, color) {
    this.toast.setText(text).setColor(color).setAlpha(1);
    this.tweens.killTweensOf(this.toast);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 1800, duration: 400 });
  }

  update(_, dt) {
    this.tickHud();
    if (this.running) {
      const deckDone = this.ci >= this.deck.length;
      if (this.wifi) this.prog += (dt / 1000) * PROGRESS_PER_S * (deckDone ? 5 : 1);
      if (deckDone && this.prog >= 100) { this.prog = 100; this.finish(); }
      // The upload can't finish before the requests are dealt with.
      if (!deckDone) this.prog = Math.min(this.prog, 92);
      let status;
      if (!this.wifi) status = 'No internet. Reconnecting…';
      else if (this.prog < 35) status = 'Uploading your selfie to the server…';
      else if (this.prog < 70) status = 'Waiting in the data centre queue…';
      else status = 'Downloading the result…';
      this.statusT.setText(status).setColor(this.wifi ? this.th.dim : '#c42b2e');
    }
    this.draw();
  }

  placeCard() {
    const c = this.card;
    if (!c || !this.cardR) return;
    const s = (n) => this.s(n);
    const r = this.cardR;
    c.homeX = r.x;
    if (!this.busyCard) c.setPosition(r.x, r.y);
    c.setSize(r.w, r.h);
    c.input.hitArea.setTo(0, 0, r.w, r.h);
    c.g.clear();
    drawCard(c.g, this.th, -r.w / 2, -r.h / 2, r.w, r.h, s);
    c.g.fillStyle(hex(this.th.accent)).fillCircle(-r.w / 2 + s(34), -r.h / 2 + s(34), s(14));
    c.g.fillStyle(0xffffff).fillCircle(-r.w / 2 + s(29), -r.h / 2 + s(36), s(5)).fillCircle(-r.w / 2 + s(37), -r.h / 2 + s(33), s(6)).fillCircle(-r.w / 2 + s(41), -r.h / 2 + s(37), s(4));
    // Type scales with the card so the request always fits inside it.
    const small = r.h < s(170);
    c.who.setPosition(-r.w / 2 + s(56), -r.h / 2 + s(24)).setFontSize(s(14));
    c.req.setPosition(-r.w / 2 + s(22), -r.h / 2 + s(small ? 50 : 64)).setFontSize(s(r.h < s(130) ? 17 : small ? 20 : 24)).setWordWrapWidth(r.w - s(44), true);
    c.tip.setPosition(0, r.h / 2 - s(12)).setFontSize(s(12)).setVisible(r.h > s(150));
    const stampY = r.h / 2 - Math.min(s(84), r.h * 0.45);
    c.yes.setPosition(-r.w / 2 + s(22), stampY).setFontSize(s(small ? 26 : 34));
    c.no.setPosition(r.w / 2 - s(22), stampY).setFontSize(s(small ? 26 : 34));
  }

  layout() {
    // Fixed bands top to bottom, so nothing can collide: app status, request counter,
    // swipe card (flexes), a reserved two-line answer line, then the Deny / Allow buttons.
    const s = (n) => this.s(n);
    const pad = s(16);
    const y = this.layoutHud();
    const cw = Math.min(this.W - pad * 2, s(460));
    this.app = { x: (this.W - cw) / 2, y, w: cw, h: s(84) };
    const a = this.app;
    this.appT.setPosition(a.x + s(16), a.y + s(12)).setFontSize(s(15)).setWordWrapWidth(cw - s(80), true);
    this.statusT.setPosition(a.x + s(16), a.y + s(36)).setFontSize(s(13));
    this.pctT.setPosition(a.x + a.w - s(16), a.y + s(36)).setFontSize(s(14));
    this.bar = { x: a.x + s(16), y: a.y + s(62), w: a.w - s(32), h: s(10) };
    const btnH = s(52);
    const btnY = this.H - pad - btnH / 2;
    const bw = (cw - s(12)) / 2;
    this.deny.place(this.W / 2 - bw / 2 - s(6), btnY, bw, btnH, s(17));
    this.allow.place(this.W / 2 + bw / 2 + s(6), btnY, bw, btnH, s(17));
    const toastH = s(15) * 2.7;
    const toastTop = btnY - btnH / 2 - s(8) - toastH;
    this.toast.setPosition(this.W / 2, toastTop).setFontSize(s(14)).setWordWrapWidth(cw, true);
    const countTop = a.y + a.h + s(8);
    this.countT.setPosition(this.W / 2, countTop).setFontSize(s(13));
    const cardTop = countTop + s(22);
    const room = toastTop - s(8) - cardTop;
    const ch = Math.max(s(90), Math.min(s(this.portrait ? 330 : 250), room));
    this.cardR = { x: this.W / 2, y: cardTop + Math.max(0, room - ch) / 2 + ch / 2, w: Math.min(cw, s(400)), h: ch };
    this.placeCard();
  }

  draw() {
    if (!this.app) return;
    const s = (n) => this.s(n);
    const g = this.g.clear();
    const a = this.app;
    drawCard(g, this.th, a.x, a.y, a.w, a.h, s);
    const b = this.bar;
    g.fillStyle(0xdfe5ee).fillRoundedRect(b.x, b.y, b.w, b.h, b.h / 2);
    if (this.prog > 1) g.fillStyle(hex(this.th.accent)).fillRoundedRect(b.x, b.y, Math.max(b.h, (b.w * this.prog) / 100), b.h, b.h / 2);
    this.pctT.setText(`${Math.floor(this.prog)}%`);
    // Wi-Fi icon.
    const wx = a.x + a.w - s(30);
    const wy = a.y + s(32);
    const col = this.wifi ? hex(this.th.accent) : 0xc4ccd8;
    for (let i = 0; i < 3; i++) {
      g.lineStyle(s(3), col, 1);
      g.beginPath();
      g.arc(wx, wy, s(6 + i * 6), Phaser.Math.DegToRad(225), Phaser.Math.DegToRad(315));
      g.strokePath();
    }
    g.fillStyle(col).fillCircle(wx, wy, s(2.5));
    if (!this.wifi) g.lineStyle(s(3), 0xe5383b).lineBetween(wx - s(16), wy - s(22), wx + s(16), wy + s(2));
  }

  finish() {
    this.running = false;
    this.done = true;
    const sec = this.secs();
    this.record('L3', sec);
    this.registry.set('privacy', { correct: this.correct, total: this.deck.length });
    this.hudT.setText(`${sec}s`);
    sfx('win');
    this.party();
    this.time.delayedCall(600, () => this.ask({
      kicker: `Privacy score ${this.correct}/${this.deck.length} in ${sec}s`,
      title: 'Itna wait? Seriously?',
      body: 'Even perfect swipes couldn’t stop your selfie leaving your laptop.',
      buttons: [{ label: 'Jump to 2026', onClick: () => this.warp('L4', THEMES.ai) }],
    }));
  }
}
