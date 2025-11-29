<script lang="ts">
import { SelectSearchArea, translateValueByKey } from '@oinone/kunlun-engine';
import {
  OioEmptyData,
  OioIcon,
  OioInput,
  OioInputGroup,
  OioSpin,
  PropRecordHelper,
  SelectMode,
  StringHelper,
  useMaxTagPlaceholder
} from '@oinone/kunlun-vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import { debounce, delay } from 'lodash-es';
import { createVNode, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, VNode } from 'vue';
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
    notFoundContent: {
      type: [Object, Function]
    },
    isEnterSubmit: {
      type: Boolean,
      default: undefined
    }
  },
  setup(props) {
    const origin = ref();
    const dropdownInputRef = ref();
    const formContext = useInjectOioDefaultFormContext();

    const { readonly, disabled, placeholder } = useMetadataProps(props, true);
    const dropdownVisible = ref(false);
    const showLoadCompleted = ref(false);

    let focusSearchInput = false;

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
    };

    const onSearch = debounce(async (keyword: string) => {
      await props.search?.(keyword);
    }, 300);

    /**
     * 在单选状态，下拉框聚焦时，点击回车会出现调用两次 onDropdownVisibleChange 方法的现象
     * 该计时器用于判定此时是否正处于回车事件，且需要进行数据提交的情况
     * 如果在计时器创建后立即关闭，则认为此时正处于回车事件，需要进行数据提交
     */
    let t;

    const onDropdownVisibleChange = (val: boolean) => {
      if (props.allowSearch && props.searchArea === SelectSearchArea.dropdown) {
        if (focusSearchInput) {
          return;
        }
        if (!focusSearchInput && !val && props.mode !== SelectMode.multiple && dropdownVisible.value) {
          // 按下 Enter 时，下拉单选框无法正常展开，此时进行数据提交
          dropdownVisible.value = false;
          origin.value.focus();
          return;
        }
        if (val) {
          t = setTimeout(() => {
            dropdownVisible.value = true;
            props.initLoad?.();
            focusSearchInput = true;
            delay(() => {
              dropdownInputRef.value?.focus();
            }, 200);
            clearTimeout(t);
            t = null;
          });
        } else if (t != null) {
          clearTimeout(t);
          t = null;
        } else {
          dropdownVisible.value = false;
          if (props.mode !== SelectMode.multiple) {
            origin.value.focus();
          }
        }
      } else if (val) {
        t = setTimeout(() => {
          dropdownVisible.value = true;
          props.initLoad?.();
          clearTimeout(t);
          t = null;
        });
      } else if (t != null) {
        clearTimeout(t);
        t = null;
      } else {
        nextTick(() => {
          dropdownVisible.value = false;
        });
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

    const onKeydown = (e: KeyboardEvent) => {
      // 当键盘数据提交快捷键与下拉框内置选中快捷键冲突时，保证行内编辑态不丢失
      if (e.key === 'Enter' && props.isEnterSubmit && dropdownVisible.value) {
        if (props.mode !== SelectMode.multiple) {
          focusSearchInput = false;
          dropdownVisible.value = false;
          origin.value.focus();
        }
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onFocus = (e) => {
      props.focus?.(e);
    };

    const onBlur = (e) => {
      if (focusSearchInput) {
        return;
      }
      props.blur?.(e);
    };

    const onSearchInputFocus = (e) => {
      focusSearchInput = true;
    };

    const onSearchInputBlur = (e) => {
      if (focusSearchInput) {
        focusSearchInput = false;
        if (props.mode !== SelectMode.multiple) {
          onDropdownVisibleChange(false);
        }
      }
    };

    const onSearchInputKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') {
        e.stopPropagation();
      }
    };

    const onGlobalMouseDown = (e: MouseEvent) => {
      focusSearchInput = e.target === dropdownInputRef.value?.originInput?.input;
    };

    onMounted(() => {
      window.addEventListener('mousedown', onGlobalMouseDown, true);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('mousedown', onGlobalMouseDown);
    });

    return {
      ...useMaxTagPlaceholder(),
      origin,
      dropdownInputRef,
      readonly,
      disabled,
      placeholder,
      dropdownVisible,
      showLoadCompleted,
      getTriggerContainer: props.getTriggerContainer || formContext.getTriggerContainer,
      onChange,
      onSearch,
      onDropdownVisibleChange,
      onPopupScroll,
      onKeydown,
      onFocus,
      onBlur,
      onSearchInputFocus,
      onSearchInputBlur,
      onSearchInputKeydown
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
      dropdownVisible,
      loadMoreLoading,
      showLoadCompleted,
      getTriggerContainer,
      onChange,
      onFocus,
      onBlur,
      defaultMaxTagPlaceholder,
      allowArrow,
      allowClear,
      allowSearch,
      searchArea,
      onSearch,
      notFoundContent,
      onDropdownVisibleChange,
      onPopupScroll,
      onKeydown,
      onSearchInputFocus,
      onSearchInputBlur,
      onSearchInputKeydown
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
      maxTagPlaceholder: defaultMaxTagPlaceholder,

      mode,
      options,
      placeholder,
      allowClear,
      disabled,
      open: dropdownVisible,
      showArrow: allowArrow,
      getPopupContainer: getTriggerContainer,
      onChange,
      onFocus,
      onBlur,

      onDropdownVisibleChange,
      onPopupScroll,
      onKeydown
    };
    if (mode === SelectMode.multiple) {
      if (value == null) {
        props.value = undefined;
      } else if (Array.isArray(value)) {
        if (value.length) {
          props.value = value;
        } else {
          props.value = undefined;
        }
      } else {
        props.value = [value];
      }
    } else if (value == null) {
      props.value = undefined;
    } else {
      props.value = value;
    }
    const slotNames = [
      {
        origin: 'dropdownRender',
        default: ({ menuNode: menu }) => {
          const vNodes: VNode[] = [];
          if (allowSearch && searchArea === SelectSearchArea.dropdown) {
            vNodes.push(
              createVNode(
                OioInput,
                {
                  ref: 'dropdownInputRef',
                  placeholder,
                  'onUpdate:value': onSearch,
                  onFocus: onSearchInputFocus,
                  onBlur: onSearchInputBlur,
                  onKeydown: onSearchInputKeydown
                },
                {
                  prefix: () => {
                    return [
                      createVNode(OioIcon, {
                        icon: 'oinone-sousuo2',
                        size: 16
                      })
                    ];
                  }
                }
              )
            );
          }
          vNodes.push(menu);
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
    if (allowSearch && (!searchArea || searchArea === SelectSearchArea.default)) {
      props.showSearch = true;
      props.onSearch = onSearch;
    } else {
      props.showSearch = false;
    }
    if (readonly) {
      props.notFoundContent = null;
    } else if (notFoundContent === null) {
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
