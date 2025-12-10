<script lang="ts">
import { TableKeyboardConfig } from '@oinone/kunlun-engine';
import { OioSelectItem, StringHelper } from '@oinone/kunlun-shared';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, PropType } from 'vue';
import BaseSelect from './BaseSelect.vue';
import { DefaultSelectProps } from './props';

export default defineComponent({
  name: 'DefaultSelect',
  components: {},
  inheritAttrs: false,
  props: {
    ...DefaultSelectProps,
    notFoundContent: {
      type: [Object, Function]
    },
    tableKeyboardConfig: {
      type: Object as PropType<TableKeyboardConfig>
    }
  },
  setup(props) {
    const isEnterSubmit = computed(() => props.tableKeyboardConfig?.enter?.key === 'Enter');

    const onChange = (val: OioSelectItem | OioSelectItem[] | null | undefined) => {
      if (!val) {
        props.change?.(null);
        return;
      }
      if (Array.isArray(val)) {
        const finalOptions: unknown[] = [];
        for (const item of val) {
          let { data } = item;
          if (data) {
            finalOptions.push(data);
          } else {
            const { key } = item;
            data = props.initSelectedOptions?.find((vv) => vv.key === key)?.data;
            if (data) {
              finalOptions.push(data);
            }
          }
        }
        if (finalOptions.length) {
          props.change?.(finalOptions);
        } else {
          props.change?.(null);
        }
        return;
      }
      props.change?.(val.data);
    };

    return {
      isEnterSubmit,
      onChange
    };
  },
  render() {
    const {
      $attrs,
      $slots,

      mode,
      selected,
      searchValue,
      options,
      dropdownClassName,
      placeholder,
      loadMoreLoading,
      loadCompleted,
      allowArrow,
      allowSearch,
      searchArea,
      allowClear,
      onChange,
      focus,
      blur,
      search,
      initLoad,
      loadMore,
      notFoundContent,
      isEnterSubmit
    } = this;
    const classNames = ['oio-default-select'];
    if (options == null) {
      classNames.push('oio-default-select-none-options');
    }
    return createVNode(
      BaseSelect,
      {
        ...PropRecordHelper.collectionBasicProps($attrs, classNames),
        dropdownClassName: StringHelper.append(['oio-default-select-dropdown'], dropdownClassName),
        mode,
        value: selected,
        searchValue,
        options,
        placeholder,
        loadMoreLoading,
        loadCompleted,
        allowArrow,
        allowSearch,
        searchArea,
        allowClear,
        change: onChange,
        focus,
        blur,
        search,
        initLoad,
        loadMore,
        notFoundContent,
        isEnterSubmit
      },
      $slots
    );
  }
});
</script>
<style lang="scss">
.oio-default-select {
  &.oio-default-select-none-options {
    .ant-select-single.ant-select-open .ant-select-selection-item {
      color: var(--oio-select-text-color);
    }
  }
}
</style>
