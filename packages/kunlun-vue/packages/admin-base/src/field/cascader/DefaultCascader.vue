<script lang="ts">
import { CloseOutlined } from '@ant-design/icons-vue';
import { BooleanHelper } from '@oinone/kunlun-shared';
import {
  CascaderCheckedStrategy,
  CascaderDisplayRenderFunction,
  CascaderItem,
  CascaderProperties,
  defaultCascaderProperties,
  defaultLabelsSeparator,
  OioCascader,
  OioTreeNode,
  SelectMode
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, VNode, vShow, withDirectives, withModifiers } from 'vue';
import { OioCommonProps, OioMetadataProps, useInjectOioDefaultFormContext } from '../../basic';
import { TreeData } from '../../typing';

/**
 * copyright ant-design-vue
 * vc-cascader/utils/commonUtils.ts#VALUE_SPLIT
 */
const VALUE_SPLIT = '__RC_CASCADER_SPLIT__';

/**
 * copyright ant-design-vue
 */
const ANT_SELECT_SELECTION_CLASS_PREFIX = 'ant-select-selection';

const mappingProperties: CascaderProperties = {
  ...defaultCascaderProperties,
  labelProp: 'title',
  valueProp: 'key'
};

export default defineComponent({
  name: 'DefaultCascader',
  components: {
    OioCascader,
    CloseOutlined
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    selectedValue: {
      type: Array as PropType<string[] | string[][]>
    },
    selectedLabels: {
      type: Array as PropType<string[] | string[][]>
    },
    placeholder: {
      type: String
    },
    allowClear: {
      type: Boolean,
      default: undefined
    },
    rootNode: {
      type: Object as PropType<OioTreeNode<TreeData>>
    },
    searchRootNode: {
      type: Object as PropType<OioTreeNode<TreeData>>
    },
    selectMode: {
      type: String
    },
    multipleCheckedStrategy: {
      type: String
    },
    changeOnSelect: {
      type: Boolean,
      default: undefined
    },
    labelsSeparator: {
      type: String
    },
    showPath: {
      type: Boolean,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: undefined
    },
    enableSearch: {
      type: Boolean,
      default: undefined
    },
    enableLoadData: {
      type: Boolean,
      default: undefined
    },
    loadData: {
      type: Function as PropType<(node: OioTreeNode<TreeData>) => Promise<void>>
    },
    loadMoreData: {
      type: Function as PropType<(node: OioTreeNode<TreeData>) => Promise<void>>
    },
    onSelectedChange: {
      type: Function as PropType<
        (selectedValue: string[] | string[][], selectedOptions: CascaderItem[] | CascaderItem[][]) => void
      >
    },
    onSearch: {
      type: Function as PropType<(keyword: string) => void>
    }
  },
  setup(props) {
    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

    const loadData = (selectedOptions: { loading: boolean; data: OioTreeNode<TreeData> }[]) => {
      const targetOption = selectedOptions[selectedOptions.length - 1]?.data;
      if (!targetOption?.loaded) {
        props.loadData?.(targetOption);
      }
    };

    const multiple = computed(() => {
      return props.selectMode === SelectMode.multiple;
    });

    const multipleCheckedStrategy = computed(() => {
      if (props.multipleCheckedStrategy === CascaderCheckedStrategy.SHOW_ALL) {
        return CascaderCheckedStrategy.SHOW_PARENT;
      }
      return props.multipleCheckedStrategy;
    });

    const displayRender: CascaderDisplayRenderFunction = (values) => {
      const labels = values.labels;
      if (multiple.value) {
        let label: string;
        if (props.showPath) {
          const separator = props.labelsSeparator || defaultLabelsSeparator;
          label = labels.filter((v) => !!v).join(separator);
        } else {
          label = labels[labels.length - 1];
        }
        return label;
      }
      const separator = props.labelsSeparator || defaultLabelsSeparator;
      if (props.selectedLabels) {
        return (props.selectedLabels as string[]).join(separator);
      }
      return labels.join(separator);
    };

    const tagRender = ({
      value: itemValue,
      closable: itemClosable,
      disabled: itemDisabled,
      onClose: itemOnClose
    }): VNode[] => {
      const currentSelectedValues = props.selectedValue as string[][];
      if (!currentSelectedValues) {
        return [];
      }
      const selectedValues = itemValue.split(VALUE_SPLIT);
      const labelIndex = findSelectedLabelIndex(currentSelectedValues, selectedValues);
      if (labelIndex === -1) {
        return [];
      }
      const labels = props.selectedLabels?.[labelIndex] as string[];
      if (!labels) {
        return [];
      }
      let label: string;
      if (props.showPath) {
        const separator = props.labelsSeparator || defaultLabelsSeparator;
        label = labels.filter((v) => !!v).join(separator);
      } else {
        label = labels[labels.length - 1];
      }
      if (!label) {
        return [];
      }
      return [
        createVNode(
          'span',
          {
            class: [
              `${ANT_SELECT_SELECTION_CLASS_PREFIX}-item`,
              itemDisabled && `${ANT_SELECT_SELECTION_CLASS_PREFIX}-item-disabled`
            ],
            title: label
          },
          [
            createVNode('span', { class: `${ANT_SELECT_SELECTION_CLASS_PREFIX}-item-content` }, label),
            withDirectives(
              createVNode(
                'span',
                {
                  class: `${ANT_SELECT_SELECTION_CLASS_PREFIX}-item-remove`,
                  unselectable: 'on',
                  'aria-hidden': true,
                  onMousedown: withModifiers(() => {}, ['stop', 'prevent']),
                  onClick: itemOnClose
                },
                [createVNode(CloseOutlined)]
              ),
              [[vShow, itemClosable]]
            )
          ]
        )
      ];
    };

    const findSelectedLabelIndex = (currentSelectedValues: string[][], selectedValues: string[]): number => {
      for (let i = 0; i < currentSelectedValues.length; i++) {
        const currentSelectedValue = currentSelectedValues[i];
        if (currentSelectedValue.length !== selectedValues.length) {
          continue;
        }
        let isEqual = true;
        for (let k = 0; k < currentSelectedValue.length; k++) {
          const item = currentSelectedValue[k];
          const target = selectedValues[k];
          if (!item || !target || item !== target) {
            isEqual = false;
            break;
          }
        }
        if (isEqual) {
          return i;
        }
      }
      return -1;
    };

    const onDropdownVisibleChange = (visible: boolean) => {
      if (visible) {
        if (props.rootNode && !props.rootNode.loaded) {
          props.loadData?.(props.rootNode);
        }
      }
    };

    const onChange = (val: string[] | string[][], selectedOptions: CascaderItem[] | CascaderItem[][]) => {
      props.onSelectedChange?.(val, selectedOptions);
    };

    const onSearch = (val) => {
      props.onSearch?.(val);
    };

    const formContext = useInjectOioDefaultFormContext();

    return {
      readonly,
      disabled,
      loadData,
      multipleCheckedStrategy,
      displayRender,
      tagRender,

      onDropdownVisibleChange,
      onChange,
      onSearch,

      getTriggerContainer: formContext.getTriggerContainer
    };
  },
  render() {
    const {
      selectMode,
      changeOnSelect,
      selectedValue,
      readonly,
      disabled,
      placeholder,
      allowClear,
      multipleCheckedStrategy,
      displayRender,
      tagRender,
      loading,
      enableSearch,
      enableLoadData,
      rootNode,
      searchRootNode,
      loadData,

      onDropdownVisibleChange,
      onChange,
      onSearch,
      focus,
      blur,
      getTriggerContainer
    } = this;
    return createVNode(OioCascader, {
      mode: selectMode,
      changeOnSelect,
      value: selectedValue,
      options: searchRootNode?.children || rootNode?.children || [],
      properties: mappingProperties,
      loading,
      loadData: enableLoadData ? loadData : undefined,
      getTriggerContainer,
      readonly,
      disabled,
      placeholder,
      allowClear,
      multipleCheckedStrategy,
      enableSearch,
      displayRender,
      tagRender,
      onChange,
      onSearch: enableLoadData ? onSearch : undefined,
      onFocus: focus,
      onBlur: blur,
      onDropdownVisibleChange
    });
  }
});
</script>
