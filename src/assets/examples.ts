const examples = [
  `drome.synth("square",10).note(57).euclid(3,8).adsr(0.001,0.333)

drome.synth("sawtooth").note([43, 43, 43, 50, 43, 43, 53, 54])
  .lpf(600).adsr(0.001, 0.25).fast(2).gain(1.5)`,
];

export { examples };
