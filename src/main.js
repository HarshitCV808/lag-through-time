import Phaser from 'phaser';
import { DPR } from './theme.js';
import { isMuted, setMuted, unlock, audioRunning, pauseAudio } from './audio.js';
import Title from './scenes/Title.js';
import Level1Dos from './scenes/Level1Dos.js';
import Level2Battery from './scenes/Level2Battery.js';
import Level3Cloud from './scenes/Level3Cloud.js';
import Level4AIPC from './scenes/Level4AIPC.js';
import Versus from './scenes/Versus.js';
import Result from './scenes/Result.js';
import Warp from './scenes/Warp.js';
import Frame from './scenes/Frame.js';
import Glass from './scenes/Glass.js';
import Splash from './scenes/Splash.js';
import Fx from './scenes/Fx.js';
import Pause from './scenes/Pause.js';

const FONTS = [
  '20px VT323', '400 20px Silkscreen', '700 20px Silkscreen',
  '500 20px Figtree', '700 20px Figtree', '800 20px Figtree',
  '600 20px Unbounded', '800 20px Unbounded', '500 20px Manrope', '700 20px Manrope', '800 20px Manrope',
];

// Crisp text: whole-pixel font sizes everywhere, and the Silkscreen pixel font only at
// multiples of its 8px grid (in-between sizes make its square pixels uneven and jagged).
const crispSize = (size, family = '') => {
  if (typeof size !== 'number') return size;
  return /Silkscreen/.test(family) ? Math.max(8, Math.round(size / 8) * 8) : Math.round(size);
};
const TextStyle = Phaser.GameObjects.TextStyle.prototype;
const setStyle = TextStyle.setStyle;
// VT323 ships in one weight only; asking for bold makes the browser smear its pixels.
const singleWeight = (family = '') => /VT323/.test(family);
TextStyle.setStyle = function (style, ...rest) {
  if (style && typeof style.fontSize === 'number') style = { ...style, fontSize: crispSize(style.fontSize, style.fontFamily) };
  if (style && singleWeight(style.fontFamily)) style = { ...style, fontStyle: '' };
  return setStyle.call(this, style, ...rest);
};
const setFontFamily = TextStyle.setFontFamily;
TextStyle.setFontFamily = function (family) {
  if (singleWeight(family)) this.fontStyle = '';
  return setFontFamily.call(this, family);
};
const setFontSize = TextStyle.setFontSize;
TextStyle.setFontSize = function (size) { return setFontSize.call(this, crispSize(size, this.fontFamily)); };

const muteBtn = document.getElementById('mute');
const syncMute = () => {
  muteBtn.setAttribute('aria-pressed', String(!isMuted()));
  muteBtn.setAttribute('aria-label', isMuted() ? 'Turn sound on' : 'Turn sound off');
};
// Blur after clicking so Space / Enter go to the game, not back to the mute button.
muteBtn.addEventListener('click', () => { setMuted(!isMuted()); syncMute(); muteBtn.blur(); });
syncMute();
// Sound is on by default, but browsers only let audio start inside a real user gesture.
// Try on every kind of gesture (on touch screens only the finger lifting counts) and stop
// listening only once audio is actually running.
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
const tryUnlock = () => {
  unlock();
  setTimeout(() => {
    if (audioRunning()) GESTURES.forEach((ev) => removeEventListener(ev, tryUnlock, true));
  }, 0);
};
GESTURES.forEach((ev) => addEventListener(ev, tryUnlock, true));

(async () => {
  // Canvas text needs fonts loaded first; don't hang the kiosk if the network is slow.
  await Promise.race([
    Promise.all(FONTS.map((f) => document.fonts.load(f))).catch(() => {}),
    new Promise((r) => setTimeout(r, 3000)),
  ]);
  // Render at device pixels and zoom down, so text stays crisp on phones.
  // Canvas renderer: this game is shapes + text, and it avoids WebGL failures on store kiosks.
  // Whole device pixels; CSS (index.html) pins the canvas to exactly the viewport, so a
  // fractional density like 2.625 never stretches the canvas by a sub-pixel and blurs it.
  const size = () => [Math.round(Math.max(320, innerWidth) * DPR), Math.round(Math.max(320, innerHeight) * DPR)];
  const [w, h] = size();
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: 'game',
    backgroundColor: '#060d2b',
    scale: { mode: Phaser.Scale.NONE, width: w, height: h, zoom: 1 / DPR },
    input: { activePointers: 2 },
    render: { roundPixels: true, antialias: true }, // whole-pixel positions keep text sharp
    scene: [Frame, Splash, Title, Warp, Level1Dos, Level2Battery, Level3Cloud, Level4AIPC, Versus, Result, Pause, Glass, Fx],
  });
  // Always clip each scene to its camera viewport, so a level never draws outside its
  // era computer's screen. Phaser only clips while an internal "custom viewports" counter
  // is above 0, and that counter can drift to 0 across window resizes / phone rotation.
  Object.defineProperty(game.scene, 'customViewports', { get: () => 1, set: () => {} });
  addEventListener('resize', () => {
    game.scale.resize(...size());
    game.scale.setZoom(1 / DPR);
  });
  window.__game = game; // debug handles
  window.__audioRunning = audioRunning;

  // Kiosk: if a shopper walks away mid-game, return to the title after 90 s without input.
  // (A phone that opened a saved match link is left alone.)
  let lastInput = Date.now();
  const touch = () => (lastInput = Date.now());
  addEventListener('pointerdown', touch, true);
  addEventListener('keydown', touch, true);
  const LAYERS = ['Frame', 'Glass', 'Fx'];
  const PLAY = ['Warp', 'L1', 'L2', 'L3', 'L4', 'Pause', 'Versus', 'Result'];
  setInterval(() => {
    const scene = game.scene.getScenes(true).find((s) => !LAYERS.includes(s.scene.key));
    if (!scene || ['Title', 'Splash'].includes(scene.scene.key) || scene.fromLink) return;
    if (Date.now() - lastInput > 90000) {
      touch();
      pauseAudio(false);
      // Stop everything, including a level frozen under the pause card.
      PLAY.forEach((k) => (game.scene.isActive(k) || game.scene.isPaused(k)) && game.scene.stop(k));
      game.scene.start('Title');
    }
  }, 5000);

  // Pause: button next to the sound button, Esc, or automatically when the tab / phone
  // goes to the background. (Not P: that would clash with typing PRINT in 1981.)
  const ERA = { L1: 'dos', L2: 'y2k', L3: 'cloud', L4: 'ai' };
  const pauseBtn = document.getElementById('pause');
  const pauseGame = () => {
    const level = Object.keys(ERA).find((k) => game.scene.isActive(k));
    if (!level || game.scene.isActive('Pause') || game.scene.getScene(level).leaving) return;
    game.scene.pause(level);
    game.scene.start('Pause', { level, era: ERA[level] });
  };
  pauseBtn.addEventListener('click', () => { pauseGame(); pauseBtn.blur(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !game.scene.isActive('Pause')) pauseGame(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
  window.__pauseGame = pauseGame;
})();
