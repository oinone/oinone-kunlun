<script lang="ts">
import { CastHelper, DateTimePickerMode } from '@kunlun/shared';
import { OioTimePickerProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import OioDateTimePicker from './oio-date-time-picker.vue';

export default defineComponent({
  name: 'OioTimePicker',
  components: {
    OioDateTimePicker
  },
  props: {
    ...OioTimePickerProps
  },
  emits: ['update:value'],
  slots: ['renderExtraFooter'],
  render() {
    return createVNode(
      OioDateTimePicker,
      {
        ...PropRecordHelper.convert(OioTimePickerProps, CastHelper.cast(this)),
        ...this.$attrs,
        'onUpdate:value': (val) => {
          this.$emit('update:value', val);
        },
        mode: DateTimePickerMode.time,
        hasDateFormat: false,
        hasTimeFormat: true
      },
      PropRecordHelper.collectionSlots(this.$slots, ['renderExtraFooter'])
    );
  }
});
</script>
