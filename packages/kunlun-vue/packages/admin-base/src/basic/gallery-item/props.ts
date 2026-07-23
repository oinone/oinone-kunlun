import { FormLayout } from '@oinone/kunlun-vue-ui-common';
import type { PropType } from 'vue';

export const BaseGalleryItemProps = {
  label: {
    type: [String, Boolean],
    default: undefined
  },
  labelInvisible: {
    type: Boolean,
    default: undefined
  },
  help: {
    type: [String, Object]
  },
  invisible: {
    type: Boolean,
    default: false
  },
  layout: {
    type: [String, Object] as PropType<FormLayout>
  }
};
