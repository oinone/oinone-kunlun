<script lang="ts">
import { CastHelper, DateTimePickerMode } from '@oinone/kunlun-shared';
import { OioYearPickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
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
  slots: ['renderExtraFooter'],
  render() {
    return createVNode(
      OioDateTimePicker,
      {
        ...PropRecordHelper.convert(OioYearPickerProps, CastHelper.cast(this)),
        ...this.$attrs,
        'onUpdate:value': (val) => {
          this.$emit('update:value', val);
        },
        mode: DateTimePickerMode.year,
        hasDateFormat: false,
        hasTimeFormat: false
      },
      PropRecordHelper.collectionSlots(this.$slots, ['renderExtraFooter'])
    );
  }
});
</script>
