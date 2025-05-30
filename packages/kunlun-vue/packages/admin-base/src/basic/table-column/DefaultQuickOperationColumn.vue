<script lang="ts">
import { translateValueByKey } from '@kunlun/engine';
import { TableFixed } from '@kunlun/vue-ui';
import { OioIcon, ReturnPromise, StringHelper } from '@kunlun/vue-ui-antd';
import { PropRecordHelper } from '@kunlun/vue-ui-common';
import { Popover as APopover } from 'ant-design-vue';
import { createVNode, defineComponent, PropType, ref, VNode } from 'vue';
import { VxeTableConstructor, VxeTablePrivateMethods } from 'vxe-table';

type TableOperatorHandlerFn = (table, column) => ReturnPromise<boolean>;

const classNamePrefix = 'default-column-quick-operation';

function createOperationItem(title: string, icon: string, onClick: Function, classNames?: string | string[]) {
  const translateTitle = translateValueByKey(title);
  return createVNode(
    'div',
    { class: StringHelper.append([`${classNamePrefix}-item`], classNames), title: translateTitle, onClick },
    [createVNode(OioIcon, { icon, size: 14 }), createVNode('span', {}, translateTitle)]
  );
}

export default defineComponent({
  name: 'DefaultQuickOperationColumn',
  components: {
    APopover
  },
  props: {
    table: {
      type: Object as PropType<VxeTableConstructor & VxeTablePrivateMethods>,
      required: true
    },
    column: {
      type: Object,
      required: true
    },
    sortable: {
      type: Boolean,
      default: undefined
    },
    handleOrderByASC: {
      type: Function as PropType<TableOperatorHandlerFn>
    },
    handleOrderByDESC: {
      type: Function as PropType<TableOperatorHandlerFn>
    },
    handleClearOrder: {
      type: Function as PropType<TableOperatorHandlerFn>
    },
    handleFreezeLeft: {
      type: Function as PropType<TableOperatorHandlerFn>
    },
    handleFreezeRight: {
      type: Function as PropType<TableOperatorHandlerFn>
    },
    handleClearFreeze: {
      type: Function as PropType<TableOperatorHandlerFn>
    },
    handleClearAllFreeze: {
      type: Function as PropType<(fixed: TableFixed) => ReturnPromise<boolean>>
    },
    handleHide: {
      type: Function as PropType<TableOperatorHandlerFn>
    }
  },
  setup(props) {
    const visible = ref(false);

    const onUpdateVisible = (val: boolean) => {
      visible.value = val;
    };

    const createHandle = <R>(
      fn: (...args: unknown[]) => ReturnPromise<R>
    ): ((...args: unknown[]) => ReturnPromise<R>) => {
      return async (...args: unknown[]) => {
        const res = await fn(...args);
        if (res == null || !!res) {
          visible.value = false;
        }
        return res;
      };
    };

    const handleOrderByASC = createHandle(() => {
      return props.handleOrderByASC?.(props.table, props.column);
    });

    const handleOrderByDESC = createHandle(() => {
      return props.handleOrderByDESC?.(props.table, props.column);
    });

    const handleClearOrder = createHandle(() => {
      return props.handleClearOrder?.(props.table, props.column);
    });

    const handleFreezeLeft = createHandle(() => {
      return props.handleFreezeLeft?.(props.table, props.column);
    });

    const handleFreezeRight = createHandle(() => {
      return props.handleFreezeRight?.(props.table, props.column);
    });

    const handleClearFreeze = createHandle(() => {
      return props.handleClearFreeze?.(props.table, props.column);
    });

    const handleClearAllFreeze = createHandle(() => {
      return props.handleClearAllFreeze?.(TableFixed.all);
    });

    const handleHide = createHandle(() => {
      return props.handleHide?.(props.table, props.column);
    });

    return {
      visible,
      onUpdateVisible,

      handleOrderByASC,
      handleOrderByDESC,
      handleClearOrder,
      handleFreezeLeft,
      handleFreezeRight,
      handleClearFreeze,
      handleClearAllFreeze,
      handleHide
    };
  },
  render() {
    const {
      $slots,

      column,
      sortable,

      visible,
      onUpdateVisible,

      handleOrderByASC,
      handleOrderByDESC,
      handleClearOrder,
      handleFreezeLeft,
      handleFreezeRight,
      handleClearFreeze,
      handleClearAllFreeze,
      handleHide
    } = this;
    const { trigger: triggerSlot } = PropRecordHelper.collectionSlots($slots, ['trigger']);
    let triggerChildren: VNode[];
    if (triggerSlot) {
      triggerChildren = triggerSlot();
    } else {
      triggerChildren = [
        createVNode(OioIcon, {
          icon: 'oinone-gengduo11',
          size: 16
        })
      ];
    }

    const popover = createVNode(
      APopover,
      {
        visible,
        overlayClassName: `${classNamePrefix}-overlay`,
        placement: 'bottomRight',
        'onUpdate:visible': onUpdateVisible
      },
      {
        default: () => triggerChildren,
        content: () => {
          const { fixed, order } = column;
          const options: VNode[] = [];
          if (sortable) {
            if (order === 'asc') {
              options.push(
                createOperationItem('取消排序', 'oinone-quxiaopaixu', handleClearOrder),
                createOperationItem('降序', 'oinone-jiangxu', handleOrderByDESC)
              );
            } else if (order === 'desc') {
              options.push(
                createOperationItem('升序', 'oinone-shengxu', handleOrderByASC),
                createOperationItem('取消排序', 'oinone-quxiaopaixu', handleClearOrder)
              );
            } else {
              options.push(
                createOperationItem('升序', 'oinone-shengxu', handleOrderByASC),
                createOperationItem('降序', 'oinone-jiangxu', handleOrderByDESC)
              );
            }
          }
          if (fixed) {
            options.push(createOperationItem('取消冻结', 'oinone-quxiaodongjie', handleClearFreeze));
            options.push(createOperationItem('取消全部冻结', 'oinone-quxiaodongjie', handleClearAllFreeze));
          } else {
            options.push(
              createOperationItem('冻结左侧至此列', 'oinone-dongjiezuoce', handleFreezeLeft),
              createOperationItem('冻结右侧至此列', 'oinone-dongjieyouce', handleFreezeRight)
            );
          }
          options.push(createOperationItem('隐藏此列', 'oinone-yincangcilie', handleHide));
          return [createVNode('div', { class: `${classNamePrefix}-wrapper` }, options)];
        }
      }
    );
    return createVNode('span', { class: classNamePrefix }, [popover]);
  }
});
</script>
<style lang="scss">
.default-column-quick-operation {
  .oio-icon.oio-icon-oinone-gengduo11 {
    color: var(--oio-table-title-color);
    cursor: pointer;
  }

  &-overlay {
    .ant-popover-inner-content {
      padding: 6px 0;
    }

    .ant-popover-inner,
    .ant-popover-arrow-content {
      background-color: var(--oio-background);
    }

    .ant-popover-inner {
      border-radius: var(--oio-border-radius);
    }

    .ant-popover-arrow {
      display: none;
    }

    .default-column-quick-operation-wrapper {
      display: flex;
      flex-direction: column;

      .default-column-quick-operation-item {
        padding: 6px 12px;
        cursor: pointer;
        display: flex;
        color: var(--oio-text-color-secondary);
        font-size: var(--oio-font-size);

        .oio-icon {
          color: var(--oio-text-color-secondary);
        }

        & > .oio-icon:nth-child(1) {
          margin-right: 8px;
        }

        &:hover {
          background-color: var(--oio-select-dropdown-selected);
        }
      }
    }
  }
}
</style>
