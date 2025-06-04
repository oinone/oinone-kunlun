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
  >
    <detail-common-field :value="realValue" :is-empty="isRealEmpty" :empty-style="emptyStyle" />
  </default-form-item>
</template>
<script lang="ts">
import { OioDateTimePickerFormatProps } from '@oinone/kunlun-vue-ui-common';
import { defineComponent, PropType } from 'vue';
import { BaseFormItemProps, DefaultFormItem } from '../../../../basic';
import DetailCommonField from '../../common/DetailCommonField.vue';
import { useDateTimeRangePicker } from './use-date-time-range-picker';

export default defineComponent({
  name: 'ReadonlyDateTimeRangePicker',
  components: { DetailCommonField, DefaultFormItem },
  props: {
    ...OioDateTimePickerFormatProps,
    ...BaseFormItemProps,
    itemName: {
      type: String
    },
    value: {
      type: Object as PropType<[Date | string | undefined, Date | string | undefined]>
    },
    separator: {
      type: String,
      default: '~'
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    return {
      ...useDateTimeRangePicker(props)
    };
  }
});
</script>
