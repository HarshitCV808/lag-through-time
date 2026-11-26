import Phaser from 'phaser';
import { DPR, THEMES, hex } from '../theme.js';
import { backdrop, panel, confetti } from '../ui.js';
import { QUESTIONS } from '../data.js';
import { layoutFrame } from '../frame.js';

// Levels are played on the screen of a computer from their era (see frame.js).
const ERA_OF = { L1: 'dos', L2: 'y2k', L3: 'cloud', L4: 'ai' };
import { sfx, ambience } from '../audio.js';

// Shared scene plumbing: responsive sizing, era backdrop, modal panels, scene hand-off.
// Subclasses implement build(data), layout() and optionally onKey(e) / update().
export default class Base extends Phaser.Scene {
  // Size of this scene's world: the era computer's screen for levels, else the whole canvas.
  get W() { return this.view ? Math.round(this.view.w) : this.scale.width; }
  get H() { return this.view ? Math.round(this.view.h) : this.scale.height; }

  // Point the camera at the era computer's screen (levels) or the whole canvas.
  updateView() {
    const era = (this.eraKey || ERA_OF[this.scene.key]) || null;
    this.scene.get('Frame')?.setEra(era);
    this.view = era ? layoutFrame(this.scale.width, this.scale.height, era) : null;
    const v = this.view || { x: 0, y: 0, w: this.scale.width, h: this.scale.height };
    this.cameras.main.setViewport(Math.round(v.x), Math.round(v.y), Math.round(v.w), Math.round(v.h));
  }

  // Width of the top-right DOM buttons: sound, plus pause during levels.
  get buttonsW() { return (ERA_OF[this.scene.key] ? 106 : 54) * DPR; }

  // Do the DOM buttons (canvas top-right) sit over this scene's screen?
  get muteOverlap() {
    const v = this.view;
    if (!v) return true;
    const bx = this.scale.width - this.buttonsW;
    return bx < v.x + v.w && 54 * DPR > v.y;
  }
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
    if (!this.overlayScene) {
      ambience(null); // only the café level turns ambience on
      document.getElementById('pause').hidden = !ERA_OF[this.scene.key]; // pause only in levels
    }
    this.updateView();
    this.input.keyboard.on('keydown', (e) => {
      const f = this.overlayKeys?.[e.key];
      if (f) return f();
      if (!this.overlay) this.onKey?.(e);
    });
    this.build(data);
    this.relayout();
    const r = () => { this.updateView(); this.relayout(); };
    this.scale.on('resize', r);
    this.events.once('shutdown', () => this.scale.off('resize', r));
    const c = Phaser.Display.Color.IntegerToRGB(hex(this.th.bg));
    if (this.overlayScene) return;
    this.cameras.main.fadeIn(280, c.r, c.g, c.b);
    if (this.view?.full && !this.reduced) this.introZoom();
  }

  // Level intro on full desk scenes: start a little zoomed out on the room, then glide in
  // to the computer. Room (Frame), game camera and glass move together around the screen's
  // centre so they stay aligned; the tween ends at exactly 1:1, so text lands crisp.
  introZoom() {
    const cams = [this.scene.get('Frame').cameras.main, this.scene.get('Glass').cameras.main];
    const apply = (z) => {
      const v = this.view;
      if (!v || !v.full) return;
      const Wc = this.scale.width;
      const Hc = this.scale.height;
      const cx = v.x + v.w / 2;
      const cy = v.y + v.h / 2;
      cams.forEach((cam) => { cam.setZoom(z); cam.centerOn(cx + (Wc / 2 - cx) / z, cy + (Hc / 2 - cy) / z); });
      const cam = this.cameras.main;
      cam.setViewport(Math.round(cx - (v.w * z) / 2), Math.round(cy - (v.h * z) / 2), Math.round(v.w * z), Math.round(v.h * z));
      cam.setZoom(z);
      cam.centerOn(v.w / 2, v.h / 2);
    };
    const st = { z: 0.84 };
    apply(st.z);
    this.tweens.add({
      targets: st, z: 1, duration: 950, ease: 'Cubic.Out',
      onUpdate: () => apply(st.z),
      onComplete: () => {
        cams.forEach((cam) => { cam.setZoom(1); cam.setScroll(0, 0); });
        this.cameras.main.setZoom(1).setScroll(0, 0);
        this.updateView();
      },
    });
    this.events.once('shutdown', () => cams.forEach((cam) => { cam.setZoom(1); cam.setScroll(0, 0); }));
  }

  relayout() {
    this.bgG?.destroy();
    if (!this.overlayScene) this.bgG = backdrop(this, this.th);
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

  // Level intro + multi-select question in one panel: toggle chips, then Start (needs at least one).
  askMulti(levelKey, kicker, onDone, intro) {
    const q = QUESTIONS[levelKey];
    const picked = new Set();
    let hint = '';
    const build = () => {
      const keys = {};
      const toggle = (i) => { picked.has(i) ? picked.delete(i) : picked.add(i); hint = ''; this.showOverlay(build, false); };
      const done = () => {
        if (!picked.size) { hint = 'Pick at least one'; sfx('no'); this.showOverlay(build, false); return; }
        this.hideOverlay();
        // Stored per level, so restarting a level replaces its answers instead of adding twice.
        const byLevel = { ...(this.registry.get('answersByLevel') || {}), [levelKey]: [...picked].map((i) => q.options[i].w) };
        this.registry.set('answersByLevel', byLevel);
        this.registry.set('answers', Object.values(byLevel).flat());
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
        kicker, title: intro.title, body: intro.body, question: `${q.title} Pick all that apply.`, buttons, hint,
        footer: [{ label: picked.size ? 'Start' : 'Pick at least one to start', onClick: done, opts: { disabled: !picked.size } }],
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
      const keys = { ...opts.keys }; // extra shortcuts survive every relayout
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
    // Keep the timer clear of the mute button when it overlaps the screen.
    const right = this.muteOverlap ? this.scale.width - this.buttonsW - 12 * DPR - (this.view?.x || 0) : this.W - this.s(18);
    this.hudT.setOrigin(1, 0).setPosition(Math.min(right, this.W - this.s(18)), this.top).setFontSize(fs);
    // Content starts below the HUD and the 44px mute button (top-right, ~10px inset).
    const clear = this.muteOverlap ? 62 * DPR - (this.view?.y || 0) : 0;
    return Math.max(this.top + this.hudL.height + this.s(10), clear);
  }

  tickHud() {
    if (this.t0 && !this.done) this.hudT.setText(`${this.secs()}s`);
  }
}
