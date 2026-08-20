<template>
  <detail-common-field :is-empty="!realOptions.length" :empty-style="emptyStyle" :value="displayNameListStr">
    <div class="detail-multi-select" v-if="optionColor">
      <div class="detail-multi-select-item" v-for="item in realOptions" :key="item.key" :style="computeStyle(item)">
        <div class="detail-multi-select-item-font" :title="item.label">
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="detail-multi-select" v-else>
      <span :title="displayNameListStr">
        <wrapper-value :currentValue="displayNameListStr" :wrapperToFieldAction="wrapperToFieldAction" />
      </span>
    </div>
  </detail-common-field>
</template>
<script lang="ts">
import type { RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import type { CSSStyle } from '@oinone/kunlun-shared';
import type { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent, type PropType } from 'vue';
import { optionsConvertSelectItem } from '../../util';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  inheritAttrs: false,
  components: {
    DetailCommonField,
    WrapperValue: (_, { attrs }) => {
      if (attrs.wrapperToFieldAction) {
        return (attrs.wrapperToFieldAction as Function)(attrs.currentValue);
      }
      return attrs.currentValue;
    }
  },
  props: {
    displayNameList: {
      type: Array as PropType<RuntimeEnumerationOption[]>,
      default: () => []
    },
    emptyStyle: {
      type: String
    },
    optionColor: {
      type: Boolean
    },
    displayNameListStr: {
      type: String
    },
    wrapperToFieldAction: {
      type: Function
    }
  },
  setup(props) {
    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() =>
      optionsConvertSelectItem(props.displayNameList)
    );

    const computeStyle = (item: SelectItem<RuntimeEnumerationOption>) => {
      const option = item.data;
      const { color, backgroundColor, borderColor } = option;
      const style = {} as CSSStyle;
      if (color) {
        style.color = color;
      }
      if (backgroundColor) {
        style.backgroundColor = backgroundColor;
      }
      if (borderColor) {
        style.borderWidth = '1px';
        style.borderStyle = 'solid';
        style.borderColor = borderColor;
      }

      return style;
    };

    return {
      realOptions,
      computeStyle
    };
  }
});
</script>
