import { DateUtil, RSQLOperators } from '@oinone/kunlun-shared';
import { isArray, isNil } from 'lodash-es';
import { computed, PropType, watch } from 'vue';
import { useMetadataProps, buildPlaceholder } from '../../../../basic';

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
  },
  operator: {
    type: String
  },
  isSingle: {
    type: Boolean,
    default: undefined
  }
};

export function useDateTimeRangePickerProps(props) {
  const { realValue, readonly, disabled } = useMetadataProps(props, true);

  const internalIsSingle = computed(() => {
    if (isNil(props.isSingle)) {
      const operator = props.operator;
      if (isNil(operator)) {
        return false;
      }
      return RSQLOperators.isSingle(operator);
    }
    return props.isSingle;
  });

  const format = computed(() => {
    if (props.format) {
      return DateUtil.fixFormat(props.format);
    }
    return undefined;
  });

  const defaultValue = computed<[Date | string | undefined, Date | string | undefined] | undefined>(() => {
    const value = props.defaultValue;
    if (isArray(value) && value.length === 2) {
      const [startValue, endValue] = value;
      if (internalIsSingle.value) {
        return startValue;
      }
      return [startValue, endValue];
    }
    const startValue = props.startDefaultValue;
    const endValue = props.endDefaultValue;
    if (startValue || endValue) {
      if (internalIsSingle.value) {
        return startValue;
      }
      return [startValue, endValue];
    }
    return undefined;
  });

  const placeholder = computed(() => {
    const value = props.placeholder;
    if (isArray(value) && value.length === 2) {
      if (internalIsSingle.value) {
        return buildPlaceholder(props, value[0]);
      }
      return buildPlaceholder(props, value);
    }
    const startValue = props.startPlaceholder;
    const endValue = props.endPlaceholder;
    if (startValue || endValue) {
      if (internalIsSingle.value) {
        return buildPlaceholder(props, startValue);
      }
      return buildPlaceholder(props, [startValue, endValue]);
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

  return {
    realValue,
    readonly,
    disabled,
    format,
    defaultValue,
    placeholder
  };
}
