type AudioClockCallback = (time: number) => void;

export class AudioClock {
  readonly ctx = new AudioContext();
  private callback: AudioClockCallback | undefined;
  private _duration;
  private intervalID: number | undefined;
  private tick = 0;
  private phase = 0;
  private precision = 10 ** 4;
  private minLatency = 0.01;
  private interval = 0.1;
  private overlap = 0.05;
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
      this.phase >= t && this.callback?.(this.phase);
      this.phase += this._duration; // increment phase by duration
      this.tick++;
    }
  }

  public start(cb: AudioClockCallback, d?: number, i?: number, o?: number) {
    if (!this.paused) return;

    this.callback = cb;
    if (d) this._duration = d;
    if (i) this.interval = i;
    if (o) this.overlap = o;

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

  public setCallback(cb: AudioClockCallback) {
    this.callback = cb;
  }

  public setDuration(setter: (n: number) => number) {
    this._duration = setter(this._duration);
  }

  get duration() {
    return this._duration;
  }
}
