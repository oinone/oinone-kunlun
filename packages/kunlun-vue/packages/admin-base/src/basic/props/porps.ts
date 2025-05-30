import { BooleanHelper } from '@kunlun/shared';
import { isNil } from 'lodash-es';
import { computed, ref, watch } from 'vue';
import { getFormItemThemeConfig } from '../theme';

export const OioCommonProps = {
  change: {
    type: Function
  },
  focus: {
    type: Function
  },
  blur: {
    type: Function
  },
  translate: {
    type: Function
  },
  getPopupContainer: {
    type: Function
  }
};

export const OioMetadataProps = {
  readonly: {
    type: [Boolean, String],
    default: false
  },
  disabled: {
    type: [Boolean, String],
    default: false
  }
};

/**
 * 使用元数据基本属性
 * @param props
 * @param stopWatch 是否停止监听值和默认值变化
 */
export function useMetadataProps(props, stopWatch?: boolean) {
  const realValue = ref(props.value);

  const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

  const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

  if (!stopWatch) {
    const watchValueChanged = (val: unknown) => {
      if (isNil(val)) {
        realValue.value = undefined;
      } else {
        realValue.value = val;
      }
    };

    watch(
      () => props.value,
      (val) => {
        watchValueChanged(val);
      },
      {
        deep: true
      }
    );

    watch(
      () => props.defaultValue,
      (val) => {
        watchValueChanged(val);
      }
    );
  }

  const { placeholder } = usePlaceholderProps(props);
  return {
    placeholder,
    realValue,
    readonly,
    disabled
  };
}

export function usePlaceholderProps(props, placeholder?: string[] | string) {
  return {
    placeholder: computed(() => buildPlaceholder(props, placeholder))
  };
}

export function buildPlaceholder(props, placeholder?: string[] | string) {
  const { readonlyShowPlaceholder, disabledShowPlaceholder } = getFormItemThemeConfig();
  placeholder = placeholder || props.placeholder;
  if (
    (readonlyShowPlaceholder === false && props.readonly === true) ||
    (disabledShowPlaceholder === false && props.disabled === true)
  ) {
    return Array.isArray(placeholder) ? placeholder.map((a) => '') : '';
  }
  return placeholder;
}
