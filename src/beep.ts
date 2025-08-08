interface ADSRParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface FilterParams {
  type: BiquadFilterType;
  frequency: number;
  Q?: number;
}

interface BeepOptions {
  ctx: AudioContext;
  time: number;
  waveform?: OscillatorType;
  frequency?: number;
  duration?: number;
  adsr?: ADSRParams;
  totalVoices?: number;
  filter?: FilterParams;
}

const defaultAdsr = {
  attack: 0.01,
  decay: 0.2,
  sustain: 0.0,
  release: 0.1,
};

function beep({
  ctx,
  time,
  waveform = "sine",
  frequency: freq = 330,
  duration = 0.5,
  adsr = defaultAdsr,
  totalVoices = 1,
  filter,
}: BeepOptions) {
  const t = time + 0.01;

  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const f = filter ? ctx.createBiquadFilter() : null;

  if (f && filter) {
    f.type = filter.type;
    f.frequency.value = filter.frequency;
    if (filter.Q !== undefined) {
      f.Q.value = filter.Q;
    }
  }

  o.frequency.value = freq;
  o.type = waveform;
  o.start(t);
  o.stop(t + duration);

  // ADSR Envelope
  const maxVolume = 1 / totalVoices;
  const sustainLevel = maxVolume * adsr.sustain;

  const minDuration = adsr.attack + adsr.decay + adsr.release;
  const scale = duration < minDuration ? duration / minDuration : 1;

  // Calculate time points
  const attackEnd = t + adsr.attack * scale;
  const decayEnd = attackEnd + adsr.decay * scale;
  const sustainEnd = t + duration - adsr.release * scale;
  const releaseEnd = t + duration;

  g.gain.setValueAtTime(0, t);
  // Attack
  g.gain.linearRampToValueAtTime(maxVolume, attackEnd);
  // Decay
  g.gain.linearRampToValueAtTime(sustainLevel, decayEnd);
  // Sustain
  g.gain.setValueAtTime(sustainLevel, sustainEnd);
  // Release
  g.gain.linearRampToValueAtTime(0, releaseEnd);

  // Connect the audio chain
  if (f) {
    // oscillator -> filter -> gain -> destination
    o.connect(f);
    f.connect(g);
  } else {
    // oscillator -> gain -> destination
    o.connect(g);
  }

  g.connect(ctx.destination);
}

export { beep };
