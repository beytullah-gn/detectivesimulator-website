"use client";

// Procedural noir soundscape (rain, minor-key pads, upright bass, sparse piano) and UI sound effects.
// Everything is synthesized with Web Audio, so there are no audio assets to license or download.

const SETTINGS_KEY = "ds_sound_v1";
const DEFAULT_SETTINGS = { music: true, sfx: true };

// Dm9, Bbmaj7, Gm9, A7(b9) — a slow minor loop, as MIDI note numbers.
const CHORDS = [
  { root: 38, notes: [50, 53, 57, 60, 64] },
  { root: 34, notes: [46, 50, 53, 57, 62] },
  { root: 31, notes: [43, 46, 50, 53, 57] },
  { root: 33, notes: [45, 49, 52, 55, 58] },
];
const CHORD_SECONDS = 9;

const midiToHz = (note) => 440 * 2 ** ((note - 69) / 12);

export function readSoundSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

class Soundscape {
  constructor() {
    this.ctx = null;
    this.settings = readSoundSettings();
    this.listeners = new Set();
    this.musicTimer = null;
    this.rainSource = null;
    this.nextChordAt = 0;
    this.chordIndex = 0;
    this.duckCount = 0;
  }

  ensureContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      const ctx = new AudioContextClass();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(ctx.destination);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0;
      this.musicBus.connect(this.master);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = 0.55;
      this.sfxBus.connect(this.master);
      this.reverb = ctx.createConvolver();
      this.reverb.buffer = this.createImpulse(3.2);
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.55;
      this.reverb.connect(reverbGain).connect(this.musicBus);
      this.noiseBuffer = this.createNoise(4);
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  createImpulse(seconds) {
    const { sampleRate } = this.ctx;
    const length = Math.floor(sampleRate * seconds);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.6;
      }
    }
    return impulse;
  }

  createNoise(seconds) {
    const { sampleRate } = this.ctx;
    const buffer = this.ctx.createBuffer(1, Math.floor(sampleRate * seconds), sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      // Gently filtered noise reads as rain rather than hiss.
      last = 0.97 * last + 0.03 * (Math.random() * 2 - 1);
      data[i] = last * 6 + (Math.random() * 2 - 1) * 0.08;
    }
    return buffer;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(patch) {
    this.settings = { ...this.settings, ...patch };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Settings simply reset on next visit.
    }
    if (this.settings.music) this.startMusic();
    else this.stopMusic();
    this.listeners.forEach((listener) => listener(this.settings));
  }

  // Called from a user gesture; browsers block audio until then.
  unlock() {
    if (!this.ensureContext()) return;
    if (this.settings.music) this.startMusic();
  }

  startMusic() {
    const ctx = this.ensureContext();
    if (!ctx || this.musicTimer) return;
    const target = this.duckCount > 0 ? 0.05 : 0.32;
    this.musicBus.gain.cancelScheduledValues(ctx.currentTime);
    this.musicBus.gain.setTargetAtTime(target, ctx.currentTime, 1.5);

    const rain = ctx.createBufferSource();
    rain.buffer = this.noiseBuffer;
    rain.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.value = 1800;
    rainFilter.Q.value = 0.4;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.16;
    rain.connect(rainFilter).connect(rainGain).connect(this.musicBus);
    rain.start();
    this.rainSource = rain;

    this.nextChordAt = ctx.currentTime + 0.2;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 400);
    this.scheduleMusic();
  }

  stopMusic() {
    if (!this.ctx || !this.musicTimer) return;
    window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    const now = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setTargetAtTime(0, now, 0.6);
    const rain = this.rainSource;
    this.rainSource = null;
    window.setTimeout(() => rain?.stop(), 3000);
  }

  duck(active) {
    this.duckCount = Math.max(0, this.duckCount + (active ? 1 : -1));
    if (!this.ctx || !this.musicTimer) return;
    const target = this.duckCount > 0 ? 0.05 : 0.32;
    this.musicBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
  }

  scheduleMusic() {
    const ctx = this.ctx;
    while (this.nextChordAt < ctx.currentTime + 1.5) {
      const chord = CHORDS[this.chordIndex % CHORDS.length];
      const start = this.nextChordAt;
      this.playPad(chord.notes, start, CHORD_SECONDS);
      this.playBass(chord, start);
      // Sparse piano: a few chord tones scattered across the bar.
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        const note = chord.notes[Math.floor(Math.random() * chord.notes.length)] + 12;
        this.playPiano(note, start + 1 + Math.random() * (CHORD_SECONDS - 2), 0.05);
      }
      this.nextChordAt += CHORD_SECONDS;
      this.chordIndex += 1;
    }
  }

  playPad(notes, start, duration) {
    const ctx = this.ctx;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 700;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.05, start + 2.5);
    gain.gain.setValueAtTime(0.05, start + duration - 2);
    gain.gain.linearRampToValueAtTime(0, start + duration + 1.5);
    filter.connect(gain);
    gain.connect(this.musicBus);
    gain.connect(this.reverb);
    notes.forEach((note, index) => {
      [-6, 6].forEach((detune) => {
        const osc = ctx.createOscillator();
        osc.type = index % 2 ? "triangle" : "sawtooth";
        osc.frequency.value = midiToHz(note);
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(start);
        osc.stop(start + duration + 2);
      });
    });
  }

  playBass(chord, start) {
    const pattern = [0, 7, 12, 10];
    const beat = CHORD_SECONDS / 4;
    pattern.forEach((interval, index) => {
      if (Math.random() < 0.25) return;
      this.pluck(midiToHz(chord.root + interval), start + index * beat, 0.11);
    });
  }

  pluck(frequency, time, level) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = frequency;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, time);
    filter.frequency.exponentialRampToValueAtTime(200, time + 0.9);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.6);
    osc.connect(filter).connect(gain).connect(this.musicBus);
    osc.start(time);
    osc.stop(time + 1.7);
  }

  playPiano(note, time, level, bus = this.musicBus) {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, time + 3.2);
    gain.connect(bus);
    if (bus === this.musicBus) gain.connect(this.reverb);
    [1, 2, 3.01].forEach((harmonic, index) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = midiToHz(note) * harmonic;
      const partial = ctx.createGain();
      partial.gain.value = [1, 0.35, 0.12][index];
      osc.connect(partial).connect(gain);
      osc.start(time);
      osc.stop(time + 3.3);
    });
  }

  noiseBurst({ time, duration, frequency, q = 1, level, type = "bandpass" }) {
    const ctx = this.ctx;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + duration * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    source.connect(filter).connect(gain).connect(this.sfxBus);
    source.start(time, Math.random() * 3);
    source.stop(time + duration + 0.05);
  }

  thump(time, from, to, level) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(from, time);
    osc.frequency.exponentialRampToValueAtTime(to, time + 0.25);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    osc.connect(gain).connect(this.sfxBus);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  play(name) {
    if (!this.settings.sfx) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + 0.01;

    switch (name) {
      case "paper":
        this.noiseBurst({ time: now, duration: 0.18, frequency: 3200, q: 0.7, level: 0.5 });
        this.noiseBurst({ time: now + 0.12, duration: 0.22, frequency: 2400, q: 0.6, level: 0.35 });
        break;
      case "pin":
        this.thump(now, 420, 160, 0.35);
        this.noiseBurst({ time: now, duration: 0.05, frequency: 5000, level: 0.3, type: "highpass" });
        break;
      case "type":
        this.noiseBurst({ time: now, duration: 0.035, frequency: 4200, q: 3, level: 0.22 });
        break;
      case "send":
        this.noiseBurst({ time: now, duration: 0.05, frequency: 3800, q: 2, level: 0.3 });
        this.noiseBurst({ time: now + 0.07, duration: 0.05, frequency: 3000, q: 2, level: 0.25 });
        break;
      case "hint":
        [76, 83, 88].forEach((note, index) => this.playPiano(note, now + index * 0.12, 0.09, this.sfxBus));
        break;
      case "stamp":
        this.thump(now, 140, 45, 0.9);
        this.noiseBurst({ time: now, duration: 0.12, frequency: 900, q: 0.8, level: 0.6 });
        break;
      case "accuse":
        this.thump(now, 90, 38, 1);
        [38, 45, 50].forEach((note) => this.playPiano(note, now, 0.12, this.sfxBus));
        break;
      case "success":
        [62, 66, 69, 74, 78].forEach((note, index) => this.playPiano(note, now + 0.35 + index * 0.14, 0.09, this.sfxBus));
        break;
      case "fail":
        [43, 44, 50].forEach((note) => this.playPiano(note, now + 0.35, 0.1, this.sfxBus));
        this.thump(now + 0.35, 70, 30, 0.6);
        break;
      default:
        break;
    }
  }
}

let instance = null;

export function getSoundscape() {
  if (!instance) instance = new Soundscape();
  return instance;
}

export function playSfx(name) {
  if (typeof window === "undefined") return;
  getSoundscape().play(name);
}
