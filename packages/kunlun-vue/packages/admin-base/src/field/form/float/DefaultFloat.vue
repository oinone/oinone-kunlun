<template>
  <oio-input-number
    :value="realValue"
    :default-value="defaultValue"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    :precision="precision"
    :min="min"
    :max="max"
    :min-safe-integer="minSafeInteger"
    :max-safe-integer="maxSafeInteger"
    :hiddenStepHandle="hiddenStepHandle"
    :step="step"
    :add-step="addStep"
    :reduce-step="reduceStep"
    :unit="unit"
    :show-thousandth="showThousandth"
    :autocorrection="autocorrection"
    @update:value="change"
    @focus="focus"
    @blur="blur"
  >
    <template v-if="prefix" #prefix>
      <input-pre-suffix :content-type="prefixType" :content="prefix" />
    </template>
    <template v-if="suffix" #suffix>
      <input-pre-suffix :content-type="suffixType" :content="suffix" />
    </template>
  </oio-input-number>
</template>

<script lang="ts">
import { OioInputNumber } from '@oinone/kunlun-vue-ui-antd';
import { OioInputNumberProps } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';
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
    }
  },
  setup(props) {
    return {
      ...useNumberProps(props)
    };
  }
});
</script>
