<template>
  <detail-common-field :value="value" :empty-style="emptyStyle">
    <oio-color-picker
      :value="realValue"
      :default-value="defaultValue"
      :has-input="hasInput"
      :input-placeholder="placeholder"
      :disabled="disabled"
      readonly
      :predefine="predefine"
      @change="change"
      @activeChange="change"
      @focus="focus"
      @blur="blur"
    />
  </detail-common-field>
</template>
<script lang="ts">
import { ColorFormat, ColorInputPlacement, DEFAULT_PREDEFINE } from '@oinone/kunlun-vue-ui-common';
import { OioColorPicker } from '@oinone/kunlun-vue-ui-el';
import { defineComponent, PropType } from 'vue';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../basic';
import DetailCommonField from '../../common/DetailCommonField.vue';

export default defineComponent({
  name: 'DefaultColorPicker',
  components: {
    DetailCommonField,
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
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    return {
      ...useMetadataProps(props)
    };
  }
});
</script>
