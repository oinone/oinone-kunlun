<script lang="ts">
import { translateValueByKey } from '@kunlun/engine';
import { BooleanHelper, ButtonType, OioButton, OioInput, OioTextarea } from '@kunlun/vue-ui-antd';
import { debounce, isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType, VNode } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { MapItem } from './typing';

export default defineComponent({
  name: 'DefaultMap',
  components: {
    OioButton,
    OioInput,
    OioTextarea
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    items: {
      type: Array as PropType<MapItem[]>,
      default: () => []
    },
    addRecord: {
      type: Function
    },
    removeRecord: {
      type: Function as PropType<(index: number) => void>
    },
    onHandleChange: {
      type: Function
    },
    limit: {
      type: Number
    }
  },
  setup(props) {
    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

    const disabledAdd = computed(() => {
      const value = disabled.value;
      if (!value) {
        if (isNil(props.limit)) {
          return false;
        }
        return (props.items?.length || 0) >= props.limit;
      }
      return value;
    });

    const onAddClick = () => {
      props.addRecord?.();
    };

    const onRemoveClick = (index: number) => {
      props.removeRecord?.(index);
    };

    const onUpdateItemName = (item: MapItem, val: string) => {
      item.name = val;
    };

    const onUpdateItemValue = (item: MapItem, val: string) => {
      item.value = val;
    };

    const onInputChange = () => {
      debounce(() => {
        props.onHandleChange?.();
      }, 100)();
    };

    const onInputBlur = () => {
      props.onHandleChange?.();
      props.blur?.();
    };

    return {
      readonly,
      disabled,
      disabledAdd,

      onAddClick,
      onRemoveClick,
      onUpdateItemName,
      onUpdateItemValue,
      onInputChange,
      onInputBlur
    };
  },
  render() {
    const {
      readonly,
      disabled,
      disabledAdd,
      focus,
      items,
      onAddClick,
      onRemoveClick,
      onUpdateItemName,
      onUpdateItemValue,
      onInputChange,
      onInputBlur
    } = this;

    const children: VNode[] = [];
    if (readonly) {
      items.forEach((item) => {
        const { name, value } = item;
        children.push(
          createVNode('div', { class: 'default-map-item default-map-item-readonly' }, [
            createVNode('span', { class: 'default-map-item-name-readonly' }, name || ''),
            createVNode('span', { class: 'default-map-item-separator' }, ': '),
            createVNode('span', { class: 'default-map-item-value-readonly' }, value || '')
          ])
        );
      });
    } else {
      children.push(
        createVNode(
          OioButton,
          {
            class: 'default-map-add-button',
            disabled: disabledAdd,
            type: ButtonType.primary,
            onClick: onAddClick
          },
          { default: () => translateValueByKey('添加') }
        )
      );
      items.forEach((item, index) => {
        const { name, value } = item;
        children.push(
          createVNode('div', { class: 'default-map-item' }, [
            createVNode(OioInput, {
              class: 'default-map-item-name',
              disabled,
              value: name,
              'onUpdate:value': (val) => {
                onUpdateItemName(item, val);
                onInputChange();
              },
              onFocus: focus,
              onBlur: onInputBlur
            }),
            createVNode(OioTextarea, {
              class: 'default-map-item-value',
              value,
              disabled,
              'onUpdate:value': (val) => {
                onUpdateItemValue(item, val);
                onInputChange();
              },
              onFocus: focus,
              onBlur: onInputBlur
            }),
            createVNode(
              OioButton,
              {
                class: 'default-map-item-delete-button',
                disabled,
                onClick: () => {
                  onRemoveClick(index);
                }
              },
              {
                default: () => translateValueByKey('删除')
              }
            )
          ])
        );
      });
    }
    return createVNode('div', { class: 'default-map' }, children);
  }
});
</script>
