import { translateValueByKey } from '@oinone/kunlun-engine';
import { DateUtil } from '@oinone/kunlun-shared';
import moment from 'moment';

export enum DateQuickOption {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  WEEK_AGO = 'WEEK_AGO',
  MONTH_AGO = 'MONTH_AGO'
}

export enum DateUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}

export const DateQuickOptionList = [
  {
    name: DateQuickOption.TODAY,
    label: '今天',
    getValue: (format) => {
      return DateUtil.dateFormat(new Date(), format);
    }
  },
  {
    name: DateQuickOption.YESTERDAY,
    label: '昨天',
    getValue: (format) => {
      return DateUtil.dateFormat(new Date(new Date().getTime() - 1000 * 60 * 60 * 24), format);
    }
  },
  {
    name: DateQuickOption.WEEK_AGO,
    label: '一周前',
    getValue: (format) => {
      return DateUtil.dateFormat(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7), format);
    }
  },
  {
    name: DateQuickOption.MONTH_AGO,
    label: '一月前',
    getValue: (format) => {
      return moment(new Date()).subtract(1, 'months').format(format);
    }
  }
];

DateQuickOptionList.forEach((obj) => {
  const value = obj.label;
  Object.defineProperty(obj, 'label', {
    get() {
      return translateValueByKey(value);
    }
  });
});

export const DateQuickOptionListMap = new Map();
DateQuickOptionList.forEach((_m) => DateQuickOptionListMap.set(_m.name, _m));

export const translateByOffset = (date, offset, offsetUnit, format) => {
  if (!offset) {
    offset = 0;
  }
  if (!offsetUnit) {
    offsetUnit = DateUnit.DAY;
  }
  const realDate = DateUtil.toDate(date, format);
  if (offset >= 0) {
    return moment(realDate).add(offset, offsetUnit);
  }
  return moment(realDate).subtract(Math.abs(offset), offsetUnit);
};
