import { DateTimePickerMode, DateUtil, defaultFormat } from '@kunlun/shared';
import { isNil, isString } from 'lodash-es';
import { Moment } from 'moment';

import { computed, ref, watch } from 'vue';

export function useDateTimePickerProps(props, context) {
  const dynamicMode = ref<DateTimePickerMode | undefined>(undefined);
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

  const realMode = computed<DateTimePickerMode | undefined>(() => {
    const mode = props.mode;
    if (mode) {
      switch (mode) {
        case DateTimePickerMode.datetime:
          return undefined;
        case DateTimePickerMode.date: {
          const dateFormat = DateUtil.fetchDateFormat(props.format || props.dateFormat, props.convertDateFormat);
          if (dateFormat.indexOf('D') === -1) {
            return DateTimePickerMode.month;
          }
          break;
        }
        case DateTimePickerMode.time:
          break;
        case DateTimePickerMode.year:
          break;
        default:
          return mode;
      }
      return mode;
    }
    return undefined;
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

  const panelChange = (val: Moment | String, mode: string) => {
    const originMode = realMode.value;
    const value = typeof val === 'string' ? val : (val as Moment).format(valueFormat.value);
    if (originMode && [DateTimePickerMode.year, DateTimePickerMode.month].includes(originMode)) {
      context.emit('update:value', value);
      innerChangeOpenValue(false);
      dynamicMode.value = originMode;
      return;
    }

    context.emit('update:value', value);
    dynamicMode.value = mode as DateTimePickerMode;
  };

  const panelVisibleChange = (visible: boolean) => {
    if (props.readonly) {
      visible = false;
    }
    innerChangeOpenValue(visible);
    if (!visible) {
      dynamicMode.value = realMode.value;
      props.closePanelChange?.();
    } else {
      props.openPanelChange?.();
    }
  };

  watch(
    () => props.mode,
    () => {
      innerChangeOpenValue(false);
      dynamicMode.value = realMode.value;
    },
    { immediate: true }
  );

  return {
    dynamicMode,
    panelVisible,
    format,
    valueFormat,
    defaultValue,
    realMode,
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
