const examples = [
  `drome.synth("square",12).note(57).euclid(3,8).adsr(0.001,0.333)

drome.synth("sawtooth").note([43, 43, 43, 50, 43, 43, 53, 54])
  .lpf(800).adsr(0.001, 0.25).fast(2).gain(1.5)`,
  `drome.synth().note(60).adsr(0.25, 0.1, 0).euclid(4, 4).lpf(400).gain(1.25)

drome.synth("sawtooth", 8).note(48).euclid(3, 8).dec(0.5).sus(0.2)`,
  `const struct = drome.euclid(5,8).stretch(4);
  
drome.synth("sawtooth",12).struct(struct).adsr(0, 0.1);`,
];

export { examples };
