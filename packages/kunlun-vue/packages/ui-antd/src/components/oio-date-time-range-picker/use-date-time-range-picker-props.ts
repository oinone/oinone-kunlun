import { DateTimePickerMode, DateUtil, defaultFormat } from '@oinone/kunlun-shared';
import { isArray, isNil, isString } from 'lodash-es';
import { computed, ref, watch } from 'vue';

export function useDatetimeRangePickerProps(props, context) {
  const panelVisible = ref<boolean>(false);
  const dynamicMode = ref<DateTimePickerMode | undefined>(undefined);

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

  function formatByValueFormat(date: Date | string | undefined) {
    if (isString(date)) {
      return date;
    }
    return DateUtil.dateFormat(date, valueFormat.value);
  }

  const defaultValue = computed(() => {
    const val = props.defaultValue;
    if (isArray(val)) {
      const [startVal, endVal] = val;
      return [formatByValueFormat(startVal), formatByValueFormat(endVal)];
    }
    return undefined;
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

  const panelVisibleChange = (visible: boolean) => {
    panelVisible.value = visible;
    if (visible) {
      props.openPanelChange?.();
    } else {
      props.closePanelChange?.();
    }
  };

  const formatValue = (val: string) => {
    if (!val) {
      return val;
    }
    return DateUtil.valueFormat(val, valueFormat.value, format.value);
  };

  const emitValue = (rangValue?: [string, string]) => {
    if (!rangValue) {
      context.emit('update:value', rangValue);
      return;
    }

    const [startValue, endValue] = rangValue;

    context.emit('update:value', [formatValue(startValue), formatValue(endValue)]);
  };

  watch(
    () => props.mode,
    () => {
      dynamicMode.value = realMode.value;
    },
    { immediate: true }
  );

  return {
    panelVisible,
    format,
    dynamicMode,
    valueFormat,
    defaultValue,
    showTime,
    emitValue,
    panelVisibleChange
  };
}

export function fetchDatetimeRangePickerPlaceholder(mode: DateTimePickerMode) {
  switch (mode) {
    case DateTimePickerMode.datetime:
    case DateTimePickerMode.time:
      return ['开始时间', '结束时间'];
    case DateTimePickerMode.year:
      return ['开始年份', '结束年份'];
    case DateTimePickerMode.month:
      return ['开始月份', '结束月份'];
    case DateTimePickerMode.week:
      return ['开始周', '结束周'];
    default:
      return ['开始日期', '结束日期'];
  }
}
