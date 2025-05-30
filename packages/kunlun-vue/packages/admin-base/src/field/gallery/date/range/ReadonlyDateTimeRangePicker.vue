<template>
  <default-gallery-item :label="label" :invisible="invisible">
    <gallery-common-field
      :value="realValue"
      :is-empty="isRealEmpty"
      :justify-content="justifyContent"
      :empty-style="emptyStyle"
    />
  </default-gallery-item>
</template>
<script lang="ts">
import { FlexRowJustify, OioDateTimePickerFormatProps } from '@kunlun/vue-ui-common';
import { defineComponent, PropType } from 'vue';
import { BaseGalleryItemProps, DefaultGalleryItem } from '../../../../basic';
import { useDateTimeRangePicker } from '../../../detail/date/range/use-date-time-range-picker';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  name: 'ReadonlyDateTimeRangePicker',
  components: {
    GalleryCommonField,
    DefaultGalleryItem
  },
  props: {
    ...OioDateTimePickerFormatProps,
    ...BaseGalleryItemProps,
    value: {
      type: Object as PropType<[Date | string | undefined, Date | string | undefined]>
    },
    justifyContent: {
      type: String as PropType<FlexRowJustify>
    },
    separator: {
      type: String,
      default: '~'
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    return {
      ...useDateTimeRangePicker(props)
    };
  }
});
</script>
