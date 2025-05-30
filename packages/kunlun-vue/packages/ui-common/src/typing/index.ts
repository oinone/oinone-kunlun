// 排序方式
export enum IListSortEnum {
  // 按时间排序
  TIME = 'TIME',
  // 多类型排序
  MULTI = 'MULTI',
  // 按索引字段排序
  INDEX = 'INDEX'
}

/**
 * inputmode 全局属性 是一个枚举属性，它提供了用户在编辑元素或其内容时可能输入的数据类型的提示
 * 如果没有设置这个属性，它的默认值是 "text"，表明使用本地的标准文本输入键盘。
 * @link https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/inputmode#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7
 */
export enum IInputmodeEnum {
  // 无虚拟键盘。在应用程序或者站点需要实现自己的键盘输入控件时很有用。
  NONE = 'none',
  // 使用用户本地区域设置的标准文本输入键盘。
  TEXT = 'text',
  // 小数输入键盘，包含数字和分隔符（通常是“ . ”或者“ , ”），设备可能也可能不显示减号键。
  DECIMAL = 'decimal',
  // 数字输入键盘，所需要的就是 0 到 9 的数字，设备可能也可能不显示减号键。
  NUMERIC = 'numeric',
  // 电话输入键盘，包含 0 到 9 的数字、星号（*）和井号（#）键。表单输入里面的电话输入通常应该使用 <input type="tel"> 。
  TEL = 'tel',
  // 为搜索输入优化的虚拟键盘，比如，返回键可能被重新标记为“搜索”，也可能还有其他的优化。
  SEARCH = 'search',
  // 为邮件地址输入优化的虚拟键盘，通常包含"@"符号和其他优化。表单里面的邮件地址输入应该使用 <input type="email"> 。
  EMAIL = 'email',
  // 为网址输入优化的虚拟键盘，比如，“/”键会更加明显、历史记录访问等。表单里面的网址输入通常应该使用 <input type="url"> 。
  URL = 'url'
}

export enum IEmptyPlaceholder {
  // 空
  EMPTY = 'EMPTY',
  // 间隔符 '-'
  SEPARATOR = 'SEPARATOR'
}

export * from './confirm';
export * from './constant';
export * from './content-type';
export * from './props';
export * from './vue-types';
export * from './icon';
export * from './stable-slot-prop';
export * from './view';
export * from './login';
export * from './language';
