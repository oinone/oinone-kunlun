<script lang="ts">
import { StringHelper } from '@oinone/kunlun-shared';
import { PropRecordHelper, SelectItem } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import { BaseSelect } from './index';
import { DefaultSelectProps } from './props';

export default defineComponent({
  name: 'DefaultSelect',
  components: {},
  inheritAttrs: false,
  props: {
    ...DefaultSelectProps
  },
  setup(props) {
    const onChange = (val: SelectItem | SelectItem[] | null | undefined) => {
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
        props.change?.(finalOptions);
        return;
      }
      props.change?.(val.data);
    };

    return {
      onChange
    };
  },
  render() {
    const {
      $attrs,
      $slots,

      mode,
      selected,
      options,
      dropdownClassName,
      placeholder,
      loadMoreLoading,
      loadCompleted,
      allowSearch,
      allowClear,
      onChange,
      focus,
      blur,
      search,
      initLoad,
      loadMore
    } = this;
    return createVNode(
      BaseSelect,
      {
        ...PropRecordHelper.collectionBasicProps($attrs, ['default-select']),
        dropdownClassName: StringHelper.append(['default-select-dropdown'], dropdownClassName),
        mode,
        value: selected == null ? undefined : selected,
        options,
        placeholder,
        loadMoreLoading,
        loadCompleted,
        allowSearch,
        allowClear,
        change: onChange,
        focus,
        blur,
        search,
        initLoad,
        loadMore
      },
      $slots
    );
  }
});
</script>
<style lang="scss"></style>
