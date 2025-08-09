import { euclid } from "./utils/euclid";

class DromeArray {
  private _value: number[];

  constructor(initialValue?: number[]) {
    this._value = initialValue ?? [];
  }

  public euclid(pulses: number, steps: number, rotation = 0) {
    this._value = euclid(pulses, steps, rotation);
    return this;
  }

  public stretch(n: number) {
    const steps = n * this._value.length;
    const nextValue = Array.from({ length: steps }, (_, i) => {
      const index = Math.floor(i / n);
      return this._value[index] ?? 0;
    });
    this._value = nextValue;
    return this;
  }

  get value() {
    return this._value;
  }
}

export default DromeArray;
