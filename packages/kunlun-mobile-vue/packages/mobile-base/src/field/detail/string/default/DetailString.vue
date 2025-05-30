<template>
  <detail-common-field :is-empty="false">
    <template #default>
      <InputPreSuffix
        v-if="prefix"
        :content-type="prefixType"
        :content="prefix"
        :style="prefixStyle"
        :color="valueColor"
        :font-size="valueFontSize"
      />
      <oio-empty
        v-if="!currentValue"
        class="detail-string-value detail-string-value-empty"
        :style="contentStyle"
        :empty-style="emptyStyle"
      />
      <span v-else class="detail-string-value" :title="currentValue" :style="contentStyle">{{
        currentValue || '-'
      }}</span>
      <InputPreSuffix
        v-if="suffix"
        :content-type="suffixType"
        :content="suffix"
        :style="suffixStyle"
        :color="valueColor"
        :font-size="valueFontSize"
      />
    </template>
  </detail-common-field>
</template>
<script lang="ts">
import { CSSStyle } from '@kunlun/shared';
import { OioEmpty } from '@kunlun/vue-ui-common';
import { computed, defineComponent } from 'vue';
import InputPreSuffix from '../../../form/common/InputPreSuffix.vue';
import { PreSuffixProps } from '../../../prop';
import DetailCommonField from '../../common/DetailCommonField.vue';

export default defineComponent({
  components: { DetailCommonField, InputPreSuffix, OioEmpty },
  inheritAttrs: false,
  props: {
    ...PreSuffixProps,
    currentValue: {
      type: String
    },
    justifyContent: {
      type: String
    },
    valueFontSize: {
      type: String
    },
    valueColor: {
      type: String
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    const prefixStyle = computed<CSSStyle>(() => {
      const styleValue = {} as CSSStyle;
      styleValue.marginRight = '4px';
      styleValue.fontSize = props.valueFontSize || '';
      styleValue.color = props.valueColor || '';
      return styleValue;
    });

    const suffixStyle = computed<CSSStyle>(() => {
      const styleValue = {} as CSSStyle;
      styleValue.marginLeft = '4px';
      styleValue.fontSize = props.valueFontSize || '';
      styleValue.color = props.valueColor || '';
      return styleValue;
    });

    const contentStyle = computed(() => {
      const styleValue = {} as CSSStyle;
      styleValue.fontSize = props.valueFontSize || '';
      styleValue.color = props.valueColor || '';
      return styleValue;
    });

    return {
      prefixStyle,
      suffixStyle,
      contentStyle
    };
  }
});
</script>
<style lang="scss">
.detail-string-value {
  &.detail-string-value-empty {
    font-weight: 400;
    color: var(--oio-text-color-secondary);
  }
}
</style>
