import { BooleanHelper } from '@kunlun/shared';
import { isNil } from 'lodash-es';
import { computed, ref, watch } from 'vue';

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
  }
};

export const OioMetadataProps = {
  // label可能在配置里不设置，但是页面可能会需要字段的label，这个时候就用fieldLabel
  fieldLabel: {
    type: String
  },
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
    watch(
      () => props.value,
      (val) => {
        if (isNil(val)) {
          realValue.value = undefined;
        } else {
          realValue.value = val;
        }
      }
    );

    watch(
      () => props.defaultValue,
      (val) => {
        if (isNil(val)) {
          realValue.value = undefined;
        } else {
          realValue.value = val;
        }
      }
    );
  }

  return {
    realValue,
    readonly,
    disabled
  };
}
