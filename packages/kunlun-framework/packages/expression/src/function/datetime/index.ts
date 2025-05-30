import dayjs from 'dayjs';
import { DateUtils } from './DateUtils';

export * from './DateUtils';

export const DATETIME_FUNCTION = {
  NOW,
  NOW_STR,
  TODAY_STR,
  TO_DATE,
  ADD_DAY,
  ADD_MONTH,
  ADD_YEAR,
  GREATER_THAN,
  GREATER_EQUAL,
  ADD_WORK_DAY,
  COUNT_DAY,
  LESS_THAN,
  LESS_EQUAL,
  DATE_EQUALS
};

function NOW() {
  return Date.now();
}

function NOW_STR() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

function TODAY_STR() {
  return dayjs().format('YYYY-MM-DD');
}

function TO_DATE(s: string, pattern?: string) {
  if (!pattern) {
    return DateUtils.parse(s).value;
  }
  return dayjs(s, pattern);
}

function ADD_DAY(date: string, change: number) {
  if (date == null || change == null) {
    return date;
  }
  const { value, format } = DateUtils.parse(date);
  return value.add(change, 'days').format(format);
}

function ADD_MONTH(date: string, change: number) {
  if (date == null || change == null) {
    return date;
  }
  const { value, format } = DateUtils.parse(date);
  return value.add(change, 'months').format(format);
}

function ADD_YEAR(date: string, change: number) {
  if (date == null || change == null) {
    return date;
  }
  const { value, format } = DateUtils.parse(date);
  return value.add(change, 'years').format(format);
}

function GREATER_THAN(date1: string, date2: string) {
  if (date1 == null || date2 == null) {
    return false;
  }
  return DateUtils.parse(date1).value.isAfter(DateUtils.parse(date2).value);
}

function GREATER_EQUAL(date1: string, date2: string) {
  if (date1 == null || date2 == null) {
    return false;
  }
  const d1 = DateUtils.parse(date1).value;
  const d2 = DateUtils.parse(date2).value;
  return d1.isSame(d2) || d1.isAfter(d2);
}

function ADD_WORK_DAY(date: string, change: number) {
  if (date == null || change == null) {
    return date;
  }
  const { value, format } = DateUtils.parse(date);
  for (let i = 0; i < change; i++) {
    if ([0, 6].includes(value.add(1, 'days').day())) {
      change++;
    }
  }
  return value.add(change, 'days').format(format);
}

function COUNT_DAY(date1: string, date2: string) {
  if (date1 == null || date2 == null) {
    return false;
  }
  return Math.ceil((DateUtils.parse(date1).value.valueOf() - DateUtils.parse(date2).value.valueOf()) / 86400000);
}

function LESS_THAN(date1: string, date2: string) {
  if (date1 == null || date2 == null) {
    return false;
  }
  return DateUtils.parse(date1).value.isBefore(DateUtils.parse(date2).value);
}

function LESS_EQUAL(date1: string, date2: string) {
  if (date1 == null || date2 == null) {
    return false;
  }
  const d1 = DateUtils.parse(date1).value;
  const d2 = DateUtils.parse(date2).value;
  return d1.isSame(d2) || d1.isBefore(d2);
}

function DATE_EQUALS(date1: string, date2: string) {
  if (date1 == null || date2 == null) {
    return false;
  }
  return DateUtils.parse(date1).value.isSame(DateUtils.parse(date2).value);
}
