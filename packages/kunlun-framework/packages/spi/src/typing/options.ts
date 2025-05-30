/**
 * 匹配单值类型
 */
export type MatchSingleValue = string | number | boolean;

/**
 * 匹配多值类型
 */
export type MatchArrayValue = string | number;

/**
 * 匹配任意值
 */
export const MatchAnyValue = '__match__any_value__';

/**
 * 匹配优先级
 */
export const MatchPriorityKey = 'priority';

/**
 * 匹配值
 */
export type MatchValues = MatchSingleValue | MatchArrayValue[] | typeof MatchAnyValue;

/**
 * 可选项
 */
export interface Options {
  priority?: number;

  [key: string]: MatchValues | undefined;
}

/**
 * 可选项值是否为多值
 * @param value
 */
export function isMatchArrayValue(value: MatchValues): value is MatchArrayValue[] {
  return Array.isArray(value);
}

/**
 * 可选项值是否为任意值
 * @param value
 */
export function isMatchAnyValue(value: MatchValues | null | undefined): value is typeof MatchAnyValue {
  return value === MatchAnyValue;
}

/**
 * 匹配值是否不空
 * @param value
 */
export function matchValueIsNotEmpty(value: MatchValues | null | undefined): value is MatchValues {
  if (value == null) {
    return false;
  }
  if (typeof value === 'string') {
    return !!value;
  }
  if (Array.isArray(value)) {
    return !!value.length;
  }
  return true;
}
