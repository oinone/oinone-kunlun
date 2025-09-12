<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import {
  OioEmptyData,
  OioInputGroup,
  OioSpin,
  PropRecordHelper,
  SelectMode,
  StringHelper
} from '@oinone/kunlun-vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import { debounce } from 'lodash-es';
import { createVNode, defineComponent, nextTick, ref, VNode } from 'vue';
import { useInjectOioDefaultFormContext, useMetadataProps } from '../../../basic';
import { BaseSelectProps } from './props';

interface SelectedOption {
  key: string;
  value: string;
  label: string;
  option?: object;
}

export default defineComponent({
  name: 'BaseSelect',
  components: {
    ASelect
  },
  props: {
    ...BaseSelectProps,
    showArrow: {
      type: Boolean,
      default: true
    },
    notFoundContent: {
      type: [Object, Function]
    }
  },
  setup(props) {
    const origin = ref();
    const formContext = useInjectOioDefaultFormContext();

    const { readonly, disabled, placeholder } = useMetadataProps(props, true);
    const showLoadCompleted = ref(false);

    const onChange = (selected: SelectedOption | SelectedOption[], options: object | object[]) => {
      if (props.mode === SelectMode.multiple) {
        const finalOptions: object[] = [];
        if (Array.isArray(selected)) {
          for (const item of selected) {
            if (item.option) {
              finalOptions.push(item.option);
            } else {
              finalOptions.push({
                key: item.key,
                value: item.value,
                label: item.label
              });
            }
          }
        } else if (selected.option) {
          finalOptions.push(selected.option);
        } else {
          finalOptions.push({
            key: selected.key,
            value: selected.value,
            label: selected.label
          });
        }
        props.change?.(finalOptions);
      } else {
        props.change?.(options);
      }
      origin.value.focus();
    };

    const onSearch = debounce(async (keyword: string) => {
      await props.search?.(keyword);
    }, 300);

    const onDropdownVisibleChange = (val: boolean) => {
      if (val) {
        props.initLoad?.();
      }
    };

    const onPopupScroll = (e) => {
      const { scrollHeight, scrollTop, clientHeight } = e.target;
      if (scrollHeight - scrollTop - 1 <= clientHeight) {
        if (props.loadCompleted) {
          showLoadCompleted.value = true;
          return;
        }
        nextTick(() => props.loadMore?.()).then(() => {
          showLoadCompleted.value = !!props.loadCompleted;
        });
      } else {
        showLoadCompleted.value = false;
      }
    };

    return {
      origin,
      readonly,
      disabled,
      placeholder,
      showLoadCompleted,
      getTriggerContainer: props.getTriggerContainer || formContext.getTriggerContainer,
      onChange,
      onSearch,
      onDropdownVisibleChange,
      onPopupScroll
    };
  },
  render() {
    const {
      $slots,
      $attrs,

      mode,
      value,
      options,
      readonly,
      disabled,
      dropdownClassName,
      placeholder,
      getTriggerContainer,
      loadMoreLoading,
      showLoadCompleted,
      onChange,
      blur,
      focus,
      showArrow,
      allowClear,
      allowSearch,
      onSearch,
      notFoundContent,
      onDropdownVisibleChange,
      onPopupScroll
    } = this;
    const { prefix, suffix } = $slots;
    const props: Record<string, unknown> = {
      ref: 'origin',
      class: 'oio-select oio-basic-select',
      dropdownClassName: StringHelper.append(['oio-select-dropdown oio-basic-select-dropdown'], dropdownClassName).join(
        ' '
      ),
      labelInValue: true,
      filterOption: false,
      defaultActiveFirstOption: false,
      maxTagCount: 'responsive',

      mode,
      value,
      options,
      placeholder,
      allowClear,
      showArrow,
      getPopupContainer: getTriggerContainer,
      onChange,
      onFocus: focus,
      onBlur: blur,

      onDropdownVisibleChange,
      onPopupScroll
    };
    const slotNames = [
      {
        origin: 'dropdownRender',
        default: ({ menuNode: menu }) => {
          const vNodes = [menu];
          if (loadMoreLoading) {
            vNodes.push(
              createVNode('div', { class: 'oio-select-dropdown-spin' }, [
                createVNode(OioSpin, {
                  size: 'small',
                  loading: true
                })
              ])
            );
          } else if (showLoadCompleted) {
            vNodes.push(
              createVNode('div', { class: 'oio-select-dropdown-load-completed' }, [
                createVNode(
                  'span',
                  { class: 'oio-select-dropdown-load-completed-content' },
                  `—— ${translateValueByKey('我是有底线的')} ——`
                )
              ])
            );
          }
          return vNodes;
        }
      },
      'suffixIcon',
      'option'
    ];
    if (allowSearch) {
      props.showSearch = true;
      props.onSearch = onSearch;
    } else {
      props.showSearch = false;
    }
    if (notFoundContent === null) {
      props.notFoundContent = null;
    } else {
      slotNames.push({
        origin: 'notFoundContent',
        default: () => {
          if (notFoundContent) {
            if (typeof notFoundContent === 'function') {
              return notFoundContent();
            }
            return [notFoundContent];
          }
          if (!loadMoreLoading) {
            return [createVNode(OioEmptyData)];
          }
          return [];
        }
      });
    }
    const selectVNode = createVNode(ASelect, props, PropRecordHelper.collectionSlots($slots, slotNames));
    const classNames = ['oio-basic-select-wrapper'];
    if (prefix || suffix) {
      return createVNode(OioInputGroup, PropRecordHelper.collectionBasicProps($attrs, classNames), {
        default: () => {
          const vNodes: VNode[] = [];
          if (prefix) {
            vNodes.push(...prefix());
          }
          vNodes.push(selectVNode);
          if (suffix) {
            vNodes.push(...suffix());
          }
          return vNodes;
        }
      });
    }
    return createVNode('div', PropRecordHelper.collectionBasicProps($attrs, classNames), [selectVNode]);
  }
});
</script>
<style lang="scss">
.oio-basic-select-wrapper {
  &.oio-input-group {
    .oio-basic-select {
      flex: 1;
    }
  }
}

.oio-basic-select-dropdown {
  .oio-select-dropdown-spin {
    height: 28px;
    padding: 5px 12px;
    line-height: 18px;
    text-align: center;
    vertical-align: middle;
  }

  .oio-select-dropdown-load-completed {
    height: 28px;
    padding: 5px 12px;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    vertical-align: middle;

    &-content {
      color: rgba(0, 0, 0, 0.25);
    }
  }
}
</style>
