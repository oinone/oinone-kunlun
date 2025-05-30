import { isNaN, isNil, isString, toNumber, trim } from 'lodash-es';
import { BigNumber } from './BigNumber';
import { NullableComputableType, StandardNumber } from './typing';

export class NumberHelper {
  private static RADIX_POINT = '.';

  public static toNumber(val: StandardNumber): number | null | undefined {
    if (isNil(val)) {
      return val;
    }
    if (isString(val)) {
      val = val.trim();
      if (!val) {
        return undefined;
      }
    }
    const num = Number(val);
    if (isNaN(num)) {
      return undefined;
    }
    return num;
  }

  public static toBigNumber(val: StandardNumber): BigNumber | null | undefined {
    if (isNil(val)) {
      return val;
    }
    const num = new BigNumber(val);
    if (num.isNaN()) {
      return undefined;
    }
    return num;
  }

  public static isNumber(val: string | null | undefined): boolean {
    const num = NumberHelper.toBigNumber(val);
    if (isNil(num)) {
      return false;
    }
    return val!.indexOf('.') !== val!.length - 1;
  }

  /**
   * a + b
   * @param a
   * @param b
   */
  public static add(a: NullableComputableType, b: NullableComputableType): number {
    return NumberHelper.operator(a, b, (av, bv) => {
      const c = av.toString();
      const d = bv.toString();
      const e = 10 ** NumberHelper.getDecimalMaxLength(c, d);
      const left = NumberHelper.multiply(c, e);
      const right = NumberHelper.multiply(d, e);
      return NumberHelper.divide(left + right, e);
    });
  }

  /**
   * a - b
   * @param a
   * @param b
   */
  public static subtract(a: NullableComputableType, b: NullableComputableType): number {
    return NumberHelper.operator(a, b, (av, bv) => {
      const c = av.toString();
      const d = bv.toString();
      const e = 10 ** NumberHelper.getDecimalMaxLength(c, d);
      const left = NumberHelper.multiply(c, e);
      const right = NumberHelper.multiply(d, e);
      return NumberHelper.divide(left - right, e);
    });
  }

  /**
   * a * b
   * @param a
   * @param b
   */
  public static multiply(a: NullableComputableType, b: NullableComputableType): number {
    return NumberHelper.operator(a, b, (av, bv) => {
      const c = av.toString();
      const d = bv.toString();
      let e = 0;
      e += NumberHelper.getDecimalLength(c);
      e += NumberHelper.getDecimalLength(d);
      return (
        (Number(c.replace(NumberHelper.RADIX_POINT, '')) * Number(d.replace(NumberHelper.RADIX_POINT, ''))) / 10 ** e
      );
    });
  }

  /**
   * a / b
   * @param a
   * @param b
   */
  public static divide(a: NullableComputableType, b: NullableComputableType): number {
    return NumberHelper.operator(a, b, (av, bv) => {
      const c = av.toString();
      const d = bv.toString();
      const e = NumberHelper.getDecimalLength(c);
      const f = NumberHelper.getDecimalLength(d);
      return (
        (Number(c.replace(NumberHelper.RADIX_POINT, '')) / Number(d.replace(NumberHelper.RADIX_POINT, ''))) *
        10 ** (f - e)
      );
    });
  }

  /**
   * <code>
   * if a < b return -1;
   * else if a > b return 1;
   * else return 0;
   * </code>
   * @param a
   * @param b
   */
  public static compare(a: NullableComputableType, b: NullableComputableType) {
    return NumberHelper.operator(a, b, (av, bv) => {
      return av.comparedTo(bv);
    });
  }

  private static operator(
    a: NullableComputableType,
    b: NullableComputableType,
    fn: (av: BigNumber, bv: BigNumber) => number
  ): number {
    if (a == null || a === false) {
      a = 0;
    } else if (a === true) {
      a = 1;
    }
    if (b == null || b === false) {
      b = 0;
    } else if (b === true) {
      b = 1;
    }
    if (!(a instanceof BigNumber)) {
      a = new BigNumber(a as number);
    }
    if (!(b instanceof BigNumber)) {
      b = new BigNumber(b as number);
    }
    if (a.isNaN() || b.isNaN()) {
      return NaN;
    }
    return fn(a, b);
  }

  private static getDecimalLength(num: number | string): number {
    let decimal;
    try {
      decimal = num.toString().split('.')[1]?.length;
    } catch (e) {
      decimal = 0;
    }
    return decimal || 0;
  }

  private static getDecimalMaxLength(a: number | string, b: number | string): number {
    return Math.max(NumberHelper.getDecimalLength(a), NumberHelper.getDecimalLength(b));
  }

  public static isNumericString(s: unknown): s is NullableComputableType {
    return (!isString(s) || (!!s.length && s.length === trim(s).length)) && Number.isFinite(Number(s));
  }

  public static lt(left: unknown, right: unknown): string | boolean {
    const ln = NumberHelper.isNumericString(left);
    const rn = NumberHelper.isNumericString(right);
    if (!ln && !rn) {
      return `${left}<${right}`;
    }
    if (ln && rn) {
      return toNumber(left) < toNumber(right);
    }
    if (isNil(left) && rn) {
      return toNumber(right) > 0;
    }
    if (isNil(right) && ln) {
      return toNumber(left) < 0;
    }
    return (left as number) < (right as number);
  }

  public static le(left: unknown, right: unknown): string | boolean {
    const ln = NumberHelper.isNumericString(left);
    const rn = NumberHelper.isNumericString(right);
    if (!ln && !rn) {
      return `${left}<=${right}`;
    }
    if (ln && rn) {
      return toNumber(left) <= toNumber(right);
    }
    if (isNil(left) && rn) {
      return toNumber(right) >= 0;
    }
    if (isNil(right) && ln) {
      return toNumber(left) <= 0;
    }
    return (left as number) <= (right as number);
  }

  /**
   * left > right
   * @param left
   * @param right
   */
  public static gt(left: unknown, right: unknown): string | boolean {
    const ln = NumberHelper.isNumericString(left);
    const rn = NumberHelper.isNumericString(right);
    if (!ln && !rn) {
      return `${left}>${right}`;
    }
    if (ln && rn) {
      return toNumber(left) > toNumber(right);
    }
    if (isNil(left) && rn) {
      return toNumber(right) < 0;
    }
    if (isNil(right) && ln) {
      return toNumber(left) > 0;
    }
    return (left as number) > (right as number);
  }

  public static ge(left: unknown, right: unknown): string | boolean {
    const ln = NumberHelper.isNumericString(left);
    const rn = NumberHelper.isNumericString(right);
    if (!ln && !rn) {
      return `${left}>=${right}`;
    }
    if (ln && rn) {
      return toNumber(left) >= toNumber(right);
    }
    if (isNil(left) && rn) {
      return toNumber(right) <= 0;
    }
    if (isNil(right) && ln) {
      return toNumber(left) >= 0;
    }
    return (left as number) >= (right as number);
  }
}

/**
 * @deprecated please using NumberHelper
 * @since 5.0
 */
export class NumberUtils {
  /**
   * a + b
   * @param a
   * @param b
   */
  public static add(a: StandardNumber, b: StandardNumber): number {
    return NumberHelper.add(a, b);
  }

  /**
   * a - b
   * @param a
   * @param b
   */
  public static subtract(a: StandardNumber, b: StandardNumber): number {
    return NumberHelper.subtract(a, b);
  }

  /**
   * a * b
   * @param a
   * @param b
   */
  public static multiply(a: StandardNumber, b: StandardNumber): number {
    return NumberHelper.multiply(a, b);
  }

  /**
   * a / b
   * @param a
   * @param b
   */
  public static divide(a: StandardNumber, b: StandardNumber): number {
    return NumberHelper.divide(a, b);
  }

  public static isNumericString(str) {
    return NumberHelper.isNumericString(str);
  }
}
