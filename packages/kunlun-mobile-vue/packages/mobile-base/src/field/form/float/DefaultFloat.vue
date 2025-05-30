<template>
  <oio-input-number
    :value="realValue"
    :inputmode="inputmode"
    :default-value="defaultValue"
    :placeholder="readonly || disabled ? '' : placeholder"
    :min="min"
    :max="max"
    :min-safe-integer="minSafeInteger"
    :max-safe-integer="maxSafeInteger"
    :disabled="disabled"
    :readonly="readonly"
    :step="step"
    :add-step="addStep"
    :reduce-step="reduceStep"
    :precision="precision"
    :unit="unit"
    :show-thousandth="showThousandth"
    :autocorrection="autocorrection"
    @update:value="change"
    @focus="focus"
    @blur="blur"
  >
    <template #prefix v-if="prefix">
      <input-pre-suffix v-if="prefix" :content-type="prefixType" :content="prefix" />
    </template>
    <template #suffix v-if="suffix">
      <input-pre-suffix v-if="suffix" :content-type="suffixType" :content="suffix" />
    </template>
  </oio-input-number>
</template>

<script lang="ts">
import { IInputmodeEnum, OioInputNumber } from '@kunlun/vue-ui-mobile-vant';
import { OioInputNumberProps } from '@kunlun/vue-ui-common';
import { defineComponent, PropType } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { PreSuffixProps } from '../../prop';
import InputPreSuffix from '../common/InputPreSuffix.vue';
import { useNumberProps } from '../integer/use-number-props';

export default defineComponent({
  name: 'DefaultFloat',
  components: {
    OioInputNumber,
    InputPreSuffix
  },
  inheritAttrs: false,
  props: {
    ...OioInputNumberProps,
    ...OioCommonProps,
    ...OioMetadataProps,
    ...PreSuffixProps,
    min: {
      type: [Number, String]
    },
    max: {
      type: [Number, String]
    },
    precision: {
      type: Number,
      default: 2
    },
    inputmode: {
      type: String as PropType<IInputmodeEnum>
    }
  },
  setup(props) {
    return {
      ...useNumberProps(props)
    };
  }
});
</script>
