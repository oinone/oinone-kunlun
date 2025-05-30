import { DateTimePickerMode, DateUtil, defaultFormat } from '@kunlun/shared';
import { isArray, isString } from 'lodash-es';
import { Moment } from 'moment';
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { DateFormatEnum } from '../oio-date-time-picker/interface';

export function useDatetimeRangePickerProps(props, context) {
  const dynamicMode = ref<[DateTimePickerMode, DateTimePickerMode] | undefined>(undefined);
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

  const realMode = computed<[DateTimePickerMode, DateTimePickerMode] | undefined>(() => {
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

  const placeholder = computed(() => {
    if (!props.placeholder) {
      return fetchDatetimeRangePickerPlaceholder(props.mode);
    }
    return props.placeholder;
  });
  const showTime = computed(() => {
    return [DateTimePickerMode.datetime, DateTimePickerMode.time].includes(props.mode);
  });

  const panelChange = (val: [Moment | undefined, Moment | undefined], mode: [string | null, string | null]) => {
    const originMode = realMode.value?.[0];
    if (originMode && [DateTimePickerMode.year, DateTimePickerMode.month].includes(originMode)) {
      context.emit(
        'update:value',
        val.map((v) => v?.format(valueFormat.value))
      );
      if (mode[1] === null) {
        panelVisible.value = false;
        dynamicMode.value = realMode.value;
      }
      return;
    }
    dynamicMode.value = mode as [DateTimePickerMode, DateTimePickerMode];
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

  const show = ref(false);
  const formatDate = (date) => dayjs(date).format(props.dateFormat);
  const onConfirm = (values) => {
    const [start, end] = values;
    show.value = false;
    context.emit('update:value', [formatDate(start), formatDate(end)]);
  };

  const toDate = (date) => dayjs(date, props.dateFormat).toDate();
  const defaultDate = computed(() => {
    if (!props.value || !Array.isArray(props.value) || !props.value.length) {
      return null;
    }
    const [start, end] = props.value;
    return [toDate(start), toDate(end)];
  });

  watch(
    () => props.mode,
    () => {
      panelVisible.value = false;
      dynamicMode.value = realMode.value;
    },
    { immediate: true }
  );

  const minDate = computed(() => {
    const date = new Date();
    date.setFullYear(1901);
    date.setMonth(0);
    date.setDate(1);
    date.setHours(0, 0, 0);
    return date;
  });
  const maxDate = computed(() => {
    const date = new Date();
    date.setFullYear(2050);
    date.setMonth(11);
    date.setDate(31);
    date.setHours(23, 59, 59);
    return date;
  });

  return {
    minDate,
    maxDate,
    dynamicMode,
    panelVisible,
    format,
    valueFormat,
    defaultValue,
    realMode,
    showTime,
    placeholder,
    formatter,
    panelChange,
    panelVisibleChange,
    show,
    defaultDate,
    onConfirm
  };
}

export function fetchDatetimeRangePickerPlaceholder(mode: DateTimePickerMode) {
  const translate = Reflect.get(window, 'translate');
  switch (mode) {
    case DateTimePickerMode.datetime:
    case DateTimePickerMode.time:
      return [translate('开始时间'), translate('结束时间')];
    case DateTimePickerMode.year:
      return [translate('开始年份'), translate('结束年份')];
    case DateTimePickerMode.month:
      return [translate('开始月份'), translate('结束月份')];
    case DateTimePickerMode.week:
      return [translate('开始周'), translate('结束周')];
    default:
      return [translate('开始日期'), translate('结束日期')];
  }
}
