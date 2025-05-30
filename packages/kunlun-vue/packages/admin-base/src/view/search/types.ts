import { IModelFieldOption } from '@kunlun/meta';
import { DslDefinition } from '@kunlun/dsl';
import { ActiveRecord, RuntimeModelField } from '@kunlun/engine';
import { OioFormProps } from '@kunlun/vue-ui-antd';
import { PropType } from 'vue';
import { UserSearchPrefer } from '../../typing';

export const CATE_ALL_NAME = '$ALL';
export const CATE_ALL_OPTION = { value: CATE_ALL_NAME, name: CATE_ALL_NAME, displayName: '全部' } as IModelFieldOption;

export const DefaultSearchProps = {
  ...OioFormProps,
  template: {
    type: Object as PropType<DslDefinition>
  },
  invisible: {
    type: Boolean
  },
  invisibleSearch: {
    type: Boolean,
    default: true
  },
  disabledExpand: {
    type: Boolean
  },
  foldSize: {
    type: Number,
    default: 3
  },
  formData: {
    type: Object,
    default: () => {}
  },
  isExpand: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  },
  onExpand: {
    type: Function as PropType<(expand: boolean) => void>
  },
  onSearch: {
    type: Function as PropType<() => void>
  },
  onReset: {
    type: Function as PropType<() => void>
  },
  translate: {
    type: Function as PropType<(key: string) => string>
  },
  showSearchPrefer: {
    type: Boolean,
    default: false
  },
  searchPreferOptions: {
    type: Array as PropType<UserSearchPrefer[]>
  },
  selectedPrefer: {
    type: Object as PropType<UserSearchPrefer>
  },
  onLoadSearchPreferOptions: {
    type: Function
  },
  onCreateSearchPrefer: {
    type: Function
  },
  onUpdateSearchPrefer: {
    type: Function
  },
  onRemoveSearchPrefer: {
    type: Function
  },
  onSelectSearchPrefer: {
    type: Function
  },
  onUnselectSearchPrefer: {
    type: Function
  },
  topCateModelField: {
    type: Object as PropType<RuntimeModelField>
  },
  secondCateModelField: {
    type: Object as PropType<RuntimeModelField>
  },
  topCateFieldOptions: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  secondCateFieldOptions: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  cateFields: {
    type: Array as PropType<string[]>
  },
  onCateSearch: {
    type: Function
  }
};
