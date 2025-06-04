import { DslDefinition } from '@oinone/kunlun-dsl';
import { ViewType } from '@oinone/kunlun-meta';
import { PropType } from 'vue';

export const MetadataViewProps = {
  currentHandle: {
    type: String
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  },
  viewType: {
    type: String as PropType<ViewType>
  },
  modelModel: {
    type: String
  },
  modelName: {
    type: String
  },
  moduleModule: {
    type: String
  },
  moduleName: {
    type: String
  },
  viewTemplate: {
    type: Object as PropType<DslDefinition>
  }
};
