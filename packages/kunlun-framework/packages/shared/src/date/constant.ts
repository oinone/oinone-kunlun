export const defaultFormat = 'YYYY-MM-DD HH:mm:ss';

export const defaultDateFormat = 'YYYY-MM-DD';

export const defaultTimeFormat = 'HH:mm:ss';

export const defaultYearFormat = 'YYYY年';

export const defaultYearValueFormat = 'YYYY';

export const defaultDateFormatKey = 'CHINESE';

export const defaultTimeFormatKey = 'COLON_NORMAL';

export const DateTimeFormatMap = new Map<string, string>([
  ['DATETIME', defaultFormat],
  ['DATE', defaultDateFormat],
  ['TIME', defaultTimeFormat],
  ['YEAR', defaultYearFormat]
]);

export const DateTimeValueFormatMap = new Map<string, string>([
  ['DATETIME', defaultFormat],
  ['DATE', defaultDateFormat],
  ['TIME', defaultTimeFormat],
  ['YEAR', defaultYearValueFormat]
]);

export const DateFormatMap = new Map<string, string>([
  [defaultDateFormatKey, 'YYYY年MM月DD日'],
  ['CHINESE_YEAR_MONTH', 'YYYY年MM月'],
  ['CHINESE_MONTH_DAY', 'MM月DD日'],
  ['HYPHEN', defaultDateFormat],
  ['HYPHEN_YEAR_MONTH', 'YYYY-MM'],
  ['HYPHEN_MONTH_DAY', 'MM-DD'],
  ['SLASH', 'YYYY/MM/DD'],
  ['SLASH_YEAR_MONTH', 'YYYY/MM'],
  ['SLASH_MONTH_DAY', 'MM/DD']
]);

export const TimeFormatMap = new Map<string, string>([
  [defaultTimeFormatKey, defaultTimeFormat],
  ['COLON_SHORT', 'HH:mm'],
  ['AP_COLON_NORMAL', `A hh:mm:ss`],
  ['AP_COLON_SHORT', 'A hh:mm']
]);
