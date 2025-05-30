<script lang="ts">
import { CastHelper, DateTimePickerMode } from '@kunlun/shared';
import { OioTimeRangePickerProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import OioDateTimeRangePicker from './oio-date-time-range-picker.vue';

export default defineComponent({
  name: 'OioTimeRangePicker',
  components: {
    OioDateTimeRangePicker
  },
  props: {
    ...OioTimeRangePickerProps
  },
  emits: ['update:value'],
  render() {
    return createVNode(OioDateTimeRangePicker, {
      ...PropRecordHelper.convert(OioTimeRangePickerProps, CastHelper.cast(this)),
      ...this.$attrs,
      'onUpdate:value': (val) => {
        this.$emit('update:value', val);
      },
      mode: DateTimePickerMode.time,
      hasDateFormat: false,
      hasTimeFormat: true
    });
  }
});
</script>
