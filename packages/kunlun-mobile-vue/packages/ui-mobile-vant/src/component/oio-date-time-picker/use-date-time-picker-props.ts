import { DateTimePickerMode, DateUtil, defaultFormat } from '@kunlun/shared';
import { isString } from 'lodash-es';
import { Moment } from 'moment';
import { computed, ref, watch } from 'vue';
import { DateFormatEnum } from './interface';

export function useDateTimePickerProps(props, context) {
  const dynamicMode = ref<DateTimePickerMode | undefined>(undefined);
  const panelVisible = ref<boolean>(false);

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

  const formatter = (type, val) => {
    return val + DateFormatEnum[type];
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

  const formatDisplayValue = computed(() => {
    return DateUtil.autoFormat(realMode.value!, props.value, format.value);
  });

  const realMode = computed<DateTimePickerMode | undefined>(() => {
    const mode = props.mode;
    if (mode) {
      switch (mode) {
        case DateTimePickerMode.datetime:
          return undefined;
        case DateTimePickerMode.date: {
          const dateFormat = DateUtil.fetchDateFormat(props.format || props.dateFormat, props.convertDateFormat);
          if (dateFormat.indexOf('D') === 0) {
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
    return props.mode === DateTimePickerMode.datetime;
  });

  const panelChange = (val: Moment, mode: string) => {
    if (realMode.value && [DateTimePickerMode.year, DateTimePickerMode.month].includes(realMode.value)) {
      context.emit('update:value', val.format(valueFormat.value));
      panelVisible.value = false;
      dynamicMode.value = realMode.value;
      return;
    }
    dynamicMode.value = mode as DateTimePickerMode;
  };

  const panelVisibleChange = (visible: boolean) => {
    if (props.readonly) {
      visible = false;
    }
    panelVisible.value = visible;
    if (!visible) {
      dynamicMode.value = realMode.value;
    }
  };

  watch(
    () => props.mode,
    () => {
      panelVisible.value = false;
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
    formatDisplayValue,
    realMode,
    showTime,
    formatter,
    panelChange,
    panelVisibleChange
  };
}

export function fetchDatetimePickerPlaceholder(mode: DateTimePickerMode) {
  const translate = Reflect.get(window, 'translate');
  switch (mode) {
    case DateTimePickerMode.date:
      return translate('请选择日期');
    case DateTimePickerMode.time:
      return translate('请选择时间');
    case DateTimePickerMode.year:
      return translate('请选择年份');
    case DateTimePickerMode.month:
      return translate('请选择月份');
    case DateTimePickerMode.week:
      return translate('请选择周');
    default:
      return translate('请选择日期时间');
  }
}
