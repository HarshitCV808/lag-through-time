import Base from './Base.js';
import { THEMES } from '../theme.js';
import { pauseAudio } from '../audio.js';

// Pause card over a frozen level, styled to that level's era. The level scene itself is
// paused by Phaser (its timers, tweens, physics and input stop); this scene sits on top.
const COPY = {
  dos: { kicker: 'SYSTEM HALTED', title: 'PAUSED' },
  y2k: { kicker: 'Game paused', title: 'Paused' },
  cloud: { kicker: 'Game paused', title: 'Paused' },
  ai: { kicker: 'Game paused', title: 'Paused' },
};

export default class Pause extends Base {
  constructor() { super('Pause'); }

  create(data) {
    this.level = data.level;
    this.eraKey = data.era;
    this.overlayScene = true; // no backdrop, fade or zoom: the frozen level shows behind
    this.th = THEMES[data.era];
    super.create(data);
  }

  build() {
    this.th = THEMES[this.eraKey];
    pauseAudio(true);
    document.getElementById('pause').hidden = true;
    const c = COPY[this.eraKey];
    this.ask({
      kicker: c.kicker,
      title: c.title,
      body: 'Everything is frozen until you come back.',
      buttons: [
        { label: 'Resume', onClick: () => this.resume() },
        { label: 'Restart level', onClick: () => this.restart() },
        { label: 'Quit to title', onClick: () => this.quit() },
      ],
      keys: { Enter: () => this.resume(), Escape: () => this.resume() },
    });
  }

  resume() {
    pauseAudio(false);
    document.getElementById('pause').hidden = false;
    this.scene.resume(this.level);
    this.scene.stop();
  }

  restart() {
    pauseAudio(false);
    this.scene.stop(this.level);
    this.scene.start(this.level);
  }

  quit() {
    pauseAudio(false);
    this.scene.stop(this.level);
    this.scene.start('Title');
  }
}
