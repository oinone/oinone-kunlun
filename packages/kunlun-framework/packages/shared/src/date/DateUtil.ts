import dayjs from 'dayjs';
import { isNil, isString } from 'lodash-es';
import moment from 'moment';
import { Converter } from '../LambdaFunction';
import { GenericReturnType, GenericType } from '../typing';
import {
  DateFormatMap,
  DateTimeFormatMap,
  DateTimeValueFormatMap,
  defaultDateFormat,
  defaultTimeFormat,
  TimeFormatMap
} from './constant';
import { DateTimePickerMode } from './typing';

moment.locale('zh-cn');

/**
 * 日期/时间工具类
 */
export class DateUtil {
  /**
   * 根据给定的值格式化字符串进行日期类型转换
   * @param val 值
   * @param valueFormat 值格式化字符串
   */
  public static toDate<T extends Date | string | null | undefined>(
    val: GenericType<T>,
    valueFormat: string
  ): GenericReturnType<T, Date> {
    if (isString(val)) {
      val = moment(val, DateUtil.fixFormat(valueFormat)).toDate() as unknown as GenericType<T>;
    }
    return val as unknown as GenericReturnType<T, Date>;
  }

  /**
   * 日期格式化
   * @param date 日期
   * @param valueFormat 值格式化字符串
   */
  public static dateFormat<T extends Date | null | undefined>(
    date: GenericType<T>,
    valueFormat: string
  ): GenericReturnType<T, string> {
    if (isNil(date)) {
      return date as unknown as GenericReturnType<T, string>;
    }
    return moment(date).format(DateUtil.fixFormat(valueFormat)) as GenericReturnType<T, string>;
  }

  /**
   * 获取日期/时间格式化
   * @param formatPredict 格式化判定
   * @param fullFormat 完整的格式化字符串
   * @param dateFormat 日期格式化字符串
   * @param timeFormat 时间格式化字符串
   * @param convertFullFormat 完整的格式化字符串扩展转换
   * @param convertDateFormat 日期格式化字符串扩展转换
   * @param convertTimeFormat 时间格式化字符串扩展转换
   */
  public static fetchDatetimeFormat(
    formatPredict: {
      hasDateFormat: boolean;
      hasTimeFormat: boolean;
    },
    fullFormat: string | undefined,
    dateFormat: string | undefined,
    timeFormat: string | undefined,
    convertFullFormat: Converter<string, string | undefined> | undefined,
    convertDateFormat: Converter<string, string | undefined> | undefined,
    convertTimeFormat: Converter<string, string | undefined> | undefined
  ): string | undefined {
    if (fullFormat) {
      return DateUtil.fetchFullFormat(fullFormat, convertFullFormat);
    }
    let format = '';
    let hasFormat = false;
    let hasDateFormat = false;
    if (formatPredict.hasDateFormat) {
      hasFormat = true;
      hasDateFormat = true;
      format += DateUtil.fetchDateFormat(dateFormat, convertDateFormat);
    }
    if (formatPredict.hasTimeFormat) {
      hasFormat = true;
      if (hasDateFormat) {
        format += ' ';
      }
      format += DateUtil.fetchTimeFormat(timeFormat, convertTimeFormat);
    }
    if (hasFormat) {
      return format;
    }
    return undefined;
  }

  /**
   * 获取完整的日期/时间格式化
   * @param fullFormat 完整的格式化字符串
   * @param convertFullFormat 完整的格式化字符串扩展转换
   */
  public static fetchFullFormat(
    fullFormat: string,
    convertFullFormat: Converter<string, string | undefined> | undefined
  ): string {
    let convertedFormat: string | undefined;
    if (convertFullFormat) {
      convertedFormat = convertFullFormat(fullFormat);
    } else {
      convertedFormat = DateTimeFormatMap.get(fullFormat);
    }
    if (convertedFormat) {
      fullFormat = convertedFormat;
    }
    return fullFormat;
  }

  /**
   * 获取日期格式化
   * @param dateFormat 日期格式化字符串
   * @param convertDateFormat 日期格式化字符串扩展转换
   */
  public static fetchDateFormat(
    dateFormat: string | undefined,
    convertDateFormat: Converter<string, string | undefined> | undefined
  ): string {
    if (isNil(dateFormat)) {
      return defaultDateFormat;
    }
    let convertedDateFormat: string | undefined;
    if (convertDateFormat) {
      convertedDateFormat = convertDateFormat(dateFormat);
    } else {
      convertedDateFormat = DateFormatMap.get(dateFormat);
    }
    if (convertedDateFormat) {
      dateFormat = convertedDateFormat;
    }
    return dateFormat;
  }

  /**
   * 获取时间格式化
   * @param timeFormat 时间格式化字符串
   * @param convertTimeFormat 时间格式化字符串扩展转换
   */
  public static fetchTimeFormat(
    timeFormat: string | undefined,
    convertTimeFormat: Converter<string, string | undefined> | undefined
  ): string {
    if (isNil(timeFormat)) {
      return defaultTimeFormat;
    }
    let convertedTimeFormat: string | undefined;
    if (convertTimeFormat) {
      convertedTimeFormat = convertTimeFormat(timeFormat);
    } else {
      convertedTimeFormat = TimeFormatMap.get(timeFormat);
    }
    if (convertedTimeFormat) {
      timeFormat = convertedTimeFormat;
    }
    return timeFormat;
  }

  /**
   * 获取值格式化
   * @param valueFormat 格式化字符串
   */
  public static fetchValueFormat(valueFormat: string | undefined): string | undefined {
    if (isNil(valueFormat)) {
      return undefined;
    }
    const convertedTimeFormat: string | undefined = DateTimeValueFormatMap.get(valueFormat);
    if (convertedTimeFormat) {
      valueFormat = convertedTimeFormat;
    }
    return valueFormat;
  }

  /**
   * 前后端格式化兼容
   * @param valueFormat 格式化字符串
   * @private
   */
  public static fixFormat(valueFormat: string): string {
    return valueFormat.replaceAll('yy', 'YY').replaceAll('dd', 'DD');
  }

  public static autoFormat(mode: DateTimePickerMode, value: string, format: string) {
    if (!value) {
      return '';
    }
    const split: string = ' ';
    const isTime = mode === DateTimePickerMode.time;
    const formatStr = isTime ? defaultDateFormat + split + format : format;
    const dateStr = isTime ? '2022-11-10' + split + value : value;
    const formatValStr = DateUtil.dateFormat(dayjs(dateStr).toDate(), formatStr);
    return isTime ? formatValStr?.split('2022-11-10' + split).pop() : formatValStr;
  }

  public static valueFormat(val: string, valueFormat: string, format: string): string {
    const value = moment(val, valueFormat);

    if (!value.isValid()) {
      return val;
    }

    const includeYear = format.includes('Y');
    const includeMonth = format.includes('M');
    const includeDay = format.includes('D');
    const includeHour = format.includes('H') || format.includes('h');
    const includeMinute = format.includes('m');
    const includeSecond = format.includes('s');

    if (includeYear) {
      if (!includeMonth) {
        value.startOf('year');
      }

      if (!includeDay) {
        value.startOf('month');
      }
    }

    if (!includeHour) {
      value.hour(0);
    }

    if (!includeMinute) {
      value.minute(0);
    }

    if (!includeSecond) {
      value.second(0);
    }

    return value.format(valueFormat);
  }
}
