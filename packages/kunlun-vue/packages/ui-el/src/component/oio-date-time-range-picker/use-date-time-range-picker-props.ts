import { DateTimePickerMode, DateUtil, defaultFormat } from '@oinone/kunlun-shared';
import { isArray, isFunction, isNil, isObject, isString } from 'lodash-es';
import { computed } from 'vue';

/**
 * 日期/时间值转换为 Date 对象
 * element-plus 的面板内部直接使用 dayjs() 解析默认值与快捷方式值，需要统一转换为 Date 对象
 * @param val 值
 * @param valueFormat 值格式化字符串
 */
const toDate = (val: Date | string | { toDate?: () => Date } | undefined, valueFormat: string) => {
  if (isNil(val)) {
    return undefined;
  }
  if (isString(val)) {
    return DateUtil.toDate(val, valueFormat);
  }
  if (val instanceof Date) {
    return val;
  }
  // moment 等具有 toDate 方法的对象
  return val.toDate ? val.toDate() : undefined;
};

export function useDateTimeRangePickerProps(props, context) {
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
    if (isArray(val)) {
      const [startVal, endVal] = val;
      return [toDate(startVal, valueFormat.value), toDate(endVal, valueFormat.value)];
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

  /**
   * 真实模式对应的 element-plus 类型
   * element-plus 的时间范围使用 ElTimePicker 的 is-range，其余范围使用 ElDatePicker 的类型
   */
  const realType = computed<string | undefined>(() => {
    switch (realMode.value) {
      case DateTimePickerMode.date:
        // antd 日期模式开启 showTime 时展示时间列，element-plus 使用日期时间范围
        return showTime.value ? 'datetimerange' : 'daterange';
      case DateTimePickerMode.month:
        return 'monthrange';
      case DateTimePickerMode.year:
        return 'yearrange';
      case DateTimePickerMode.time:
        return undefined;
      case undefined:
        // antd 关闭 showTime 时展示纯日期范围
        return showTime.value ? 'datetimerange' : 'daterange';
      default:
        // element-plus 不支持周范围，使用日期范围
        return 'daterange';
    }
  });

  /**
   * antd showTime.defaultValue → element-plus defaultTime（打开面板时的默认时间）
   */
  const defaultTime = computed(() => {
    const showTimeVal = showTime.value as { defaultValue?: unknown } | boolean | undefined;
    if (isObject(showTimeVal) && isArray(showTimeVal.defaultValue)) {
      return showTimeVal.defaultValue.map((val) => toDate(val, valueFormat.value));
    }
    return undefined;
  });

  /**
   * antd presets [{label, value}] → element-plus shortcuts [{text, value}]
   */
  const shortcuts = computed(() => {
    const val = props.presets;
    if (!isArray(val) || !val.length) {
      return undefined;
    }
    return val.map((preset) => {
      let value: unknown = preset.value;
      if (!isFunction(value) && isArray(value)) {
        value = [toDate(value[0], valueFormat.value), toDate(value[1], valueFormat.value)];
      }
      return {
        text: preset.label || preset.text,
        value
      };
    });
  });

  const panelVisibleChange = (visible: boolean) => {
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
    // element-plus 清空时发出空字符串，统一按 undefined 处理，与 antd 清空行为保持一致
    if (!rangValue) {
      context.emit('update:value', undefined);
      return;
    }

    const [startValue, endValue] = rangValue;

    context.emit('update:value', [formatValue(startValue), formatValue(endValue)]);
  };

  return {
    format,
    valueFormat,
    realType,
    defaultValue,
    defaultTime,
    shortcuts,
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
