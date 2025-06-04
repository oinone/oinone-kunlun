<script lang="ts">
import {
  BooleanHelper,
  CastHelper,
  NumberHelper,
  OioInputNumber,
  StandardNumber,
  StringHelper
} from '@oinone/kunlun-vue-ui-antd';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType, ref, watch } from 'vue';
import { getFormItemThemeConfig, OioMetadataProps } from '../../basic';

function computeNumberStringProp(val: StandardNumber) {
  const num = NumberHelper.toBigNumber(val);
  if (!isNil(num)) {
    return num.toString();
  }
  return num;
}

function computeNumberProp(val: StandardNumber) {
  const num = NumberHelper.toNumber(val);
  if (isNil(num)) {
    return undefined;
  }
  return num;
}

export default defineComponent({
  name: 'NumberRange',
  components: {
    OioInputNumber
  },
  inheritAttrs: false,
  props: {
    // single props
    ...OioMetadataProps,
    formatter: {
      type: Function as PropType<(value: string) => string>
    },
    parser: {
      type: Function as PropType<(value: string) => string>
    },
    step: {
      type: [Number, String],
      default: 1
    },
    addStep: {
      type: [Number, String]
    },
    reduceStep: {
      type: [Number, String]
    },
    precision: {
      type: Number
    },
    showThousandth: {
      type: Boolean,
      default: false
    },
    autocorrection: {
      type: Boolean,
      default: false
    },
    separator: {
      type: String,
      default: '~'
    },

    // left props
    leftValue: {
      type: [Number, String]
    },
    leftDefaultValue: {
      type: [Number, String]
    },
    leftPlaceholder: {
      type: String
    },
    leftMin: {
      type: [Number, String]
    },
    leftMax: {
      type: [Number, String]
    },
    leftChange: {
      type: Function
    },
    leftFocus: {
      type: Function
    },
    leftBlur: {
      type: Function
    },

    // right props
    rightValue: {
      type: [Number, String]
    },
    rightDefaultValue: {
      type: [Number, String]
    },
    rightPlaceholder: {
      type: String
    },
    rightMin: {
      type: [Number, String]
    },
    rightMax: {
      type: [Number, String]
    },
    rightChange: {
      type: Function
    },
    rightFocus: {
      type: Function
    },
    rightBlur: {
      type: Function
    }
  },
  setup(props) {
    const leftValue = ref(props.leftValue);
    const rightValue = ref(props.rightValue);

    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

    const watchValueChanged = (val: { left: StandardNumber; right: StandardNumber }) => {
      const { left, right } = val;
      if (isNil(left)) {
        leftValue.value = undefined;
      } else {
        leftValue.value = left;
      }
      if (isNil(right)) {
        rightValue.value = undefined;
      } else {
        rightValue.value = right;
      }
    };

    watch(
      () => ({
        left: props.leftValue,
        right: props.rightValue
      }),
      (val) => {
        watchValueChanged(val);
      },
      {
        deep: true
      }
    );

    watch(
      () => ({
        left: props.leftDefaultValue,
        right: props.rightDefaultValue
      }),
      (val) => {
        watchValueChanged(val);
      }
    );

    const computePlaceholder = (placeholder: string | undefined) => {
      const { readonlyShowPlaceholder, disabledShowPlaceholder } = getFormItemThemeConfig();
      if (
        (readonlyShowPlaceholder === false && readonly.value) ||
        (disabledShowPlaceholder === false && disabled.value)
      ) {
        return '';
      }
      return placeholder;
    };

    const leftPlaceholder = computed(() => {
      return computePlaceholder(props.leftPlaceholder);
    });

    const rightPlaceholder = computed(() => {
      return computePlaceholder(props.rightPlaceholder);
    });

    const leftMin = computed(() => computeNumberStringProp(props.leftMin));
    const rightMin = computed(() => computeNumberStringProp(props.rightMin));

    const leftMax = computed(() => computeNumberStringProp(props.leftMax));
    const rightMax = computed(() => computeNumberStringProp(props.rightMax));

    const precision = computed(() => computeNumberProp(props.precision));

    return {
      readonly,
      disabled,
      precision,

      leftValue,
      leftPlaceholder,
      leftMin,
      leftMax,

      rightValue,
      rightPlaceholder,
      rightMin,
      rightMax
    };
  },
  render() {
    const {
      readonly,
      disabled,
      formatter,
      parser,
      step,
      addStep,
      reduceStep,
      precision,
      showThousandth,
      autocorrection,
      separator,

      leftValue,
      leftDefaultValue,
      leftPlaceholder,
      leftMin,
      leftMax,
      leftChange,
      leftFocus,
      leftBlur,

      rightValue,
      rightDefaultValue,
      rightPlaceholder,
      rightMin,
      rightMax,
      rightChange,
      rightFocus,
      rightBlur
    } = this;
    return createVNode(
      'div',
      {
        class: StringHelper.append(['number-range'], CastHelper.cast(this.$attrs.class))
      },
      [
        createVNode(OioInputNumber, {
          readonly,
          disabled,
          formatter,
          parser,
          precision,
          hiddenStepHandle: true,
          showThousandth,
          autocorrection,

          value: leftValue,
          defaultValue: leftDefaultValue,
          placeholder: leftPlaceholder,
          min: leftMin,
          max: leftMax,
          'onUpdate:value': leftChange,
          onFocus: leftFocus,
          onBlur: leftBlur
        }),
        createVNode(
          'span',
          {
            class: 'number-range-separator'
          },
          separator
        ),
        createVNode(OioInputNumber, {
          readonly,
          disabled,
          formatter,
          parser,
          precision,
          hiddenStepHandle: true,
          showThousandth,
          autocorrection,

          value: rightValue,
          defaultValue: rightDefaultValue,
          placeholder: rightPlaceholder,
          min: rightMin,
          max: rightMax,
          'onUpdate:value': rightChange,
          onFocus: rightFocus,
          onBlur: rightBlur
        })
      ]
    );
  }
});
</script>
