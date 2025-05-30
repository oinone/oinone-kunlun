<template>
  <gallery-common-field :is-empty="false" :justify-content="justifyContent">
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
        class="gallery-string-value gallery-string-value-empty"
        :style="contentStyle"
        :empty-style="emptyStyle"
      />
      <span v-else class="gallery-string-value" :title="currentValue" :style="contentStyle">{{
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
  </gallery-common-field>
</template>
<script lang="ts">
import { CSSStyle } from '@kunlun/shared';
import { OioEmpty } from '@kunlun/vue-ui-common';
import { computed, defineComponent } from 'vue';
import InputPreSuffix from '../../../form/common/InputPreSuffix.vue';
import { PreSuffixProps } from '../../../prop';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  components: { GalleryCommonField, InputPreSuffix, OioEmpty },
  inheritAttrs: false,
  props: {
    ...PreSuffixProps,
    currentValue: {
      type: [String, Number],
      default: undefined
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
.gallery-string-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.gallery-string-value-empty {
    font-weight: 400;
    color: var(--oio-text-color-secondary);
  }
}
</style>
