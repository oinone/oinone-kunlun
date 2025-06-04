<template>
  <div class="mobile-default-slider">
    <oio-slider
      :value="realValue"
      :default-value="defaultValue"
      :min="min"
      :max="max"
      :step="step"
      :direction="direction"
      :reverse="reverse"
      :tooltip-formatter="tooltipFormatter"
      @update:value="change"
      @focus="focus"
      @blur="blur"
    />
    <oio-input-number
      :value="inputValue"
      :default-value="defaultValue"
      :min="min"
      :max="max"
      :autocorrection="true"
      :hidden-step-handle="true"
      @update:value="onUpdateInputValue"
      @blur="onInputBlur"
    >
      <template #suffix>
        <span>/ {{ max }} </span>
      </template>
    </oio-input-number>
  </div>
</template>
<script lang="ts">
import { NumberHelper } from '@oinone/kunlun-shared';
import { OioInputNumber, OioSlider, SliderDirection, SliderToolbarFormatter } from '@oinone/kunlun-vue-ui-mobile-vant';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../basic';

export default defineComponent({
  name: 'DefaultSlider',
  components: {
    OioSlider,
    OioInputNumber
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: Number
    },
    defaultValue: {
      type: Number
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    step: {
      type: Number,
      default: 1
    },
    direction: {
      type: [String, Object] as PropType<SliderDirection>,
      default: SliderDirection.HORIZONTAL
    },
    reverse: {
      type: Boolean,
      default: false
    },
    hasTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: String
    }
  },
  setup(props) {
    const { realValue, readonly, disabled } = useMetadataProps(props);

    const tooltipFormatter = computed<SliderToolbarFormatter | undefined>(() => {
      if (props.hasTooltip) {
        return (val: number) => {
          if (props.tooltipFormatter) {
            // return `${props.tooltipFormatter}`;
          }
          return `${val}`;
        };
      }
      return undefined;
    });

    const inputValue = ref<number | null | undefined>();

    watch(
      realValue,
      (val: number | undefined) => {
        inputValue.value = NumberHelper.toNumber(val);
      },
      { immediate: true }
    );

    const onUpdateInputValue = (val: number) => {
      inputValue.value = NumberHelper.toNumber(val);
    };

    const onInputBlur = () => {
      props.change?.(inputValue.value);
      props.blur?.();
    };

    return {
      realValue,
      readonly,
      disabled,
      tooltipFormatter,

      inputValue,
      onUpdateInputValue,
      onInputBlur
    };
  }
});
</script>
