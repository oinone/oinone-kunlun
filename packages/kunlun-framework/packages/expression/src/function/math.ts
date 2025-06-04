import { NumberHelper } from '@oinone/kunlun-shared';

export const MATH_FUNCTION = {
  ABS,
  FLOOR,
  CEIL,
  ROUND,
  MOD,
  SQRT,
  SIN,
  COS,
  PI,
  ADD,
  SUBTRACT,
  MULTIPLY,
  DIVIDE,
  LT,
  LE,
  GT,
  GE,
  MAX,
  MIN,
  SUM,
  AVG,
  COUNT,
  UPPER_MONEY
};

function ABS(input: number | string) {
  return input == null ? input : Math.abs(Number(input));
}

function FLOOR(input: number | string) {
  return input == null ? input : Math.floor(Number(input));
}

function CEIL(input: number | string) {
  return input == null ? input : Math.ceil(Number(input));
}

function ROUND(input: number | string) {
  return input == null ? input : Math.round(Number(input));
}

function MOD(A: number | string, B: number | string) {
  if (A == null) {
    return A;
  }
  return B == null ? B : Number(A) % Number(B);
}

function SQRT(input: number | string) {
  return input == null ? input : Math.sqrt(Number(input));
}

function SIN(input: number | string) {
  return input == null ? input : Math.sin(Number(input));
}

function COS(input: number | string) {
  return input == null ? input : Math.cos(Number(input));
}

function PI() {
  return Math.PI;
}

function ADD(A: number | string, B: number | string) {
  return NumberHelper.add(A, B);
}

function SUBTRACT(A: number | string, B: number | string) {
  return NumberHelper.subtract(A, B);
}

function MULTIPLY(A: number | string, B: number | string) {
  return NumberHelper.multiply(A, B);
}

function DIVIDE(A: number | string, B: number | string) {
  return NumberHelper.divide(A, B);
}

function LT(left: number | string, right: number | string): string | boolean {
  return NumberHelper.lt(left, right);
}

function LE(left: number | string, right: number | string): string | boolean {
  return NumberHelper.le(left, right);
}

function GT(left: number | string, right: number | string): string | boolean {
  return NumberHelper.gt(left, right);
}

function GE(left: number | string, right: number | string): string | boolean {
  return NumberHelper.ge(left, right);
}

function MAX(A: number | string, B: number | string) {
  if (A == null && B == null) {
    return undefined;
  }
  return Math.max(Number(A), Number(B));
}

function MIN(A: number | string, B: number | string) {
  if (A == null && B == null) {
    return undefined;
  }
  return Math.min(Number(A), Number(B));
}

function SUM(list: (number | undefined | string)[] | undefined): number | undefined {
  if (list == null) {
    return list;
  }
  let res;
  list?.forEach((item) => {
    const realItem = Number(item);
    if (res == null) {
      res = realItem;
    } else {
      res = NumberHelper.add(res, realItem);
    }
  });
  return res;
}

function AVG(list: number[]) {
  if (list == null) {
    return list;
  }
  const res = SUM(list);
  if (res == null) {
    return res;
  }
  return res / list.length;
}

function COUNT(list: number[]) {
  if (list == null) {
    return 0;
  }
  return list.length;
}

function UPPER_MONEY(money: string | number) {
  if (money == null) {
    return money;
  }
  // 汉字的数字
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']; // 基本单位
  const cnIntRadice = ['', '拾', '佰', '仟']; // 对应整数部分扩展单位
  const cnIntUnits = ['', '万', '亿', '兆']; // 对应小数部分单位
  const cnDecUnits = ['角', '分', '毫', '厘']; // 整数金额时后面跟的字符
  const cnInteger = '整'; // 整型完以后的单位
  const cnIntLast = '元'; // 最大处理的数字
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  const maxNum = 999999999999999.9999; // 金额整数部分
  let integerNum: string; // 金额小数部分
  let decimalNum; // 输出的中文金额字符串
  let chineseStr = ''; // 分离金额后用的数组，预定义
  let parts;
  if (money === '') {
    return '';
  }
  money = parseFloat(money.toString());
  if (money >= maxNum) {
    // 超出最大处理数字
    return '';
  }
  if (money === 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  } // 转换为字符串
  money = money.toString();
  if (money.indexOf('.') === -1) {
    integerNum = money;
    decimalNum = '';
  } else {
    parts = money.split('.');
    integerNum = parts[0];
    decimalNum = parts[1].substr(0, 4);
  } // 获取整型部分转换
  if (parseInt(integerNum! as string, 10) > 0) {
    let zeroCount = 0;
    const IntLen = (integerNum! as string).length;
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum!.substr(i, 1);
      const p = IntLen - i - 1;
      const q = p / 4;
      const m = p % 4;
      if (n === '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        } // 归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n, 10)] + cnIntRadice[m];
      }
      if (m === 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  } // 小数部分
  if (decimalNum !== '') {
    const decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1);
      if (n !== '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum === '') {
    chineseStr += cnInteger;
  }
  return chineseStr;
}
