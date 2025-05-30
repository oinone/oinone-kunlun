import { get as getValue } from 'lodash-es';

export type SortDirection = 'asc' | 'desc' | false;

export type CompareResult = -1 | 0 | 1;

export interface SortOption {
  field: string;
  direction?: SortDirection;
  compare?: (a: unknown, b: unknown) => CompareResult;
}

export class SortHelper {
  public static asc(a: unknown, b: unknown): CompareResult {
    const compare = SortHelper.baseCompare(a, b);
    if (compare != null) {
      return compare;
    }
    if (SortHelper.isCompareValue(a) && SortHelper.isCompareValue(b)) {
      if (a < b) {
        return -1;
      }
      return 1;
    }
    return 0;
  }

  public static desc(a: unknown, b: unknown): CompareResult {
    const compare = SortHelper.baseCompare(a, b);
    if (compare != null) {
      return compare;
    }
    if (SortHelper.isCompareValue(a) && SortHelper.isCompareValue(b)) {
      if (a < b) {
        return 1;
      }
      return -1;
    }
    return 0;
  }

  public static sort(list: Record<string, unknown>[], sortOptions: SortOption[]) {
    list.sort((a, b) => {
      let compareValue: CompareResult;
      for (const sortOption of sortOptions) {
        const { field, direction, compare } = sortOption;
        if (direction === false) {
          return 0;
        }
        const av = getValue(a, field);
        const bv = getValue(b, field);
        let compareFn = compare;
        if (!compareFn) {
          compareFn = SortHelper.asc;
          if (direction === 'desc') {
            compareFn = SortHelper.desc;
          }
        }
        compareValue = compareFn(av, bv);
        if (compareValue !== 0) {
          return compareValue;
        }
      }
      return 0;
    });
  }

  private static isCompareValue(val: unknown): val is string | number {
    const type = typeof val;
    return ['string', 'number'].includes(type);
  }

  private static baseCompare(a: unknown, b: unknown): CompareResult | undefined {
    if (a === b) {
      return 0;
    }
    const an = a == null;
    const bn = b == null;
    if (an && bn) {
      return 0;
    }
    if (an) {
      return -1;
    }
    if (bn) {
      return 1;
    }
  }
}
