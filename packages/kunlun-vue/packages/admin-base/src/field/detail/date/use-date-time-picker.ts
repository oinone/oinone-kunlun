import { DateUtil } from '@kunlun/shared';
import { isDate, isEmpty, isString, toString } from 'lodash-es';
import { computed } from 'vue';

export function useDateTimePicker(props) {
  const realFormat = computed(() => {
    return DateUtil.fetchDatetimeFormat(
      { hasDateFormat: props.hasDateFormat, hasTimeFormat: props.hasTimeFormat },
      props.format,
      props.dateFormat,
      props.timeFormat,
      props.convertFormat,
      props.convertDateFormat,
      props.convertTimeFormat
    );
  });

  const realDateValue = computed<Date | undefined>(() => {
    const value = props.value;
    if (isEmpty(value)) {
      return undefined;
    }
    const format = realFormat.value;
    if (format) {
      let dateValue: Date | undefined;
      if (isString(value)) {
        dateValue = DateUtil.toDate(value, props.valueFormat);
      } else if (isDate(value)) {
        dateValue = value;
      } else {
        console.warn(`无法识别的日期值, 显示的值可能出现异常. value=${value}`);
      }
      if (dateValue) {
        return dateValue;
      }
    }
    return undefined;
  });

  const realValue = computed(() => {
    const value = props.value;
    if (isEmpty(value)) {
      return '';
    }
    const format = realFormat.value;
    const dateValue = realDateValue.value;
    if (format && dateValue) {
      return DateUtil.dateFormat(dateValue, format);
    }
    return toString(value);
  });

  const isRealEmpty = computed(() => {
    return isEmpty(realValue.value);
  });

  return {
    realDateValue,
    realValue,
    isRealEmpty
  };
}
