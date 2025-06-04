<script lang="ts">
import { CastHelper, DateTimePickerMode } from '@oinone/kunlun-shared';
import { OioDatePickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent } from 'vue';
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
  setup(props) {
    const YYYMMFormat = ['YYYY年MM月', 'YYYY-MM', 'YYYY/MM'];

    const mode = computed(() => {
      if (props.format) {
        if (YYYMMFormat.includes(props.format)) {
          return 'year-month';
        }
      }

      return DateTimePickerMode.date;
    });

    return { mode };
  },
  render() {
    return createVNode(OioDateTimePicker, {
      ...PropRecordHelper.convert(OioDatePickerProps, CastHelper.cast(this)),
      ...this.$attrs,
      'onUpdate:value': (val) => {
        this.$emit('update:value', val);
      },
      mode: this.mode,
      hasDateFormat: true,
      hasTimeFormat: false
    });
  }
});
</script>
