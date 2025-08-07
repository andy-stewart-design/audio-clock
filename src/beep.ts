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
  attack: 0.0,
  decay: 0.2,
  sustain: 0.0,
  release: 0.0,
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

  // Create filter if specified
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

  // Calculate time points
  const attackEnd = t + adsr.attack;
  const decayEnd = attackEnd + adsr.decay;
  const sustainEnd = t + duration - adsr.release;
  const releaseEnd = t + duration;

  // Ensure we don't have overlapping phases for short durations
  const minDuration = adsr.attack + adsr.decay + adsr.release;
  if (duration < minDuration) {
    // For very short notes, scale down the envelope proportionally
    const scale = duration / minDuration;
    const scaledAttack = adsr.attack * scale;
    const scaledDecay = adsr.decay * scale;
    const scaledRelease = adsr.release * scale;

    const scaledAttackEnd = t + scaledAttack;
    const scaledDecayEnd = scaledAttackEnd + scaledDecay;
    const scaledSustainEnd = t + duration - scaledRelease;

    // Attack
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(maxVolume, scaledAttackEnd);

    // Decay
    if (scaledDecayEnd <= scaledSustainEnd) {
      g.gain.linearRampToValueAtTime(sustainLevel, scaledDecayEnd);
      // Sustain
      g.gain.setValueAtTime(sustainLevel, scaledSustainEnd);
    }

    // Release
    g.gain.linearRampToValueAtTime(0, releaseEnd);
  } else {
    // Normal ADSR envelope for longer notes

    // Attack phase
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(maxVolume, attackEnd);

    // Decay phase
    g.gain.linearRampToValueAtTime(sustainLevel, decayEnd);

    // Sustain phase
    g.gain.setValueAtTime(sustainLevel, sustainEnd);

    // Release phase
    g.gain.linearRampToValueAtTime(0, releaseEnd);
  }

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
