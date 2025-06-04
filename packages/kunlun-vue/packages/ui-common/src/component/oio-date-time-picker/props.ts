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
} from '@oinone/kunlun-shared';
import { PropType } from 'vue';

type DisabledTimePropType =
  | ((date) => { disabledHours: number[]; disabledMinutes: number[]; disabledSeconds: number[] })
  | {
      disabledHours?: () => number[];
      disabledMinutes?: () => number[];
      disabledSeconds?: () => number[];
    };

export const OioCommonDateTimePickerProps = {
  title: {
    type: String
  },
  placeholder: {
    type: String
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
  open: {
    type: Boolean,
    default: undefined
  },
  locale: {
    type: Object
  },
  dropdownClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  changeOpenValue: {
    type: Function
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

export const OioDateTimePickerValueProps = {
  showToday: {
    type: Boolean,
    default: true
  },
  value: {
    type: [Date, String]
  },
  defaultValue: {
    type: [Date, String]
  }
};

export const OioDateTimePickerFormatProps = {
  format: {
    type: String
  },
  dateFormat: {
    type: String,
    default: defaultDateFormat
  },
  timeFormat: {
    type: String,
    default: defaultTimeFormat
  },
  valueFormat: {
    type: String,
    default: defaultFormat
  },
  hasDateFormat: {
    type: Boolean,
    default: true
  },
  hasTimeFormat: {
    type: Boolean,
    default: true
  },
  convertFormat: {
    type: Function as PropType<(val: string) => string | undefined>
  },
  convertDateFormat: {
    type: Function as PropType<(val: string) => string | undefined>
  },
  convertTimeFormat: {
    type: Function as PropType<(val: string) => string | undefined>
  }
};

export const OioDateTimePickerProps = {
  ...OioCommonDateTimePickerProps,
  ...OioDateTimePickerValueProps,
  ...OioDateTimePickerFormatProps,
  mode: {
    type: String as PropType<DateTimePickerMode>,
    default: DateTimePickerMode.datetime
  },
  disabledDate: {
    type: Function as PropType<(date) => boolean>
  },
  disabledTime: {
    type: [Function, Object] as PropType<DisabledTimePropType>
  }
};

const DateDefaultFormatMap = {
  ...DateTimeFormatMap,
  ...DateFormatMap
};

export const OioDatePickerProps = {
  ...OioCommonDateTimePickerProps,
  ...OioDateTimePickerValueProps,
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
      return DateDefaultFormatMap[val];
    }
  },
  disabledDate: {
    type: Function as PropType<(date) => boolean>
  },
  disabledTime: {
    type: [Function, Object] as PropType<DisabledTimePropType>
  }
};

const TimeDefaultFormatMap = {
  ...DateTimeFormatMap,
  ...TimeFormatMap
};

export const OioTimePickerProps = {
  ...OioCommonDateTimePickerProps,
  ...OioDateTimePickerValueProps,
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
      return TimeDefaultFormatMap[val];
    }
  },
  disabledTime: {
    type: [Function, Object] as PropType<DisabledTimePropType>
  }
};

export const OioYearPickerProps = {
  ...OioCommonDateTimePickerProps,
  ...OioDateTimePickerValueProps,
  format: {
    type: String,
    default: defaultYearFormat
  },
  valueFormat: {
    type: String,
    default: defaultYearValueFormat
  }
};
