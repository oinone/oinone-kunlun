import { DslDefinition } from '@kunlun/dsl';
import { PropType } from 'vue';

/**
 * 组件标签属性
 */
export const WidgetTagProps = {
  handle: {
    type: String
  },
  dslDefinition: {
    type: Object as PropType<DslDefinition>
  },
  slotName: {
    type: String
  },
  inline: {
    type: Boolean,
    default: undefined
  },
  slotContext: {
    type: Object
  }
};
