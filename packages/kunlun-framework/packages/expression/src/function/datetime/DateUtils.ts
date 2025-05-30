import dayjs from 'dayjs';

enum DateTimeMode {
  datetime = 'datetime',
  date = 'date',
  time = 'time',
  year = 'year',
  month = 'month',
  week = 'week'
}

export class DateUtils {
  public static parse(date: string) {
    let format = 'YYYY';
    let mode = DateTimeMode.year;
    if (date.includes(':')) {
      if (date.includes('-')) {
        mode = DateTimeMode.datetime;
        format = 'YYYY-MM-DD HH:mm:ss';
      } else {
        mode = DateTimeMode.time;
        format = 'HH:mm:ss';
      }
    } else if (date.includes('-')) {
      mode = DateTimeMode.date;
      format = 'YYYY-MM-DD';
    }
    return {
      format,
      value: DateUtils.autoFormat(mode, date, format)
    };
  }

  public static autoFormat(mode: DateTimeMode, value: string, format: string) {
    if (!value) {
      return dayjs();
    }
    // 自动补全时间类型的字符串的年月日
    const split = ' ';
    const isTime = mode === DateTimeMode.time;
    const formatStr = isTime ? `YYYY-MM-DD${split}${format}` : format;
    const dateStr = isTime ? `1970-01-02${split}${value}` : value;
    return dayjs(dateStr, formatStr);
  }
}
