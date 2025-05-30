export class BooleanHelper {
  private static TRUE_STRING = 'true';

  private static FALSE_STRING = 'false';

  private static TRUE_NUMBER = 1;

  private static FALSE_NUMBER = 0;

  public static isStringBoolean(val: string) {
    return [BooleanHelper.TRUE_STRING, BooleanHelper.FALSE_STRING].includes(val);
  }

  public static toBoolean(val: unknown): boolean | undefined {
    if (typeof val === 'boolean') {
      return val;
    }
    if (typeof val === 'string') {
      const isTrue = val === BooleanHelper.TRUE_STRING;
      if (isTrue) {
        return true;
      }
      const isFalse = val === BooleanHelper.FALSE_STRING;
      if (isFalse) {
        return false;
      }
    }
    return undefined;
  }

  public static toBooleanIgnoredCase(val: unknown) {
    if (typeof val === 'boolean') {
      return val;
    }
    if (typeof val === 'string') {
      const lowerCase = val.toLowerCase();
      const isTrue = lowerCase === BooleanHelper.TRUE_STRING;
      if (isTrue) {
        return true;
      }
      const isFalse = lowerCase === BooleanHelper.FALSE_STRING;
      if (isFalse) {
        return false;
      }
    }
    return undefined;
  }

  public static isTrue(val: boolean | string | null | undefined): boolean {
    const boolValue = BooleanHelper.toBoolean(val);
    if (boolValue == null) {
      return false;
    }
    return boolValue;
  }

  public static isFalse(val: boolean | string | null | undefined): boolean {
    const boolValue = BooleanHelper.toBoolean(val);
    if (boolValue == null) {
      return false;
    }
    return !boolValue;
  }

  public static toNumber(val: boolean | null | undefined): number {
    return val ? BooleanHelper.TRUE_NUMBER : BooleanHelper.FALSE_NUMBER;
  }

  public static toString(val: boolean | null | undefined): string {
    return val ? BooleanHelper.TRUE_STRING : BooleanHelper.FALSE_STRING;
  }
}
