import DromeArray from "./drome-array";
import Synth from "./synth";

type IterationCallback = (n: number) => void;

export class AudioClock {
  readonly ctx = new AudioContext();
  private instruments: Synth[] = [];
  private _duration;
  private intervalID: number | undefined;
  private tick = 0;
  private phase = 0;
  private precision = 10 ** 4;
  private minLatency = 0.01;
  private interval = 0.1;
  private overlap = 0.05;
  private iterationCallbacks: IterationCallback[] = [];
  public paused = true;

  constructor(duration: number = 0.5) {
    this._duration = duration;
  }

  private onTick() {
    const t = this.ctx.currentTime;
    const lookahead = t + this.interval + this.overlap; // the time window for this tick
    if (this.phase === 0) {
      this.phase = t + this.minLatency;
    }
    // callback as long as we're inside the lookahead
    while (this.phase < lookahead) {
      this.phase = Math.round(this.phase * this.precision) / this.precision;
      this.phase >= t &&
        this.instruments.forEach((inst) => inst.play(this.phase));
      this.phase += this._duration; // increment phase by duration
      this.tick++;
      this.iterationCallbacks.forEach((cb) => cb(this.tick));
    }
  }

  public start() {
    if (!this.paused) return;

    this.onTick();
    this.intervalID = setInterval(this.onTick.bind(this), this.interval * 1000);
    this.paused = false;
  }

  public pause() {
    clearInterval(this.intervalID);
    this.paused = true;
  }

  public stop() {
    this.tick = 0;
    this.phase = 0;
    this.pause();
  }

  public setDuration(setter: (n: number) => number) {
    this._duration = setter(this._duration);
  }

  public setBpm(bpm: number) {
    if (bpm <= 0) return;
    this._duration = (60 / bpm) * 4;
  }

  public addInstruments(inst: Synth, replace = false) {
    if (replace) this.instruments = [inst];
    else this.instruments.push(inst);
  }

  public clearInstruments() {
    this.instruments = [];
  }

  public onIterationStart(cb: (n: number) => void) {
    this.iterationCallbacks.push(cb);
  }

  public synth(
    type: Exclude<OscillatorType, "custom"> = "sine",
    harmonics?: number
  ) {
    const synth = new Synth(this, type, harmonics);
    this.addInstruments(synth);
    return synth;
  }

  public euclid(pulses: number, steps: number, rotation = 0) {
    return new DromeArray().euclid(pulses, steps, rotation);
  }

  public range(start: number, end?: number, stepOrIncl: number | boolean = 1) {
    return new DromeArray().range(start, end, stepOrIncl);
  }

  public stretch(arr: number[], stretchFactor: number) {
    return new DromeArray(arr).stretch(stretchFactor);
  }

  get duration() {
    return this._duration;
  }
}
