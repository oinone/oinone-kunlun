<script lang="ts">
import { OioListItem, StringHelper } from '@oinone/kunlun-shared';
import { OioIcon, PropRecordHelper, SelectMode } from '@oinone/kunlun-vue-ui-common';
import { Radio as ARadio } from 'ant-design-vue';
import { createVNode, defineComponent, PropType, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioCheckbox } from '../oio-checkbox';
import { OioEmptyData } from '../oio-empty';

export default defineComponent({
  name: 'OioList',
  components: {
    OioEmptyData,
    OioIcon,
    OioCheckbox,
    ARadio
  },
  inheritAttrs: false,
  props: {
    list: {
      type: Array as PropType<OioListItem[]>,
      required: true
    },
    showIcon: {
      type: Boolean
    },
    mode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>,
      default: SelectMode.single
    },
    showCheckedAll: {
      type: Boolean
    },
    checkedAll: {
      type: Boolean
    },
    halfCheckedAll: {
      type: Boolean
    },
    checkedKeys: {
      type: Array as PropType<string[]>
    }
  },
  emits: ['checked', 'update:checkedAll'],
  setup(props, { emit }) {
    const onChecked = (item: OioListItem, checked: boolean) => {
      emit('checked', item, checked);
    };

    const onCheckedAll = (checked: boolean) => {
      emit('update:checkedAll', checked);
    };

    return {
      onChecked,
      onCheckedAll
    };
  },
  render() {
    const {
      $attrs,
      $slots,
      $translate,

      mode,
      list,
      checkedKeys,
      showIcon,
      showCheckedAll,
      checkedAll,
      halfCheckedAll,
      onChecked,
      onCheckedAll
    } = this;
    const { default: defaultSlot, icon: iconSlot } = PropRecordHelper.collectionSlots($slots, [
      {
        origin: 'default',
        default: ({ item }) => {
          return [createVNode('span', {}, item.label)];
        }
      },
      {
        origin: 'icon',
        default: ({ item }) => {
          if (item.icon) {
            return [
              createVNode(OioIcon, {
                icon: item.icon,
                color: '#ffffff'
              })
            ];
          }
          let first = item.label.trim().charAt(0);
          if (StringHelper.isLetter(first.charCodeAt(0))) {
            first = first.toUpperCase();
          }
          return [createVNode('span', {}, first)];
        }
      }
    ]);
    const children: VNode[] = [];
    const renderList = list || [];
    if (renderList.length) {
      if (mode === SelectMode.multiple && showCheckedAll) {
        children.push(
          createVNode(
            'div',
            {
              key: '__checked_all__',
              class: `${DEFAULT_PREFIX}-list-item`
            },
            [
              createVNode('div', { class: `${DEFAULT_PREFIX}-list-item-label` }, $translate('全选')),
              createVNode(OioCheckbox, {
                checked: checkedAll,
                indeterminate: halfCheckedAll,
                'onUpdate:checked': onCheckedAll
              })
            ]
          )
        );
      }
      for (const item of renderList) {
        const itemNodes: VNode[] = [];
        const contentNodes: VNode[] = [];
        if (showIcon) {
          contentNodes.push(createVNode('div', { class: `${DEFAULT_PREFIX}-list-item-icon` }, iconSlot({ item })));
        }
        contentNodes.push(createVNode('div', { class: `${DEFAULT_PREFIX}-list-item-label` }, defaultSlot({ item })));
        itemNodes.push(createVNode('div', { class: `${DEFAULT_PREFIX}-list-item-content` }, contentNodes));
        if (mode === SelectMode.multiple) {
          itemNodes.push(
            createVNode(OioCheckbox, {
              checked: item.checked,
              'onUpdate:checked': (val: boolean) => onChecked(item, val)
            })
          );
        } else if (mode === SelectMode.single) {
          itemNodes.push(
            createVNode(ARadio, {
              class: 'oio-radio',
              checked: item.key === checkedKeys?.[0],
              'onUpdate:checked': (val: boolean) => onChecked(item, item.key !== checkedKeys?.[0])
            })
          );
        }
        children.push(
          createVNode(
            'div',
            {
              key: item.key,
              class: `${DEFAULT_PREFIX}-list-item`
            },
            itemNodes
          )
        );
      }
    } else {
      children.push(createVNode(OioEmptyData));
    }
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps($attrs, [`${DEFAULT_PREFIX}-list`])
      },
      children
    );
  }
});
</script>
