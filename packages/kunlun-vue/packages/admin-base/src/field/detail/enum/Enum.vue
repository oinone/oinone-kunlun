<template>
  <div v-if="realOptions.length > 0 && optionColor" class="detail-multi-select">
    <div class="detail-multi-select-item" v-for="item in realOptions" :key="item.key" :style="computeStyle(item)">
      <div class="detail-multi-select-item-font" :title="item.label">
        {{ item.label }}
      </div>
    </div>
  </div>
  <div v-else>
    <detail-common-field :empty-style="emptyStyle" :value="displayNameListStr" />
  </div>
</template>
<script lang="ts">
import { EnumOptionState } from '@oinone/kunlun-meta';
import { RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import { CSSStyle } from '@oinone/kunlun-shared';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent, PropType } from 'vue';
import { optionsConvertSelectItem } from '../../util';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  components: { DetailCommonField },
  inheritAttrs: false,
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
