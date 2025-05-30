import {
  DateFormatMap,
  DateTimeFormatMap,
  DateTimePickerMode,
  defaultDateFormat,
  defaultFormat,
  defaultTimeFormat,
  defaultYearFormat,
  defaultYearValueFormat,
  TimeFormatMap
} from '@kunlun/shared';
import { PropType } from 'vue';
import { OioDateTimePickerFormatProps } from '../oio-date-time-picker';

const OioCommonDateTimeRangePickerProps = {
  title: {
    type: String
  },
  placeholder: {
    type: Object as PropType<[string, string]>
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  format: {
    type: String
  },
  valueFormat: {
    type: String,
    default: defaultFormat
  },
  allowClear: {
    type: Boolean,
    default: true
  },
  showTime: {
    type: [Boolean, Object],
    default: undefined
  },
  popperClass: {
    type: [String, Array] as PropType<string | string[]>
  },
  dropdownClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  separator: {
    type: String,
    default: '~'
  },
  openPanelChange: {
    type: Function
  },
  closePanelChange: {
    type: Function
  },
  getTriggerContainer: {
    type: Function
  }
};

export const OioDateTimeRangePickerValueProps = {
  value: {
    type: Object as PropType<[Date | string | undefined, Date | string | undefined]>
  },
  defaultValue: {
    type: Object as PropType<[Date | string | undefined, Date | string | undefined]>
  }
};

export const OioDateTimeRangePickerProps = {
  ...OioCommonDateTimeRangePickerProps,
  ...OioDateTimeRangePickerValueProps,
  ...OioDateTimePickerFormatProps,
  mode: {
    type: String as PropType<DateTimePickerMode>,
    default: DateTimePickerMode.datetime
  }
};

const DateRangeDefaultFormatMap = {
  ...DateTimeFormatMap,
  ...DateFormatMap
};

export const OioDateRangePickerProps = {
  ...OioCommonDateTimeRangePickerProps,
  ...OioDateTimeRangePickerValueProps,
  dateFormat: {
    type: String,
    default: defaultDateFormat
  },
  valueFormat: {
    type: String,
    default: defaultDateFormat
  },
  convertFormat: {
    type: Function as PropType<(val: string) => string | undefined>,
    default: (val: string) => {
      return DateRangeDefaultFormatMap[val];
    }
  }
};

const TimeRangeDefaultFormatMap = {
  ...DateTimeFormatMap,
  ...TimeFormatMap
};

export const OioTimeRangePickerProps = {
  ...OioCommonDateTimeRangePickerProps,
  ...OioDateTimeRangePickerValueProps,
  timeFormat: {
    type: String,
    default: defaultTimeFormat
  },
  valueFormat: {
    type: String,
    default: defaultTimeFormat
  },
  convertFormat: {
    type: Function as PropType<(val: string) => string | undefined>,
    default: (val: string) => {
      return TimeRangeDefaultFormatMap[val];
    }
  }
};

export const OioYearRangePickerProps = {
  ...OioCommonDateTimeRangePickerProps,
  ...OioDateTimeRangePickerValueProps,
  format: {
    type: String,
    default: defaultYearFormat
  },
  valueFormat: {
    type: String,
    default: defaultYearValueFormat
  }
};
