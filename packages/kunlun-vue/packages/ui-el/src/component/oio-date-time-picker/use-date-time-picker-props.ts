import { DateTimePickerMode, DateUtil, defaultFormat } from '@oinone/kunlun-shared';
import dayjs from 'dayjs';
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

export function useDateTimePickerProps(props, context) {
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
    return DateUtil.toDate(props.defaultValue, valueFormat.value);
  });

  const realMode = computed<DateTimePickerMode>(() => {
    const mode = props.mode;
    if (!mode) {
      return DateTimePickerMode.datetime;
    }
    if (mode === DateTimePickerMode.date) {
      const dateFormat = DateUtil.fetchDateFormat(props.format || props.dateFormat, props.convertDateFormat);
      if (dateFormat.indexOf('D') === -1) {
        return DateTimePickerMode.month;
      }
    }
    return mode;
  });

  const showTime = computed(() => {
    if (isNil(props.showTime)) {
      return props.mode === DateTimePickerMode.datetime;
    }
    return props.showTime;
  });

  /**
   * 真实模式对应的 element-plus 类型
   * element-plus 的时间模式使用 ElTimePicker，其余模式使用 ElDatePicker 的类型
   */
  const realType = computed<string | undefined>(() => {
    switch (realMode.value) {
      case DateTimePickerMode.datetime:
      case DateTimePickerMode.date:
        // antd 开启 showTime 时展示时间列，element-plus 使用日期时间类型
        return showTime.value ? 'datetime' : 'date';
      case DateTimePickerMode.month:
        return 'month';
      case DateTimePickerMode.year:
        return 'year';
      case DateTimePickerMode.week:
        return 'week';
      case DateTimePickerMode.time:
        return undefined;
      default:
        return 'date';
    }
  });

  /**
   * antd showTime.defaultValue → element-plus defaultTime（打开面板时的默认时间）
   */
  const defaultTime = computed(() => {
    const showTimeVal = showTime.value as
      | { defaultValue?: Date | string | { toDate?: () => Date } }
      | boolean
      | undefined;
    if (isObject(showTimeVal) && !isNil(showTimeVal.defaultValue)) {
      return toDate(showTimeVal.defaultValue, valueFormat.value);
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
      if (!isFunction(value)) {
        value = toDate(value as Date | string | { toDate?: () => Date } | undefined, valueFormat.value);
      }
      return {
        text: preset.label || preset.text,
        value
      };
    });
  });

  /**
   * antd 的 disabledDate 接收 Moment，element-plus 传入 Date，使用 dayjs 包装保证 Moment API 兼容
   */
  const disabledDate = computed(() => {
    const val = props.disabledDate;
    if (isNil(val)) {
      return undefined;
    }
    return (date: Date) => val(dayjs(date));
  });

  /**
   * antd disabledTime → element-plus disabledHours/disabledMinutes/disabledSeconds
   * antd 的函数形态接收 Moment，这里使用 dayjs 对象传入（widget 仅使用 toDate/getHours 等兼容方法）
   */
  const disabledTimeProps = computed(() => {
    const disabledTime = props.disabledTime;
    if (isNil(disabledTime)) {
      return {};
    }
    const resolveValue = (val: unknown) => {
      if (isFunction(val)) {
        return val();
      }
      if (isArray(val)) {
        return val;
      }
      return [];
    };
    if (isFunction(disabledTime)) {
      const resolve = (key: string) => (date: Date) => resolveValue(disabledTime(dayjs(date))?.[key]);
      return {
        disabledHours: resolve('disabledHours'),
        disabledMinutes: resolve('disabledMinutes'),
        disabledSeconds: resolve('disabledSeconds')
      };
    }
    return {
      disabledHours: () => resolveValue(disabledTime.disabledHours?.()),
      disabledMinutes: () => resolveValue(disabledTime.disabledMinutes?.()),
      disabledSeconds: () => resolveValue(disabledTime.disabledSeconds?.())
    };
  });

  const panelVisibleChange = (visible: boolean) => {
    props.changeOpenValue?.(visible);
    if (visible) {
      props.openPanelChange?.();
    } else {
      props.closePanelChange?.();
    }
  };

  /**
   * 面板视图切换回调
   * antd 的 onPanelChange 会重新发出当前值，element-plus 使用 panel-change 事件（value 为 Date）
   */
  const panelChange = (val: Date | string | undefined) => {
    const value = typeof val === 'string' ? val : DateUtil.dateFormat(val, valueFormat.value);
    context.emit('update:value', value);
  };

  const formatValue = (val: string) => {
    if (!val) {
      return val;
    }
    return DateUtil.valueFormat(val, valueFormat.value, format.value);
  };

  const emitValue = (val: string) => {
    context.emit('update:value', formatValue(val));
  };

  return {
    format,
    valueFormat,
    realMode,
    realType,
    defaultValue,
    defaultTime,
    shortcuts,
    disabledDate,
    disabledTimeProps,
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
