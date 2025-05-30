import { EntityId } from '@kunlun/meta';

// interface IGlobalConfig {
//   // TODO 根据数据结构描述定义
//   user: {
//     id: EntityId;
//   };
//   // 系统资源配置
//   resources: {
//     file: {}; // 文件
//     country: {}; // 国家
//     language: ILanguageConfig; // 语言
//     currencyRate: {}; // 汇率
//     bank: {}; // 银行
//   };

//   fieldsGlobalizationConfig: {
//     currencyConfig: ICurrencyConfig; // 货币
//     dateConfig: IDateConfig; // 日期
//     integerConfig: IIntegerConfig; // 整数
//     floatConfig: IFloatConfig; // 浮点数
//     stringConfig: IStringConfig; // 字符串
//   };

//   renderTypeConfig: {
//     address: IAddressConfig;
//     name: INameConfig;
//     phone: IPhoneConfig;
//   };
// }

/**
 * 语言相关的配置
 */
interface ILanguageConfig {
  direction: WritingMode;
}

enum WritingMode {
  LTR = 'ltr',
  RTL = 'rtl'
}

interface ICurrencyConfig {
  symbol: string; // 货币符号
  position: CurrencySymbolPosition; // 货币符号位置
  decimalPlaces: number; // 小数精度，类型为 int
  currencyUnitLabel: string; // 整数单位
  currencySubunitLabel: string; // 小数单位
  direction: WritingMode; // 书写方向
  groupingRule: string; // 数字分组规则
  thousandsSep: string; // 整数格式
  decimalPoint: string; // 小数点格式
}

enum CurrencySymbolPosition {
  Before = 'BEFORE',
  After = 'AFTER'
}

/**
 * 时间相关的配置
 */
enum WeekDay {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7
}

interface IDateConfig {
  baseTimezoneType: string;
  // https://github.com/moment/moment-timezone/blob/develop/data/packed/latest.json
  timeZoneType: string; // 时区
  direction: WritingMode; // 书写方向
  // https://element.eleme.cn/#/zh-CN/component/date-picker#ri-qi-ge-shi
  dateFormat: string; // 日期格式
  timeFormat: string; // 时间格式
  weekStart: WeekDay; // 一周开始的日期
}

/**
 * 数字相关的配置
 */
interface IIntegerConfig {
  thousandsSep: string; // 整数格式，千分位
  groupingRule: string; // 数字分组规则
  direction: WritingMode; // 书写方向
}

interface IFloatConfig {
  decimalPoint: string; // 小数点格式
  thousandsSep: string; // 整数格式，千分位
  groupingRule: string; // 数字分组规则
  direction: WritingMode; // 书写方向
  decimalPlaces: number; // 小数精度，类型为 int
}

/**
 * 字符串相关的配置
 */
interface IStringConfig {
  direction?: WritingMode; // 书写方向
  phoneCode?: string; // 区号
  addrFormat?: string;
  namePosition?: string;
}

/**
 * 地址相关的配置
 */
interface IAddressConfig {
  symbol: string; // 地址结构  TODO: 待讨论
  addressView: string; // 地址组件的自定义模板
}

/**
 * 姓名相关的配置
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface INameConfig {}

/**
 * 电话号码相关的配置
 */
interface IPhoneConfig {
  phoneCode: string; // 区号
}

export {
  CurrencySymbolPosition,
  ICurrencyConfig,
  IFloatConfig,
  WritingMode,
  IIntegerConfig,
  IStringConfig,
  IDateConfig,
  IAddressConfig,
  INameConfig,
  IPhoneConfig,
  WeekDay
};
