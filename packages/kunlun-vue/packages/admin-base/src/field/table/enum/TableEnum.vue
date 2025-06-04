<template>
  <div v-if="realOptions.length > 0 && optionColor" class="table-multi-select oio-scrollbar detail-multi-select">
    <div class="detail-multi-select-item" v-for="item in realOptions" :key="item.key" :style="computeStyle(item)">
      <div class="detail-multi-select-item-font" :title="item.label">
        {{ item.label }}
      </div>
    </div>
  </div>
  <span v-else>{{ currentValue }}</span>
</template>
<script lang="ts">
import { EnumOptionState } from '@oinone/kunlun-meta';
import { RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import { CSSStyle } from '@oinone/kunlun-shared';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent, PropType } from 'vue';
import { enumFetchOptionByValue, optionsConvertSelectItem } from '../../util';

export default defineComponent({
  inheritAttrs: false,
  props: {
    options: {
      type: Array as PropType<RuntimeEnumerationOption[]>
    },
    optionColor: {
      type: Boolean
    },
    currentValue: {
      type: String
    },
    value: {
      type: [Boolean, String, Array] as PropType<boolean | string | string[]>,
      default: undefined
    }
  },
  setup(props) {
    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() =>
      optionsConvertSelectItem(enumFetchOptionByValue(props.value, props.options))
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
