// audio.js — tiny WebAudio bleeps, synthesised on the spot, no files.
// Sound is optional: the game never waits for it, and a muted browser
// (or a headless screenshot run) plays on in silence.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  blip(freq, seconds, type = 'sine', gain = 0.08) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  }

  coin() {
    this.blip(1320, 0.12, 'triangle', 0.09);
    setTimeout(() => this.blip(1760, 0.16, 'triangle', 0.09), 70);
  }

  grab() {
    this.blip(880, 0.1, 'sine', 0.1);
    setTimeout(() => this.blip(1174, 0.14, 'sine', 0.1), 60);
  }

  smoke() {
    this.blip(220, 0.35, 'sawtooth', 0.05);
  }

  alarmTick() {
    this.blip(520, 0.09, 'square', 0.05);
  }

  caught() {
    this.blip(196, 0.5, 'sawtooth', 0.12);
    setTimeout(() => this.blip(147, 0.7, 'sawtooth', 0.12), 180);
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.22, 'triangle', 0.1), i * 110));
  }
}
