import { beep } from "./beep";
import type { AudioClock } from "./clock";
import { euclid } from "./euclid";
import { midiToFreq } from "./midi";

class Synth {
  private ctx: AudioContext;
  private duration: number;
  private notes: number[] = [261.63];
  private noteOffsets: number | number[] = 0;
  private waveform: OscillatorType = "sine";
  private adsr = { attack: 0.01, decay: 0.2, sustain: 0.0, release: 0.1 };
  private filterType: BiquadFilterType | null = null;
  private filterFreq: number | null = null;
  private filterQ: number = 1;

  constructor(clock: AudioClock, type: OscillatorType = "sine") {
    this.ctx = clock.ctx;
    this.duration = clock.duration;
    this.waveform = type;
  }

  public note(n: number | number[]) {
    const midiArray = Array.isArray(n) ? n : [n];
    this.notes = midiArray.map((n) => midiToFreq(n));
    this.noteOffsets = this.duration / this.notes.length;
    return this;
  }

  public sound(s: OscillatorType) {
    this.waveform = s;
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
        noteOffsets,
        adsr,
        filterFreq,
        filterType,
        filterQ,
      } = this;
      const offset = Array.isArray(noteOffsets) ? noteOffsets[i] : noteOffsets;
      const t = time + offset * i;
      const totalVoices = 1.5;

      beep({
        ctx,
        waveform,
        duration,
        frequency,
        time: t,
        adsr,
        totalVoices,
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
