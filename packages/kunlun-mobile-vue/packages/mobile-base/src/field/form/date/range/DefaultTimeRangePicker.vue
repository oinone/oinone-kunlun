<template>
  <default-form-item
    :name="itemName"
    :invisible="invisible"
    :colon="colon"
    :layout="layout"
    :label="label"
    :help="help"
    :hint="hint"
    :required="required"
    :validate-trigger="validateTrigger"
    :validator-info="validatorInfo"
    :allow-clear="allowClear"
    :clear-value="clearValue"
  >
    <van-config-provider>
      <oio-time-range-picker
        :title="fieldLabel"
        :value="realValue"
        :default-value="defaultValue"
        :format="format"
        :time-format="timeFormat"
        :value-format="valueFormat"
        :placeholder="readonly || disabled ? '' : placeholder"
        :allow-clear="allowClear"
        :readonly="readonly"
        :disabled="disabled"
        @update:value="change"
        @blur="blur"
        @focus="focus"
      />
    </van-config-provider>
  </default-form-item>
</template>
<script lang="ts">
import { OioTimeRangePicker } from '@kunlun/vue-ui-mobile-vant';
import { OioTimeRangePickerProps } from '@kunlun/vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { BaseFormItemProps, DefaultFormItem, OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from './props';

export default defineComponent({
  name: 'DefaultTimeRangePicker',
  components: {
    OioTimeRangePicker,
    VanConfigProvider,
    DefaultFormItem
  },
  inheritAttrs: false,
  props: {
    ...OioTimeRangePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps,
    ...BaseFormItemProps,
    ...DefaultDateTimeRangePickerProps,
    itemName: {
      type: String
    }
  },
  setup(props) {
    return {
      ...useDateTimeRangePickerProps(props)
    };
  }
});
</script>
