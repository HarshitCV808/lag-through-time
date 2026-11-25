import Phaser from 'phaser';
import { DPR, THEMES, hex } from '../theme.js';
import { backdrop, panel } from '../ui.js';
import { sfx } from '../audio.js';

// Shared scene plumbing: responsive sizing, era backdrop, modal panels, scene hand-off.
// Subclasses implement build(data), layout() and optionally onKey(e) / update().
export default class Base extends Phaser.Scene {
  get W() { return this.scale.width; }
  get H() { return this.scale.height; }
  get portrait() { return this.H > this.W; }
  get k() { return DPR * Phaser.Math.Clamp(Math.min(this.W, this.H) / DPR / 420, 0.78, 1.45); }
  s(n) { return n * this.k; }
  // Top inset that keeps HUD clear of the mute button / notch.
  get top() { return this.s(18); }

  create(data) {
    // Phaser reuses scene instances, so reset per-run state here.
    this.th = this.th || THEMES.ai;
    this.leaving = false;
    this.done = false;
    this.t0 = 0;
    this.overlay = null;
    this.overlayFn = null;
    this.overlayKeys = null;
    this.bgG = null;
    this.input.keyboard.on('keydown', (e) => {
      const f = this.overlayKeys?.[e.key];
      if (f) return f();
      if (!this.overlay) this.onKey?.(e);
    });
    this.build(data);
    this.relayout();
    const r = () => this.relayout();
    this.scale.on('resize', r);
    this.events.once('shutdown', () => this.scale.off('resize', r));
    const c = Phaser.Display.Color.IntegerToRGB(hex(this.th.bg));
    this.cameras.main.fadeIn(280, c.r, c.g, c.b);
  }

  relayout() {
    this.bgG?.destroy();
    this.bgG = backdrop(this, this.th);
    this.layout?.();
    if (this.overlayFn) {
      this.overlay?.destroy();
      this.overlay = this.overlayFn();
    }
  }

  showOverlay(fn) {
    this.overlayFn = fn;
    this.overlay?.destroy();
    this.overlay = fn();
  }

  hideOverlay() {
    this.overlayFn = null;
    this.overlayKeys = null;
    this.overlay?.destroy();
    this.overlay = null;
  }

  // Modal with buttons. One button → Enter/Space; several → number keys 1..n.
  ask(opts) {
    this.showOverlay(() => {
      const btns = opts.buttons.map((b) => ({ ...b, onClick: () => { this.hideOverlay(); b.onClick(); } }));
      const keys = {};
      if (btns.length === 1) keys.Enter = keys[' '] = btns[0].onClick;
      else btns.forEach((b, i) => (keys[String(i + 1)] = b.onClick));
      this.overlayKeys = keys;
      return panel(this, this.th, { ...opts, buttons: btns });
    });
  }

  go(key, data) {
    if (this.leaving) return;
    this.leaving = true;
    sfx('warp');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key, data));
  }

  record(level, sec) {
    this.registry.set('times', { ...(this.registry.get('times') || {}), [level]: sec });
  }

  pick(persona) {
    this.registry.set('picks', [...(this.registry.get('picks') || []), persona]);
  }

  secs() {
    return Math.max(1, Math.round((this.time.now - this.t0) / 1000));
  }

  // HUD: level + era on the left, running timer on the right, clear of the mute button.
  makeHud(label) {
    const th = this.th;
    this.hudL = this.add.text(0, 0, label, { fontFamily: th.body, fontStyle: '700', color: th.name === 'y2k' ? '#ffffff' : th.ink }).setDepth(5);
    this.hudT = this.add.text(0, 0, '', { fontFamily: th.body, fontStyle: '700', color: th.name === 'y2k' ? '#ffffff' : th.accent }).setOrigin(0.5, 0).setDepth(5);
  }

  layoutHud() {
    const fs = this.s(this.th.name === 'dos' ? 22 : 15);
    this.hudL.setPosition(this.s(18), this.top).setFontSize(fs);
    this.hudT.setOrigin(1, 0).setPosition(this.W - 66 * DPR, this.top).setFontSize(fs);
    return this.top + this.hudL.height + this.s(10);
  }

  tickHud() {
    if (this.t0 && !this.done) this.hudT.setText(`${this.secs()}s`);
  }
}
