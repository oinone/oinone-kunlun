class RawValue {
  public constructor(public value: string) {}
}

const isRawValue = (v: unknown): v is RawValue => v instanceof RawValue;

export { RawValue, isRawValue };
