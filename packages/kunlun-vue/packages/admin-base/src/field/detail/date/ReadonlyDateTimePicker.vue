<template>
  <detail-common-field :value="realValue" :is-empty="isRealEmpty" :empty-style="emptyStyle" />
</template>
<script lang="ts">
import { OioDateTimePickerFormatProps } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';
import DetailCommonField from '../common/DetailCommonField.vue';
import { useDateTimePicker } from './use-date-time-picker';

export default defineComponent({
  name: 'ReadonlyDateTimePicker',
  components: { DetailCommonField },
  props: {
    ...OioDateTimePickerFormatProps,
    value: {
      type: [Date, String],
      default: ''
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    return {
      ...useDateTimePicker(props)
    };
  }
});
</script>
