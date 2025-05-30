<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  defaultTreeSelectProperties,
  fillTreeSelectNodesProperties,
  OioTreeSelectProps,
  PropRecordHelper,
  SelectMode,
  SimpleTreeSelected,
  TreeSelectNode,
  TreeSelectNodeChangeEvent,
  TreeSelectProperties
} from '@kunlun/vue-ui-common';
import { Popover as APopover, TreeSelect as ATreeSelect } from 'ant-design-vue';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { useMaxTagPlaceholder } from '../../vc-component';
import { OioEmptyData } from '../oio-empty';

export default defineComponent({
  name: 'OioTreeSelect',
  components: {
    ATreeSelect,
    APopover
  },
  inheritAttrs: false,
  props: {
    ...OioTreeSelectProps
  },
  slots: ['title'],
  emits: ['update:value', 'update:expanded-keys', 'update:search-value', 'change', 'search'],
  setup(props, context) {
    const internalProperties = computed<TreeSelectProperties>(() => {
      return {
        ...defaultTreeSelectProperties,
        ...(props.properties || {})
      };
    });

    const internalOptions = computed<TreeSelectNode[]>(() => {
      const options = props.options || [];
      if (props.mappingOptions) {
        return fillTreeSelectNodesProperties(options, internalProperties.value, props.customFillProperties) || [];
      }
      return CastHelper.cast(options);
    });

    const multiple = computed(() => {
      return props.mode === SelectMode.multiple;
    });

    const onChange = (
      selectedValues: SimpleTreeSelected | SimpleTreeSelected[],
      matchKeys: null,
      selectedEvent: { triggerValue: string; checked: boolean }
    ) => {
      const event: TreeSelectNodeChangeEvent = {
        targetValue: selectedEvent.triggerValue,
        checked: selectedEvent.checked,
        origin: selectedEvent
      };
      context.emit('update:value', selectedValues);
      context.emit('change', selectedValues, event);
    };

    const onUpdateExpandedKeys = (val) => {
      context.emit('update:expanded-keys', val);
    };

    const onUpdateSearchValue = (val) => {
      context.emit('update:search-value', val);
    };

    const onSearch = (val) => {
      context.emit('search', val);
    };

    return {
      internalProperties,
      internalOptions,
      multiple,

      ...useMaxTagPlaceholder(),

      onChange,
      onUpdateExpandedKeys,
      onUpdateSearchValue,
      onSearch
    };
  },
  render() {
    const {
      value,
      options,
      filterOption,
      mappingOptions,
      placeholder,
      allowClear,
      readonly,
      disabled,
      searchValue,
      enableSearch,
      dropdownClassName,
      getTriggerContainer,
      multipleCheckedStrategy,
      treeCheckStrictly,
      expandedKeys,

      loading,
      loadData,

      internalProperties,
      internalOptions,
      multiple,

      tagRender,
      maxTagCount,
      maxTagPlaceholder,
      defaultMaxTagPlaceholder,

      onChange,
      onUpdateExpandedKeys,
      onUpdateSearchValue,
      onSearch
    } = this;

    const classNames = [`${DEFAULT_PREFIX}-select`, `${DEFAULT_PREFIX}-tree-select`];
    if (readonly) {
      classNames.push(`${DEFAULT_PREFIX}-select-readonly`);
    }
    if (disabled) {
      classNames.push(`${DEFAULT_PREFIX}-select-disabled`);
    }
    if (multiple) {
      classNames.push(`${DEFAULT_PREFIX}-select-multiple`);
    }

    const children = PropRecordHelper.collectionSlots(this.$slots, ['title']);

    return createVNode(
      ATreeSelect,
      {
        placeholder,
        allowClear,
        disabled: readonly || disabled,
        dropdownClassName: StringHelper.append(
          [`${DEFAULT_PREFIX}-select-dropdown`, `${DEFAULT_PREFIX}-tree-select-dropdown`],
          dropdownClassName
        ).join(' '),
        getPopupContainer: getTriggerContainer,
        labelInValue: true,
        value,
        searchValue,
        showSearch: enableSearch,
        treeData: mappingOptions ? internalOptions : options,
        filterTreeNode: filterOption,
        treeNodeFilterProp: internalProperties.filterProp,
        multiple,
        treeCheckable: multiple,
        showCheckedStrategy: multipleCheckedStrategy,
        treeCheckStrictly,
        treeExpandedKeys: expandedKeys,
        loading,
        loadData,
        tagRender,
        maxTagCount,
        maxTagPlaceholder: maxTagPlaceholder || defaultMaxTagPlaceholder,
        notFoundContent: createVNode(OioEmptyData, { loading }),
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames),
        'onUpdate:value': undefined,
        'onUpdate:tree-expanded-keys': onUpdateExpandedKeys,
        'onUpdate:search-value': onUpdateSearchValue,
        onChange,
        onSearch
      },
      children
    );
  }
});
</script>
