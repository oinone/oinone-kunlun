import { PropType } from 'vue';
import { FormLayout } from '@oinone/kunlun-vue-ui-common';

export const BaseGalleryItemProps = {
  label: {
    type: [String, Boolean],
    default: undefined
  },
  labelInvisible: {
    type: Boolean,
    default: undefined
  },
  invisible: {
    type: Boolean,
    default: false
  },
  layout: {
    type: [String, Object] as PropType<FormLayout>
  }
};
