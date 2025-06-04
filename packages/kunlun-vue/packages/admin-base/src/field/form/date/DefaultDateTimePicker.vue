<template>
  <oio-date-time-picker
    :value="realValue"
    :format="format"
    :date-format="dateFormat"
    :time-format="timeFormat"
    :value-format="valueFormat"
    :allow-clear="allowClear"
    :placeholder="placeholder"
    :readonly="readonly"
    :disabled="disabled"
    :close-panel-change="closePanelChange"
    :open-panel-change="openPanelChange"
    :open="open"
    :change-open-value="changeOpenValue"
    :disabled-date="disabledDate"
    :disabled-time="disabledTime"
    :show-time="{ defaultValue: showTimeDefaultValue }"
    :get-trigger-container="getTriggerContainer"
    dropdown-class-name="vxe-table--ignore-clear"
    @update:value="innerChange"
    @blur="blur"
    @focus="focus"
  >
    <template v-if="quickOptions && quickOptions.length" #renderExtraFooter>
      <div class="date-quick-options">
        <div
          v-for="item in quickOptions"
          :class="['date-quick-options-label', quickOptionsCompareDisable(item) && 'disabled']"
          :key="item"
          @click="quickChange(item)"
        >
          {{ DateQuickOptionListMap.get(item).label }}
        </div>
      </div>
    </template>
  </oio-date-time-picker>
</template>
<script lang="ts">
import { OioDateTimePicker } from '@oinone/kunlun-vue-ui-antd';
import { OioDateTimePickerProps } from '@oinone/kunlun-vue-ui-common';
import { Moment } from 'moment';
import { defineComponent, PropType } from 'vue';
import { OioCommonProps, OioMetadataProps, useInjectOioDefaultFormContext } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';
import { DateQuickOption } from './date-common';

export default defineComponent({
  name: 'DefaultDateTimePicker',
  components: {
    OioDateTimePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps,
    showTimeDefaultValue: {
      type: Object as PropType<Moment>
    },
    quickOptions: {
      type: Array as PropType<DateQuickOption[]>
    },
    quickChange: {
      type: Function
    },
    quickOptionsCompareDisable: {
      type: Function
    },
    correctingStartShowTimeDefaultValue: {
      type: Function
    }
  },
  setup(props) {
    const innerChange = (e) => {
      if (props.change) {
        if (props.correctingStartShowTimeDefaultValue) {
          props.change(props.correctingStartShowTimeDefaultValue(e));
        } else {
          props.change(e);
        }
      }
      if (!e) {
        // 清空事件走关闭面板相同逻辑, 后面走聚焦事件
        props.closePanelChange?.();
      }
    };

    const formContext = useInjectOioDefaultFormContext();

    return {
      ...useDateTimePickerProps(props),
      innerChange,
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>
