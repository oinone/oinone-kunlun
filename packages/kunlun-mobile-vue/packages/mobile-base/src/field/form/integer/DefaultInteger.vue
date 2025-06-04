<template>
  <oio-input-number
    :value="realValue"
    :default-value="defaultValue"
    :placeholder="readonly || disabled ? '' : placeholder"
    :min="min"
    :max="max"
    :disabled="disabled"
    :step="step"
    :min-safe-integer="minSafeInteger"
    :max-safe-integer="maxSafeInteger"
    :add-step="addStep"
    :reduce-step="reduceStep"
    :readonly="readonly"
    :precision="0"
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
import { OioInputNumber } from '@oinone/kunlun-vue-ui-mobile-vant';
import { OioInputNumberProps } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { PreSuffixProps } from '../../prop';
import InputPreSuffix from '../common/InputPreSuffix.vue';
import { useNumberProps } from './use-number-props';

export default defineComponent({
  name: 'DefaultInteger',
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
    }
  },
  setup(props) {
    return {
      ...useNumberProps(props)
    };
  }
});
</script>
