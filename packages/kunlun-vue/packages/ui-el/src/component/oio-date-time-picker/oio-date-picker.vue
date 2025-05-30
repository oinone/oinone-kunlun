<script lang="ts">
import { CastHelper, DateFormatMap, DateTimePickerMode } from '@kunlun/shared';
import { OioDatePickerProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import OioDateTimePicker from './oio-date-time-picker.vue';

export default defineComponent({
  name: 'OioDatePicker',
  components: {
    OioDateTimePicker
  },
  props: {
    ...OioDatePickerProps
  },
  emits: ['update:value'],
  setup() {
    const convertFormat = (val: string) => {
      return DateFormatMap.get(val);
    };
    return {
      convertFormat
    };
  },
  render() {
    return createVNode(OioDateTimePicker, {
      ...PropRecordHelper.convert(OioDatePickerProps, CastHelper.cast(this)),
      ...this.$attrs,
      'onUpdate:value': (val) => {
        this.$emit('update:value', val);
      },
      mode: DateTimePickerMode.date,
      hasDateFormat: true,
      hasTimeFormat: false,
      convertFormat: this.convertFormat
    });
  }
});
</script>
