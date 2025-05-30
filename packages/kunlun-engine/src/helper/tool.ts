import { BigIntClass } from './bigint';

interface PartialPriority {
  priority?: number | string | undefined;
  [key: string]: any;
}

type BasicTypes = string | number | boolean;

/**
 * priority 排序函数
 * 默认从小到大排序，
 * @param priorityBigToSmall true 为从小到大排序，false 反之
 */
const sortByPriorityOrOtherKey = (arr: any[], priorityBigToSmall = true, key = 'priority'): any[] => {
  const jsbi = new BigIntClass();
  const sortFunc = <T extends PartialPriority>(a: T, b: T) => {
    if (a[key] == null || b[key] == null) {
      return 1;
    }

    if (priorityBigToSmall) {
      return jsbi.subtract(a[key], b[key]).toNumber();
    }

    return jsbi.subtract(b[key], a[key]).toNumber();
  };

  const smallerThanZeroArr: any[] = arr.filter((item) => jsbi.lessThan(item[key] || -1, 0));
  const biggerEqualThanZeroArr: any[] = arr.filter((item) => jsbi.greaterThanOrEqual(item[key] || -1, 0));
  const sortBiggerEqualThanZeroArr = biggerEqualThanZeroArr.sort(sortFunc);

  return [...sortBiggerEqualThanZeroArr, ...smallerThanZeroArr];
};

/**
 * 比较两个数组值(值为基本类型)是否相同,无关数组中每一项值顺序
 * @param arr1
 * @param arr2
 */
const isEqualTwoArray = (arr1: BasicTypes[], arr2: BasicTypes[]) => {
  const newArr = [...arr1, ...arr2];
  return arr1.length === Array.from(new Set(newArr)).length;
};

export { sortByPriorityOrOtherKey, isEqualTwoArray };
