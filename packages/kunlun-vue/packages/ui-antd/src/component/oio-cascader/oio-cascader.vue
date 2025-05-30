<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  CascaderDisplayRenderFunction,
  CascaderItem,
  CascaderProperties,
  defaultCascaderProperties,
  defaultLabelsSeparator,
  fillCascaderItemsProperties,
  OioCascaderProps,
  PropRecordHelper,
  SelectMode
} from '@kunlun/vue-ui-common';
import { Cascader as ACascader, Popover as APopover } from 'ant-design-vue';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { useMaxTagPlaceholder } from '../../vc-component';
import { OioEmptyData } from '../oio-empty';

export default defineComponent({
  name: 'OioCascader',
  components: {
    ACascader,
    APopover
  },
  inheritAttrs: false,
  props: {
    ...OioCascaderProps
  },
  emits: ['update:value', 'change', 'search'],
  setup(props, context) {
    const internalProperties = computed<CascaderProperties>(() => {
      return {
        ...defaultCascaderProperties,
        ...(props.properties || {})
      };
    });

    const internalOptions = computed<CascaderItem[]>(() => {
      const options = props.options || [];
      if (props.mappingOptions) {
        return fillCascaderItemsProperties(options, internalProperties.value, props.customFillProperties) || [];
      }
      return CastHelper.cast(options);
    });

    const multiple = computed(() => {
      return props.mode === SelectMode.multiple;
    });

    const defaultDisplayRender: CascaderDisplayRenderFunction = ({ labels }) => {
      if (multiple.value) {
        return labels[labels.length - 1];
      }
      return labels.join(props.labelsSeparator || defaultLabelsSeparator);
    };

    const onUpdateValue = (values: string[] | string[][]) => {
      context.emit('update:value', values);
    };

    const onChange = (values: string[] | string[][], selectedOptions: CascaderItem[] | CascaderItem[][]) => {
      context.emit('change', values, selectedOptions);
    };

    const onSearch = (val) => {
      context.emit('search', val);
    };

    return {
      internalProperties,
      internalOptions,
      multiple,

      defaultDisplayRender,
      ...useMaxTagPlaceholder(),

      onUpdateValue,
      onChange,
      onSearch
    };
  },
  render() {
    const {
      value,
      options,
      filterOption,
      mappingOptions,
      autofocus,
      placeholder,
      allowClear,
      readonly,
      disabled,
      searchValue,
      enableSearch,
      dropdownClassName,
      getTriggerContainer,
      changeOnSelect,
      multipleCheckedStrategy,

      loading,
      loadData,

      internalOptions,
      multiple,

      displayRender,
      tagRender,
      maxTagCount,
      maxTagPlaceholder,
      defaultDisplayRender,
      defaultMaxTagPlaceholder,

      onUpdateValue,
      onChange,
      onSearch
    } = this;

    const classNames = [`${DEFAULT_PREFIX}-select`, `${DEFAULT_PREFIX}-cascader`];
    const dropdownClassNames = [`${DEFAULT_PREFIX}-select-dropdown`, `${DEFAULT_PREFIX}-cascader-dropdown`];
    if (readonly) {
      classNames.push(`${DEFAULT_PREFIX}-select-readonly`);
    }
    if (disabled) {
      classNames.push(`${DEFAULT_PREFIX}-select-disabled`);
    }
    if (multiple) {
      classNames.push(`${DEFAULT_PREFIX}-select-multiple`);
      dropdownClassNames.push(`${DEFAULT_PREFIX}-select-dropdown-multiple`);
    }

    const children = {};

    let showSearch: boolean | { filter: Function } | undefined = enableSearch;
    if (showSearch && filterOption) {
      showSearch = { filter: filterOption };
    }

    return createVNode(
      ACascader,
      {
        autofocus,
        placeholder,
        allowClear,
        disabled: readonly || disabled,
        dropdownClassName: StringHelper.append(dropdownClassNames, dropdownClassName).join(' '),
        getPopupContainer: getTriggerContainer,
        changeOnSelect,
        value,
        searchValue,
        showSearch,
        options: mappingOptions ? internalOptions : options,
        multiple,
        showCheckedStrategy: multipleCheckedStrategy,
        loading,
        loadData,
        displayRender: displayRender || defaultDisplayRender,
        tagRender,
        maxTagCount,
        maxTagPlaceholder: maxTagPlaceholder || defaultMaxTagPlaceholder,
        notFoundContent: createVNode(OioEmptyData, { loading }),
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames),
        'onUpdate:value': onUpdateValue,
        onChange,
        onSearch
      },
      children
    );
  }
});
</script>
