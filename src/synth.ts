import { beep } from "./beep";
import type { AudioClock } from "./clock";
import { euclid } from "./euclid";

class Synth {
  private ctx: AudioContext;
  private duration: number;
  private notes: number[] = [261.63];
  private noteOffsets: number | number[] = 0;
  private pattern: number[] | null = null;
  private waveform: OscillatorType = "sine";
  private adsr = { attack: 0.01, decay: 0.2, sustain: 0.0, release: 0.1 };

  constructor(clock: AudioClock) {
    this.ctx = clock.ctx;
    this.duration = clock.duration;
  }

  public note(n: number | number[]) {
    this.notes = Array.isArray(n) ? n : [n];
    this.noteOffsets = this.duration / this.notes.length;
    return this;
  }

  public sound(s: OscillatorType) {
    this.waveform = s;
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

  public euclid(pulses: number, steps: number) {
    // TODO: get rid of pattern variable and use offset instead
    this.pattern = euclid(pulses, steps);
    const totalNotes = steps;
    this.noteOffsets = this.duration / totalNotes;

    // Expand or loop notes if needed
    this.notes = Array.from(
      { length: steps },
      (_, i) => this.notes[i % this.notes.length]
    );

    console.log(`Euclidean pattern:`, this.pattern, this.notes);

    return this;
  }

  public play(time: number) {
    this.notes?.forEach((frequency, i) => {
      const { ctx, duration, waveform, noteOffsets, adsr, pattern } = this;
      if (pattern && pattern[i % pattern.length] === 0) return; // Skip silent step
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
      });
    });
  }
}

export default Synth;
