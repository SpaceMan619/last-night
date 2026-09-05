/* Original generative score for Last Night. All sound is synthesized locally. */
(() => {
  'use strict';
  class NightScore {
    constructor(context) {
      this.context = context;
      this.bus = context.createGain(); this.bus.gain.value = 0.2;
      this.compressor = context.createDynamicsCompressor();
      this.bus.connect(this.compressor).connect(context.destination);
      this.delay = context.createDelay(1); this.delay.delayTime.value = 0.3846;
      this.feedback = context.createGain(); this.feedback.gain.value = .23;
      this.wet = context.createGain(); this.wet.gain.value = .16;
      this.delay.connect(this.feedback).connect(this.delay); this.delay.connect(this.wet).connect(this.bus);
      this.step = 0; this.next = context.currentTime + .08; this.chapter = 0;
      this.enabled = true; this.paused = false; this.ending = false;
      this.noise = context.createBuffer(1, context.sampleRate * .15, context.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * .035));
      this.timer = setInterval(() => this.schedule(), 70);
    }
    setEnabled(on) { this.enabled = on; this.level(); }
    setPaused(on) { this.paused = on; this.level(); }
    level() { this.bus.gain.setTargetAtTime(this.enabled ? (this.paused ? .035 : .2) : 0, this.context.currentTime, .12); }
    tone(midi, when, duration, volume, wave = 'triangle', echo = false) {
      const c = this.context, o = c.createOscillator(), g = c.createGain();
      o.type = wave; o.frequency.value = 440 * 2 ** ((midi - 69) / 12);
      g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(volume, when + .025);
      g.gain.exponentialRampToValueAtTime(.0001, when + duration);
      o.connect(g); g.connect(this.bus); if (echo) g.connect(this.delay);
      o.start(when); o.stop(when + duration + .03);
      o.onended = () => { o.disconnect(); g.disconnect(); };
    }
    hat(when, volume) {
      const c = this.context, source = c.createBufferSource(), filter = c.createBiquadFilter(), g = c.createGain();
      source.buffer = this.noise; filter.type = 'highpass'; filter.frequency.value = 4800;
      g.gain.value = volume; source.connect(filter).connect(g).connect(this.bus); source.start(when);
      source.onended = () => { source.disconnect(); filter.disconnect(); g.disconnect(); };
    }
    schedule() {
      const c = this.context, tick = 60 / 78 / 4;
      if (c.state !== 'running') return;
      if (this.next < c.currentTime) this.next = c.currentTime + .04;
      while (this.next < c.currentTime + .18) {
        const beat = this.step % 16, bar = Math.floor(this.step / 16) % 8;
        // D minor / B-flat / F / C; the skyline opens into major-seventh voicings.
        const roots = [50, 46, 53, 48, 50, 46, 55, 48];
        const root = roots[bar], minor = bar === 0 || bar === 4 || bar === 6;
        const voicing = [0, minor ? 3 : 4, 7, this.chapter === 2 ? 11 : 10];
        if (beat === 0) {
          voicing.forEach((interval, i) => this.tone(root + interval + 12, this.next + i * .035, 3, .045, 'sine', true));
          this.tone(root - 12, this.next, 1.9, .16, 'sine');
        }
        if ([0, 8].includes(beat)) this.tone(31, this.next, .15, .18, 'sine');
        if (beat % 4 === 2) this.hat(this.next, this.chapter === 1 ? .12 : .055);
        const motif = [0, 7, 12, 10, 7, 3, 5, 7];
        if (beat % 2 === 0 && !(bar % 4 === 3 && beat > 8)) {
          const note = motif[(beat / 2 + (bar % 2) * 2) % motif.length];
          this.tone(root + 24 + note, this.next, .7, .05, 'triangle', true);
        }
        if (this.chapter > 0 && beat === 10) this.tone(root + 7, this.next, .65, .075);
        this.step++; this.next += tick;
      }
    }
  }
  window.NightScore = NightScore;
})();
