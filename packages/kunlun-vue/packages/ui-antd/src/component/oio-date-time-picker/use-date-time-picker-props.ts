import { DateTimePickerMode, DateUtil, defaultFormat } from '@oinone/kunlun-shared';
import { isNil, isString } from 'lodash-es';
import type { Moment } from 'moment';
import { computed, type ComputedRef, ref } from 'vue';

export function useDateTimePickerProps(props, context) {
  const mode: ComputedRef<DateTimePickerMode> = computed(() => {
    const $$mode = props.mode as DateTimePickerMode;
    if (!$$mode) {
      return DateTimePickerMode.datetime;
    }
    if ($$mode === DateTimePickerMode.date) {
      const dateFormat = DateUtil.fetchDateFormat(props.format || props.dateFormat, props.convertDateFormat);
      if (dateFormat.indexOf('D') === -1) {
        return DateTimePickerMode.month;
      }
    }
    return $$mode;
  });

  const panelVisible = ref<boolean>(false);

  const innerChangeOpenValue = (v) => {
    panelVisible.value = v;
    props.changeOpenValue?.(v);
  };

  const getDateTimeFormat = () => {
    return DateUtil.fetchDatetimeFormat(
      { hasDateFormat: props.hasDateFormat, hasTimeFormat: props.hasTimeFormat },
      props.format,
      props.dateFormat,
      props.timeFormat,
      props.convertFormat,
      props.convertDateFormat,
      props.convertTimeFormat
    );
  };

  const format = computed(() => {
    return getDateTimeFormat() || defaultFormat;
  });

  const valueFormat = computed(() => {
    return DateUtil.fixFormat(DateUtil.fetchValueFormat(props.valueFormat) || defaultFormat);
  });

  const defaultValue = computed(() => {
    const val = props.defaultValue;
    if (isString(val)) {
      return val;
    }
    return DateUtil.dateFormat(val, valueFormat.value);
  });

  const showTime = computed(() => {
    if (isNil(props.showTime)) {
      return props.mode === DateTimePickerMode.datetime;
    }
    return props.showTime;
  });

  const formatValue = (val: string) => {
    if (!val) {
      return val;
    }
    return DateUtil.valueFormat(val, valueFormat.value, format.value);
  };

  const emitValue = (val: string) => {
    context.emit('update:value', formatValue(val));
  };

  const panelChange = (val: Moment | string, mode: string) => {
    const value = typeof val === 'string' ? val : (val as Moment).format(valueFormat.value);
    context.emit('update:value', value);
  };

  const panelVisibleChange = (visible: boolean) => {
    if (props.readonly) {
      visible = false;
    }
    innerChangeOpenValue(visible);
    if (!visible) {
      props.closePanelChange?.();
    } else {
      props.openPanelChange?.();
    }
  };

  return {
    mode,
    panelVisible,
    format,
    valueFormat,
    defaultValue,
    showTime,
    panelChange,
    panelVisibleChange,
    emitValue
  };
}

export function fetchDatetimePickerPlaceholder(mode: DateTimePickerMode) {
  switch (mode) {
    case DateTimePickerMode.date:
      return '请选择日期';
    case DateTimePickerMode.time:
      return '请选择时间';
    case DateTimePickerMode.year:
      return '请选择年份';
    case DateTimePickerMode.month:
      return '请选择月份';
    case DateTimePickerMode.week:
      return '请选择周';
    default:
      return '请选择日期时间';
  }
}
