<template>
  <gallery-common-field :value="realValue" :is-empty="isRealEmpty" :justify-content="justifyContent" :empty-style="emptyStyle" />
</template>
<script lang="ts">
import { FlexRowJustify, OioDateTimePickerFormatProps } from '@kunlun/vue-ui-common';
import { defineComponent, PropType } from 'vue';
import { useDateTimePicker } from '../../detail/date/use-date-time-picker';
import GalleryCommonField from '../common/GalleryCommonField.vue';

export default defineComponent({
  name: 'ReadonlyDateTimePicker',
  components: {
    GalleryCommonField
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimePickerFormatProps,
    value: {
      type: [Date, String],
      default: ''
    },
    justifyContent: {
      type: String as PropType<FlexRowJustify>
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
