<template>
  <oio-color-picker
    class="default-color-picker"
    :value="realValue"
    :default-value="defaultValue"
    :has-input="hasInput"
    :input-placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :predefine="predefine"
    @change="change"
    @focus="focus"
    @blur="blur"
  />
</template>
<script lang="ts">
import { ColorFormat, ColorInputPlacement, DEFAULT_PREDEFINE } from '@kunlun/vue-ui-common';
import { OioColorPicker } from '@kunlun/vue-ui-el';
import { translateValueByKey } from '@kunlun/engine';
import { defineComponent, PropType } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';

export default defineComponent({
  name: 'DefaultColorPicker',
  components: {
    OioColorPicker
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: String
    },
    defaultValue: {
      type: String
    },
    colorFormat: {
      type: [String, Object] as PropType<ColorFormat>,
      default: ColorFormat.RGB
    },
    hasInput: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: translateValueByKey('请选择颜色')
    },
    inputPlacement: {
      type: [String, Object] as PropType<ColorInputPlacement>,
      default: ColorInputPlacement.BEFORE
    },
    predefine: {
      type: Array as PropType<string[]>,
      default: DEFAULT_PREDEFINE
    }
  },
  setup(props) {
    return {
      ...useMetadataProps(props)
    };
  }
});
</script>
<style lang="scss">
.default-color-picker {
  width: 100%;
}
</style>
