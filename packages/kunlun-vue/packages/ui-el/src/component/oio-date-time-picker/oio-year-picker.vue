<script lang="ts">
import { CastHelper, DateTimePickerMode } from '@kunlun/shared';
import { OioYearPickerProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import OioDateTimePicker from './oio-date-time-picker.vue';

export default defineComponent({
  name: 'OioYearPicker',
  components: {
    OioDateTimePicker
  },
  props: {
    ...OioYearPickerProps
  },
  emits: ['update:value'],
  render() {
    return createVNode(OioDateTimePicker, {
      ...PropRecordHelper.convert(OioYearPickerProps, CastHelper.cast(this)),
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
