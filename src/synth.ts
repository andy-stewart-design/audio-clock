import { beep } from "./beep";
import type { AudioClock } from "./clock";

class Synth {
  private ctx: AudioContext;
  private duration: number;
  private notes: number[] = [261.63];
  private noteOffsets: number | number[] = 0;
  private waveform: OscillatorType = "sine";
  private adsr = { attack: 0.0, decay: 0.2, sustain: 0.0, release: 0.0 };

  constructor(clock: AudioClock) {
    this.ctx = clock.ctx;
    this.duration = clock.duration;
  }

  public note(n: number | number[]) {
    const numNotes = Array.isArray(n) ? n.length : 1;
    this.notes = Array.isArray(n) ? n : [n];
    this.noteOffsets = this.duration / numNotes;
    return this;
  }

  public sound(s: OscillatorType) {
    this.waveform = s;
    return this;
  }

  public play(time: number) {
    console.log(this.notes);

    this.notes?.forEach((frequency, i) => {
      const { ctx, duration, waveform, noteOffsets, adsr } = this;
      const offset = Array.isArray(noteOffsets) ? noteOffsets[i] : noteOffsets;
      const t = time + offset * i;
      const totalVoices = 1;
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
