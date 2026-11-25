import Phaser from 'phaser';
import { DPR, THEMES, hex } from '../theme.js';
import { backdrop, panel, confetti } from '../ui.js';
import { QUESTIONS } from '../data.js';
import { sfx } from '../audio.js';

// Shared scene plumbing: responsive sizing, era backdrop, modal panels, scene hand-off.
// Subclasses implement build(data), layout() and optionally onKey(e) / update().
export default class Base extends Phaser.Scene {
  get W() { return this.scale.width; }
  get H() { return this.scale.height; }
  get portrait() { return this.H > this.W; }
  get k() { return DPR * Phaser.Math.Clamp(Math.min(this.W, this.H) / DPR / 420, 0.78, 1.45); }
  s(n) { return n * this.k * (this.fitMul || 1); }

  // Too tall for the screen? Lay out again once with smaller type rather than shrinking
  // the container: scaled canvas text gets resampled and looks jagged.
  refit(sc) {
    if (sc >= 1 || this.refitting) return false;
    this.refitting = true;
    this.fitMul = sc * 0.98;
    this.layout();
    this.fitMul = 1;
    this.refitting = false;
    return true;
  }
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

  showOverlay(fn, animate = true) {
    this.overlayFn = fn;
    this.overlay?.destroy();
    this.overlay = fn();
    const o = this.overlay;
    if (animate && o?.inner && !this.reduced) {
      const y = o.inner.y;
      o.inner.setAlpha(0).setY(y + this.s(24));
      o.dim.setAlpha(0);
      this.tweens.add({ targets: o.inner, alpha: 1, y, duration: 260, ease: 'Back.Out' });
      this.tweens.add({ targets: o.dim, alpha: 1, duration: 200 });
    }
  }

  get reduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  party(x = this.W / 2, y = this.H * 0.45, count = 60) {
    confetti(this, x, y, this.th.party, count);
  }

  // Multi-select question for this level: toggle chips, then Continue (needs at least one).
  askMulti(levelKey, kicker, onDone) {
    const q = QUESTIONS[levelKey];
    const picked = new Set();
    let hint = '';
    const build = () => {
      const keys = {};
      const toggle = (i) => { picked.has(i) ? picked.delete(i) : picked.add(i); hint = ''; this.showOverlay(build, false); };
      const done = () => {
        if (!picked.size) { hint = 'Pick at least one'; sfx('no'); this.showOverlay(build, false); return; }
        this.hideOverlay();
        this.registry.set('answers', [...(this.registry.get('answers') || []), ...[...picked].map((i) => q.options[i].w)]);
        onDone();
      };
      const on = this.th.chipOn;
      const buttons = q.options.map((o, i) => {
        keys[String(i + 1)] = () => toggle(i);
        const sel = picked.has(i);
        return {
          label: (sel ? '✓ ' : '') + o.label,
          onClick: () => toggle(i),
          opts: sel ? { fill: on.fill, ink: on.ink, pressed: on.pressed } : { ghost: true },
        };
      });
      keys.Enter = done;
      this.overlayKeys = keys;
      return panel(this, this.th, {
        kicker, title: q.title, body: 'Pick all that apply.', buttons, hint,
        footer: [{ label: picked.size ? `Continue with ${picked.size}` : 'Continue', onClick: done, opts: { disabled: !picked.size } }],
      });
    };
    this.showOverlay(build);
  }

  // Era hand-off through the time-warp scene.
  warp(next, toTheme) {
    if (this.leaving) return;
    if (this.reduced) return this.go(next);
    this.leaving = true;
    sfx('warp');
    this.cameras.main.flash(160, 255, 255, 255);
    this.time.delayedCall(140, () => this.scene.start('Warp', { next, from: this.th, to: toTheme }));
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
    // Content starts below the HUD and the 44px mute button (top-right, ~10px inset).
    return Math.max(this.top + this.hudL.height + this.s(10), 62 * DPR);
  }

  tickHud() {
    if (this.t0 && !this.done) this.hudT.setText(`${this.secs()}s`);
  }
}
