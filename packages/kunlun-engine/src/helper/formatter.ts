// import moment from 'moment-timezone';

import {
  CurrencySymbolPosition,
  ICurrencyConfig,
  IFloatConfig,
  WritingMode,
  IIntegerConfig,
  IStringConfig
} from '../typing';
import { BigIntClass } from './bigint';

// 用于 money 字段、float 字段，将非数字及非小数点非负号过滤掉
// 123.123ddddd => 123.123
// TODO 不能写两个 .
const filterNumberAndDecimalPoint = (basicsConfig: IFloatConfig | ICurrencyConfig, initialValue: string) => {
  if (initialValue == null) {
    return initialValue;
  }

  const val = initialValue.toString();
  const { decimalPoint = '.' } = basicsConfig;
  const regStr = `[^\\d${decimalPoint}-]`;
  const reg = new RegExp(regStr, 'g');
  const currVal = val.replace(reg, '');
  return currVal;
};

// 用于 Integer 字段、long 字段，将非数字非负号过滤掉
// ddd-123... => -123
const filterNumber = (basicsConfig: IFloatConfig | IIntegerConfig, initialValue: string) => {
  if (initialValue == null) {
    return initialValue;
  }
  const val = initialValue.toString();
  const regStr = `[^\\d-]`;
  const reg = new RegExp(regStr, 'g');
  const currVal = val.replace(reg, '');
  return currVal;
};

// 用于手机号码的过滤
const filterPhone = (basicsConfig: IFloatConfig | IIntegerConfig, initialValue: string) => {
  if (initialValue == null) {
    return initialValue;
  }
  const val = initialValue.toString();
  const regStr = `[^\\d-+]`;
  const reg = new RegExp(regStr, 'g');
  const currVal = val.replace(reg, '');
  return currVal;
};

// 提交给后端的 float、money 字段，需要是常用的小数点如：1.1
// 123/123 => 123.123
const convertDecimalPointToDot = (basicsConfig: IFloatConfig | ICurrencyConfig, initialValue: string) => {
  if (initialValue == null) {
    return initialValue;
  }

  const val = initialValue.toString();

  const { decimalPoint } = basicsConfig;
  if (decimalPoint) {
    const reg = new RegExp(`\\${decimalPoint}`, 'g');
    return val.replace(reg, '.');
  }
  return val;
};

// 提取公共函数
function division(compare: any, groupingRule: string, thousandsSep: string): string {
  return compare.replace(new RegExp(`(\\d)(?=(?:\\d{${groupingRule}})+$)`, 'g'), `$1${thousandsSep}`);
}

// 1233333.12 => 1,233,333/22
// 1233333 => 1,233,333
const convertGroupRuleAndDecimal = (basicsConfig: IFloatConfig, initialValue: string): string => {
  if (initialValue == null) {
    return initialValue;
  }

  const val = initialValue.toString();
  const { decimalPoint = '.', groupingRule, thousandsSep } = basicsConfig;
  if (!groupingRule || !thousandsSep) {
    return val;
  }
  // 后端传过来的 float 类型也要为 1.1 这种正常小数点形式
  const pointValue = val.split('.');

  return pointValue.length > 1
    ? division(pointValue[0], groupingRule, thousandsSep) + decimalPoint + pointValue[1]
    : division(pointValue[0], groupingRule, thousandsSep);
};

// 书写方向
const convertStyleValue = (basicsConfig: IFloatConfig | ICurrencyConfig | IStringConfig): string => {
  return basicsConfig.direction === WritingMode.RTL ? 'rtl' : 'ltr';
};

// 小数精度
// 12.22222222 => 12.22
const convertDecimalPlacesValue = (basicsConfig: ICurrencyConfig | IFloatConfig, initialValue: string): string => {
  if (initialValue == null) {
    return initialValue;
  }

  const val = initialValue.toString();
  const { decimalPlaces } = basicsConfig;
  if (decimalPlaces) {
    const reg = new RegExp(`\\d+(\.\\d{0,${decimalPlaces}})?`);
    const match = val.match(reg);
    return match ? match[0] : val;
  }
  return val;
};

// 单位转换
// 12.1 => 12元10分
const convertCurrencyUnitValue = (basicsConfig: ICurrencyConfig, initialValue: string): string => {
  if (initialValue == null) {
    return initialValue;
  }

  const { currencyUnitLabel, currencySubunitLabel, decimalPoint, decimalPlaces } = basicsConfig;
  const valArr = initialValue.split(decimalPoint);
  const [intVal, decimalVal] = valArr;
  const jsbi = new BigIntClass();
  let val;
  if (decimalVal) {
    // 1.有小数
    if (currencyUnitLabel && !currencySubunitLabel) {
      // 1.1 有整数单位，没有小数单位
      val = intVal + currencyUnitLabel;
    } else if (!currencyUnitLabel && currencySubunitLabel) {
      // 1.2 没有整数单位，有小数单位
      if (decimalPlaces) {
        // 1.2.1 有 decimalPlaces
        // 类似于化“元”为“分”
        const deci = jsbi.multiply(intVal, jsbi.exponentiate(10, decimalPlaces).toString()).add(decimalVal).toString();
        // const deci = Number(intVal) * 10 ** Number(decimalPlaces) + Number(decimalVal);
        val = deci + currencySubunitLabel;
      } else {
        // 1.2.2 没有 decimalPlaces，不知道怎么转
        val = initialValue;
      }
    } else if (currencyUnitLabel && currencySubunitLabel) {
      // 1.3 有整数单位，有小数单位
      if (decimalPlaces) {
        // 1.3.1 有 decimalPlaces
        // 小数部分化为小数：7 -> 0.7
        const deci = jsbi.divide(decimalVal, jsbi.exponentiate(10, decimalVal.length).toString()).toString();
        // const deci = Number(decimalVal) / 10 ** decimalVal.length;
        // 0.7元 化为 70 分
        const deciVal = jsbi.multiply(deci, jsbi.exponentiate(10, decimalPlaces).toString());
        // const deciVal = deci * 10 ** decimalPlaces;
        val = intVal + currencyUnitLabel + deciVal + currencySubunitLabel;
      } else {
        // 1.3.2 没有 decimalPlaces，不知道怎么转，只转整数单位
        val = intVal + currencyUnitLabel;
      }
    } else {
      // 1.4 没有整数单位，没有小数单位
      val = initialValue;
    }
  } else {
    // 2.没有小数
    val = intVal + currencyUnitLabel;
  }
  return val;
};

// $符号
const convertSprocketBitValue = (basicsConfig: ICurrencyConfig, initialValue: string): string => {
  const { symbol, position } = basicsConfig;
  if (symbol && position) {
    if (position === CurrencySymbolPosition.Before) {
      return symbol + initialValue;
    }

    if (position === CurrencySymbolPosition.After) {
      return initialValue + symbol;
    }
  }
  return initialValue;
};

// 将 format 转为 moment 可用的 format
// yy年mm月dd日 => YY年MM月DD日
const transToMomentFormat = (formatStr: string) => {
  return formatStr.replace(/y/g, 'Y').replace(/m/g, 'M').replace(/d/g, 'D');
};

// 后端返回的 date value 转为 format
// 2010-11-11 11:11:11 => 2010年11月11日 11时11分11秒
// const convertDateValueToFormatVal = (basicsConfig: IDateConfig, val: string, withTime: Boolean = false) => {
//   if (val == null) {
//     return val;
//   }

//   const dateVal = new Date(val);
//   const { timeZoneType, timeFormat = 'HH:mm:ss', baseTimezoneType } = basicsConfig;
//   let { dateFormat = 'yyyy-MM-dd' } = basicsConfig;
//   dateFormat = transToMomentFormat(dateFormat);
//   let data;
//   const format = dateFormat + (withTime ? ` ${timeFormat}` : '');
//   if (timeZoneType && baseTimezoneType) {
//     // TODO 缺少基准时区
//     const base = moment.tz(dateVal, baseTimezoneType);
//     const timeZone = base.clone().tz(timeZoneType);
//     data = moment(timeZone).format(format);
//   } else {
//     data = moment(dateVal).format(format);
//   }
//   return data;
// };

// 把 Date 类型的值转为后端用的 date value
// new Date() => 2011-1-1 12:12:12
// const convertDateToValue = (basicsConfig: IDateConfig, val: Date | string) => {
//   if (val == null) {
//     return val;
//   }
//   const value = moment(val).format('YYYY-MM-DD HH:mm:ss');
//   return value;
// };

// 后端返回的 date value 转为 Date 类型（带时区）
// 2011-1-1 12:12:12
// const convertValueToDate = (basicsConfig: IDateConfig, val: string) => {
//   if (!val) {
//     return val;
//   }
//   // 后端返回时区与配置对齐
//   // https://github.com/moment/moment-timezone/blob/develop/data/packed/latest.json
//   const { timeZoneType, baseTimezoneType } = basicsConfig;
//   if (timeZoneType && baseTimezoneType) {
//     // TODO 缺少基准时区
//     const base = moment.tz(val, baseTimezoneType);
//     const timeZone = base.clone().tz(timeZoneType);
//     const date = moment(timeZone).toDate();
//     return date;
//   }
//   return moment(val).toDate();
// };
/**
 * 去除字符串左右两端的单引号
 * @param inputString
 */
const trimSingleQuote = (inputString: string) => {
  return inputString ? inputString.replace(/(^'*)|('*$)/g, '') : inputString;
};
/**
 * 去除字符串左右两端的双引号
 * @param inputString
 */
const trimDoubleQuote = (inputString: string) => {
  return inputString ? inputString.replace(/(^"*)|("*$)/g, '') : inputString;
};

export {
  convertStyleValue,
  convertGroupRuleAndDecimal,
  convertDecimalPlacesValue,
  convertCurrencyUnitValue,
  convertSprocketBitValue,
  filterNumberAndDecimalPoint,
  convertDecimalPointToDot,
  filterNumber,
  filterPhone,
  // convertDateToValue,
  // convertValueToDate,
  // convertDateValueToFormatVal,
  trimSingleQuote,
  trimDoubleQuote
};
