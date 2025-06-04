import { DateUtil } from '@oinone/kunlun-shared';
import { isDate, isEmpty, isString, toString } from 'lodash-es';
import { computed } from 'vue';

export function useDateTimeRangePicker(props) {
  const formatValue = (value: Date | string | undefined, format: string) => {
    let dateValue: Date | undefined;
    if (isString(value)) {
      dateValue = DateUtil.toDate(value, props.valueFormat);
    } else if (isDate(value)) {
      dateValue = value;
    } else if (value) {
      console.warn(`无法识别的日期值, 显示的值可能出现异常. value=${value}`);
      return toString(value);
    } else {
      return '';
    }
    if (dateValue) {
      return DateUtil.dateFormat(dateValue, format);
    }
  };

  const realValue = computed(() => {
    let [startValue, endValue] = props.value || [];
    if (isEmpty(startValue) && isEmpty(endValue)) {
      return '';
    }
    const format = DateUtil.fetchDatetimeFormat(
      { hasDateFormat: props.hasDateFormat, hasTimeFormat: props.hasTimeFormat },
      props.format,
      props.dateFormat,
      props.timeFormat,
      props.convertFormat,
      props.convertDateFormat,
      props.convertTimeFormat
    );
    if (format) {
      startValue = formatValue(startValue, format);
      endValue = formatValue(endValue, format);
    }
    return `${startValue} ${props.separator} ${endValue}`;
  });

  const isRealEmpty = computed(() => {
    return isEmpty(realValue.value);
  });

  return {
    realValue,
    isRealEmpty
  };
}
