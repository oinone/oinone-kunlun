<template>
  <oio-time-picker
    :value="realValue"
    :format="format"
    :time-format="timeFormat"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :readonly="readonly"
    :disabled="disabled"
    :close-panel-change="closePanelChange"
    :open-panel-change="openPanelChange"
    :get-trigger-container="getTriggerContainer"
    dropdown-class-name="vxe-table--ignore-clear"
    @update:value="innerChange"
    @blur="blur"
    @focus="focus"
  />
</template>
<script lang="ts">
import { OioTimePicker } from '@kunlun/vue-ui-antd';
import { OioTimePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps, useInjectOioDefaultFormContext } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'DefaultTimePicker',
  components: {
    OioTimePicker
  },
  inheritAttrs: false,
  props: {
    ...OioTimePickerProps,
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
