<script lang="ts">
import { CastHelper, DateTimePickerMode } from '@kunlun/shared';
import { OioDateRangePickerProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import OioDateTimeRangePicker from './oio-date-time-range-picker.vue';

export default defineComponent({
  name: 'OioDateRangePicker',
  components: {
    OioDateTimeRangePicker
  },
  props: {
    ...OioDateRangePickerProps
  },
  emits: ['update:value'],
  render() {
    return createVNode(OioDateTimeRangePicker, {
      ...PropRecordHelper.convert(OioDateRangePickerProps, CastHelper.cast(this)),
      ...this.$attrs,
      'onUpdate:value': (val) => {
        this.$emit('update:value', val);
      },
      mode: DateTimePickerMode.date,
      hasDateFormat: true,
      hasTimeFormat: false
    });
  }
});
</script>
