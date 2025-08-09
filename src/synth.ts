// drome.synth().note(60).adsr(0.25, 0, 0).euclid(4, 4);
// drome.synth("sawtooth", 8).note(48).euclid(3, 8).dec(0.5).sus(0.2);

import { beep } from "./beep";
import type { AudioClock } from "./clock";
import { euclid } from "./euclid";
import { midiToFreq } from "./midi";

type OscType = Exclude<OscillatorType, "custom">;

class Synth {
  private ctx: AudioContext;
  private duration: number;
  private notes: number[] = [261.63];
  private noteOffsets: number | number[] = 0;
  private waveform: OscType = "sine";
  private harmonics: number | null = null;
  private _gain = 1;
  private _adsr = { attack: 0.001, decay: 0.001, sustain: 1.0, release: 0.001 };
  private filterType: BiquadFilterType | null = null;
  private filterFreq: number | null = null;
  private filterQ: number = 1;

  constructor(clock: AudioClock, type: OscType = "sine", harmonics?: number) {
    this.ctx = clock.ctx;
    this.duration = clock.duration;
    this.waveform = type;
    if (harmonics) this.harmonics = harmonics;
  }

  public note(n: number | number[]) {
    const midiArray = Array.isArray(n) ? n : [n];
    this.notes = midiArray.map((n) => midiToFreq(n));
    this.noteOffsets = this.duration / this.notes.length;
    return this;
  }

  public sound(type: OscType, harmonics?: number) {
    this.waveform = type;
    if (harmonics) this.harmonics = harmonics;
    return this;
  }

  public gain(n: number) {
    this._gain = n;
  }

  public adsr(a: number, d?: number, s?: number, r?: number) {
    this._adsr.attack = a || 0.001;
    this._adsr.decay = d || 0.001;
    this._adsr.sustain = s || 0;
    this._adsr.release = r || 0.001;
    return this;
  }

  public att(n: number) {
    this._adsr.attack = n || 0.01;
    return this;
  }

  public dec(n: number) {
    this._adsr.decay = n || 0.01;
    return this;
  }

  public sus(n: number) {
    this._adsr.sustain = n || 0.01;
    return this;
  }

  public rel(n: number) {
    this._adsr.release = n || 0.01;
    return this;
  }

  public hpf(frequency: number, q: number = 1) {
    this.filterType = "highpass";
    this.filterFreq = frequency;
    this.filterQ = q;
    return this;
  }

  public lpf(frequency: number, q: number = 1) {
    this.filterType = "lowpass";
    this.filterFreq = frequency;
    this.filterQ = q;
    return this;
  }

  public fast(multiplier: number) {
    const newLength = Math.floor(this.notes.length * multiplier);
    this.notes = Array.from(
      { length: newLength },
      (_, i) => this.notes[i % this.notes.length]
    );
    this.noteOffsets = this.duration / this.notes.length;
    return this;
  }

  public euclid(pulses: number, steps: number, rotation = 0) {
    const pattern = euclid(pulses, steps, rotation);
    const totalNotes = steps;
    this.noteOffsets = this.duration / totalNotes;

    let noteIndex = 0;
    this.notes = pattern.map((p) => {
      return p === 0 ? 0 : this.notes[noteIndex++ % this.notes.length];
    });

    return this;
  }

  public play(time: number) {
    this.notes?.forEach((frequency, i) => {
      if (frequency === 0) return; // Skip silent notes
      const {
        ctx,
        duration,
        waveform,
        harmonics,
        noteOffsets,
        _gain: gain,
        _adsr: adsr,
        filterFreq,
        filterType,
        filterQ,
      } = this;
      const offset = Array.isArray(noteOffsets) ? noteOffsets[i] : noteOffsets;
      const t = time + offset * i;

      beep({
        ctx,
        waveform,
        harmonics,
        duration,
        frequency,
        time: t,
        adsr,
        gain,
        filter:
          filterFreq && filterType
            ? {
                type: filterType,
                frequency: filterFreq,
                Q: filterQ,
              }
            : undefined,
      });
    });
  }
}

export default Synth;
