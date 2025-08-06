import { AudioClock } from "./clock";
import Synth from "./synth";

const cps = 0.5 * 4;
const clock = new AudioClock(cps);

const on = (event: string, id: string, callback: () => void) =>
  document.getElementById(id)?.addEventListener(event, callback);

const foo = new Synth(clock)
  .note([261.63, 329.63, 392.0, 493.88])
  .sound("sine")
  .euclid(5, 8);

const playSynth = (s: OscillatorType) => {
  const cb = (t: number) => foo.sound(s).play(t);
  clock.paused ? clock.start(cb) : clock.setCallback(cb);
};

on("click", "sine-wave", () => playSynth("sine"));
on("click", "tri-wave", () => playSynth("triangle"));
on("click", "saw-wave", () => playSynth("sawtooth"));
on("click", "square-wave", () => playSynth("square"));
on("click", "pause-cycle", () => clock.pause());
on("click", "stop-cycle", () => clock.stop());
on("click", "slower-cycle", () => clock.setDuration((d: number) => d * 1.1));
on("click", "faster-cycle", () => clock.setDuration((d: number) => d * 0.9));
