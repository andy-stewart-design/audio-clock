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

  public synth(type: OscillatorType = "sine") {
    const synth = new Synth(this, type);
    this.addInstruments(synth);
    return synth;
  }

  get duration() {
    return this._duration;
  }
}

// import Synth from "./synth";

// export class AudioClock {
//   readonly ctx = new AudioContext();
//   private instruments: Synth[] = [];
//   private _duration;
//   private intervalID: number | undefined;
//   private tick = 0;
//   private phase = 0;
//   private precision = 10 ** 4;
//   private minLatency = 0.01;
//   private interval = 0.1;
//   private overlap = 0.05;
//   public paused = true;

//   private pauseTime = 0; // 🆕 store when we paused
//   private pauseOffset = 0; // 🆕 total pause time to subtract from currentTime

//   constructor(duration: number = 0.5) {
//     this._duration = duration;
//   }

//   private onTick() {
//     const t = this.ctx.currentTime - this.pauseOffset; // 🆕 account for pause time
//     const lookahead = t + this.interval + this.overlap;
//     if (this.phase === 0) {
//       this.phase = t + this.minLatency;
//     }

//     while (this.phase < lookahead) {
//       this.phase = Math.round(this.phase * this.precision) / this.precision;
//       if (this.phase >= t) {
//         this.instruments.forEach((inst) =>
//           inst.play(this.phase + this.pauseOffset)
//         ); // 🆕 add back offset for scheduling
//       }
//       this.phase += this._duration;
//       this.tick++;
//       console.log(`Starting iteration ${this.tick}`);
//     }
//   }

//   public start() {
//     if (!this.paused) return;

//     const now = this.ctx.currentTime;
//     if (this.pauseTime > 0) {
//       this.pauseOffset += now - this.pauseTime; // 🆕 adjust total pause time
//     }

//     this.paused = false;
//     this.onTick();
//     this.intervalID = setInterval(this.onTick.bind(this), this.interval * 1000);
//   }

//   public pause() {
//     if (this.paused) return;
//     clearInterval(this.intervalID);
//     this.paused = true;
//     this.pauseTime = this.ctx.currentTime; // 🆕 remember when we paused
//   }

//   public stop() {
//     this.tick = 0;
//     this.phase = 0;
//     this.pauseOffset = 0; // 🆕 reset pause state
//     this.pauseTime = 0;
//     this.pause();
//   }

//   public setDuration(setter: (n: number) => number) {
//     this._duration = setter(this._duration);
//   }

//   public addInstruments(inst: Synth, replace = false) {
//     if (replace) this.instruments = [inst];
//     else this.instruments.push(inst);
//   }

//   public synth(type: OscillatorType = "sine") {
//     const synth = new Synth(this, type);
//     this.addInstruments(synth);
//     return synth;
//   }

//   get duration() {
//     return this._duration;
//   }
// }
