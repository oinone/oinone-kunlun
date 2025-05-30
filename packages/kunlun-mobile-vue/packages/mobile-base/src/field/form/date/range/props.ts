import { DateUtil } from '@kunlun/shared';
import { isArray, isNil } from 'lodash-es';
import { computed, PropType, watch } from 'vue';
import { useMetadataProps } from '../../../../basic';

export const DefaultDateTimeRangePickerProps = {
  placeholder: {
    type: [Object, String] as PropType<string | [string, string]>
  },
  startPlaceholder: {
    type: String
  },
  endPlaceholder: {
    type: String
  },
  startDefaultValue: {
    type: [Date, String]
  },
  endDefaultValue: {
    type: [Date, String]
  }
};

export function useDateTimeRangePickerProps(props) {
  const { realValue, readonly, disabled } = useMetadataProps(props, true);

  const format = computed(() => {
    if (props.format) {
      return DateUtil.fixFormat(props.format);
    }
    return undefined;
  });

  const defaultValue = computed<[Date | string | undefined, Date | string | undefined] | undefined>(() => {
    const _defaultValue = props.defaultValue;
    if (isArray(_defaultValue) && _defaultValue.length === 2) {
      const [_startDefaultValue, _endDefaultValue] = _defaultValue;
      return [_startDefaultValue, _endDefaultValue];
    }
    const _startDefaultValue = props.startDefaultValue;
    const _endDefaultValue = props.endDefaultValue;
    if (_startDefaultValue || _endDefaultValue) {
      return [_startDefaultValue, _endDefaultValue];
    }
    return undefined;
  });

  const placeholder = computed(() => {
    const _placeholder = props.placeholder;
    if (isArray(_placeholder) && _placeholder.length === 2) {
      return _placeholder;
    }
    const _startPlaceholder = props.startPlaceholder;
    const _endPlaceholder = props.endPlaceholder;
    if (_startPlaceholder || _endPlaceholder) {
      return [_startPlaceholder, _endPlaceholder];
    }
    return undefined;
  });

  watch(
    () => props.value,
    (val) => {
      if (isNil(val)) {
        realValue.value = undefined;
      } else {
        realValue.value = val;
      }
    },
    { deep: true }
  );

  watch(
    defaultValue,
    (val) => {
      if (isNil(val)) {
        realValue.value = undefined;
      } else {
        realValue.value = val;
      }
    },
    { deep: true }
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
    realValue,
    readonly,
    disabled,
    format,
    defaultValue,
    placeholder
  };
}
