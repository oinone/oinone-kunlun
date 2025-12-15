<template>
  <oio-year-picker
    :value="realValue"
    :format="format"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :readonly="readonly"
    :disabled="disabled"
    :get-trigger-container="getTriggerContainer"
    dropdown-class-name="vxe-table--ignore-clear"
    @update:value="change"
    @blur="blur"
    @focus="focus"
  />
</template>
<script lang="ts">
import { OioYearPicker, OioYearPickerProps, useInjectOioDefaultFormContext } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'DefaultYearPicker',
  components: {
    OioYearPicker
  },
  inheritAttrs: false,
  props: {
    ...OioYearPickerProps,
    ...OioCommonProps,
    ...OioMetadataProps
  },
  setup(props) {
    const formContext = useInjectOioDefaultFormContext();

    return {
      ...useDateTimePickerProps(props),
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>
