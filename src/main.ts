import { AudioClock } from "./clock";

const cps = 0.5 * 4;
const drome = new AudioClock(cps);
const synth = drome.synth().note([261.63, 329.63, 392.0, 493.88]);

const playSynth = (s: OscillatorType) => {
  synth.sound(s);
  if (drome.paused) drome.start();
};

const on = (event: string, id: string, callback: () => void) =>
  document.getElementById(id)?.addEventListener(event, callback);

on("click", "sine-wave", () => playSynth("sine"));
on("click", "tri-wave", () => playSynth("triangle"));
on("click", "saw-wave", () => playSynth("sawtooth"));
on("click", "square-wave", () => playSynth("square"));
on("click", "pause-cycle", () => drome.pause());
on("click", "stop-cycle", () => drome.stop());
on("click", "slower-cycle", () => drome.setDuration((d: number) => d * 1.1));
on("click", "faster-cycle", () => drome.setDuration((d: number) => d * 0.9));
