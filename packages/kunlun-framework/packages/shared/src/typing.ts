import BigNumber from 'bignumber.js';

/**
 * 标准返回空值
 */
export type ReturnVoid = null | undefined | void;

/**
 * 标准异步返回类型
 */
export type ReturnPromise<T, P = T> = T | Promise<P>;

/**
 * <h3>泛化入参类型</h3>
 * 根据泛化入参类型自动推断泛化返回类型
 * <p>
 * 示例:
 * <p>
 * function dateFormat<T extends Date | undefined>(date: GenericType<T>): GenericReturnType<T, string>
 * <p>
 * 解释说明:
 * <p>
 * 当入参input为Date类型时，自动推断返回类型为string；
 * <p>
 * 当入参input为Date | undefined类型时，自动推断返回类型为string | undefined；
 */
export type GenericType<T> = T extends null ? null : T extends undefined ? undefined : T;

/**
 * 泛化返回类型
 */
export type GenericReturnType<T, R> = T extends null ? null : T extends undefined ? undefined : R;

/**
 * 标准字符串
 */
export type StandardString = string | null | undefined;

/**
 * 标准数字
 */
export type StandardNumber = number | string | null | undefined;

/**
 * 标准布尔
 */
export type StandardBoolean = 'true' | 'false' | boolean | null | undefined;

/**
 * 标准枚举
 */
export type StandardEnumerationValue = number | boolean | StandardString;

/**
 * 标准日期/时间范围
 */
export type StandardDateTimeRangeValue = [StandardString, StandardString] | null | undefined;

/**
 * 非空类型
 */
export type NonNullable<T> = Exclude<T, null | undefined>;

/**
 * 可空类型
 */
export type Nullable<T> = NonNullable<T> | null | undefined;

/**
 * 判空类型
 */
export type PredictNullable<T1, T2> = T2 extends null | undefined ? T2 | NonNullable<T1> : NonNullable<T1>;

/**
 * 可计算类型
 */
const ComputableTypes1: string[] = ['number', 'bigint', 'boolean'];

/**
 * 可计算类型
 */
const ComputableTypes2: string[] = ['string', 'number', 'bigint', 'boolean'];

/**
 * 可计算类型声明
 */
export type ComputableType = string | number | bigint | boolean | BigNumber;

/**
 * 可空可计算类型声明
 */
export type NullableComputableType = ComputableType | null | undefined;

/**
 * 是否为可计算值
 * @param value 任意值
 * @param hasString 是否包含字符串
 */
export function isComputableType(value: unknown, hasString?: boolean): value is ComputableType {
  let types = ComputableTypes1;
  if (hasString) {
    types = ComputableTypes2;
  }
  return value != null && (value instanceof BigNumber || types.includes(typeof value));
}

/**
 * 是否为可计算值
 * @param value 任意值
 * @param hasString 是否包含字符串
 */
export function isNullableComputableType(value: unknown, hasString?: boolean): value is NullableComputableType {
  let types = ComputableTypes1;
  if (hasString) {
    types = ComputableTypes2;
  }
  return value == null || value instanceof BigNumber || types.includes(typeof value);
}
