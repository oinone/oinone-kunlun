<script lang="ts">
import { CastHelper, DateTimePickerMode } from '@kunlun/shared';
import { OioYearRangePickerProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import OioDateTimeRangePicker from './oio-date-time-range-picker.vue';

export default defineComponent({
  name: 'OioYearRangePicker',
  components: {
    OioDateTimeRangePicker
  },
  props: {
    ...OioYearRangePickerProps
  },
  emits: ['update:value'],
  render() {
    return createVNode(OioDateTimeRangePicker, {
      ...PropRecordHelper.convert(OioYearRangePickerProps, CastHelper.cast(this)),
      ...this.$attrs,
      'onUpdate:value': (val) => {
        this.$emit('update:value', val);
      },
      mode: DateTimePickerMode.year,
      hasDateFormat: false,
      hasTimeFormat: false
    });
  }
});
</script>
