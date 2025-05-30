import { computed, ComputedRef, unref } from 'vue';
import { UnrefType } from '../typing';

type TimeUnits = {
  year: string | null;
  month: string | null;
  day: string | null;
  hour: string | null;
  minute: string | null;
  justNow: string | null;
};

const defaultTimeUnits: TimeUnits = {
  year: '年前',
  month: '月前',
  day: '天前',
  hour: '小时前',
  minute: '分钟前',
  justNow: '刚刚'
};

export function useTimeDifference(options: {
  lastTime: UnrefType<Date | undefined>;
  translate?: (origin: string) => string;
  units?: Partial<TimeUnits>;
}): {
  timeDifference: ComputedRef<string>;
} {
  const { year, month, day, hour, minute, justNow } = { ...defaultTimeUnits, ...(options.units || {}) };
  const translate = options.translate || ((v) => v);
  const yearUnit = year && translate(year);
  const monthUnit = month && translate(month);
  const dayUnit = day && translate(day);
  const hourUnit = hour && translate(hour);
  const minuteUnit = minute && translate(minute);
  const justNowUnit = justNow && translate(justNow);

  const timeDifference = computed(() => {
    const lastTime = unref(options.lastTime);
    if (!lastTime) {
      return '';
    }
    const currentTime = Date.now();
    const timeDifference = currentTime - lastTime.getTime();

    const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));
    if (years > 0) {
      if (yearUnit) {
        return `${years}${yearUnit}`;
      }
    }

    const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30));
    if (months > 0) {
      if (monthUnit) {
        return `${months}${monthUnit}`;
      }
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    if (days > 0) {
      if (dayUnit) {
        return `${days}${dayUnit}`;
      }
    }

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    if (hours > 0) {
      if (hourUnit) {
        return `${hours}${hourUnit}`;
      }
    }

    const minutes = Math.floor(timeDifference / (1000 * 60));
    if (minutes > 0) {
      if (minuteUnit) {
        return `${minutes}${minuteUnit}`;
      }
    }

    return justNowUnit || '';
  });

  return {
    timeDifference
  };
}
