<script lang="ts">
import { uniqueKeyGenerator } from '@oinone/kunlun-shared';
import {
  ButtonType,
  InputSearchEvent,
  OioButton,
  OioCheckbox,
  OioInputSearch,
  OioModal
} from '@oinone/kunlun-vue-ui-antd';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { Transfer as ATransfer } from 'ant-design-vue';
import AListBody from 'ant-design-vue/es/transfer/ListBody';
import Sortable from 'sortablejs';
import { computed, createVNode, defineComponent, nextTick, onUnmounted, PropType, ref, watch } from 'vue';
import { classNamePrefix, DataOption } from './typing';

enum TransferDirection {
  left = 'left',
  right = 'right'
}

enum CheckedStatus {
  all = 'all',
  part = 'part',
  none = 'none'
}

function getNewSelectedKeys(keys: string[], selectedKeys: string[], unselectedKeys: string[]): string[] {
  return Array.from(new Set([...keys, ...selectedKeys])).filter((key) => unselectedKeys.indexOf(key) === -1);
}

export default defineComponent({
  name: 'StandardUserPreferSetting',
  components: {
    OioButton,
    OioModal,
    OioCheckbox,
    OioIcon,
    ATransfer,
    AListBody
  },
  props: {
    visible: {
      type: Boolean
    },
    fields: {
      type: Array as PropType<DataOption[]>
    },
    invisibleFields: {
      type: Array as PropType<DataOption[]>
    },
    visibleFields: {
      type: Array as PropType<DataOption[]>
    },
    ok: {
      type: Function
    },
    reset: {
      type: Function
    }
  },
  emits: ['update:visible'],
  setup(props, context) {
    const modalId = `${classNamePrefix}-modal-${uniqueKeyGenerator()}`;

    const onUpdateVisible = (val: boolean) => {
      context.emit('update:visible', val);
    };

    const dataSource = ref<DataOption[]>([]);

    const onUpdateDataSource = (val: DataOption[]) => {
      dataSource.value = val;
      onUpdateTargetKeys(targetKeys.value);
    };

    const targetKeys = ref<string[]>([]);

    const onUpdateTargetKeys = (val: string[]) => {
      targetKeys.value = dataSource.value.filter((v) => val.includes(v.key)).map((v) => v.key);
    };

    const selectedKeys = ref<string[]>([]);

    const onUpdateSelectedKeys = (val: string[]) => {
      selectedKeys.value = val;
    };

    const searchValues = ref<[string, string]>(['', '']);

    const onSearch = (direction: TransferDirection, val: string) => {
      switch (direction) {
        case TransferDirection.left:
          searchValues.value[0] = val;
          break;
        case TransferDirection.right:
          searchValues.value[1] = val;
          break;
      }
    };

    const filterOption = (inputValue: string, option: DataOption) => {
      if (!inputValue) {
        return true;
      }
      return option.title.indexOf(inputValue) > -1;
    };

    const leftDataSource = computed(() => dataSource.value.filter((v) => !targetKeys.value.includes(v.key)));

    const rightDataSource = computed(() => dataSource.value.filter((v) => targetKeys.value.includes(v.key)));

    const leftFilteredDataSource = computed(() =>
      leftDataSource.value.filter((v) => filterOption(searchValues.value[0], v))
    );

    const rightFilteredDataSource = computed(() =>
      rightDataSource.value.filter((v) => filterOption(searchValues.value[1], v))
    );

    const leftSelectedKeys = computed(() =>
      leftDataSource.value.filter((v) => selectedKeys.value.includes(v.key)).map((v) => v.key)
    );

    const rightSelectedKeys = computed(() =>
      rightDataSource.value.filter((v) => selectedKeys.value.includes(v.key)).map((v) => v.key)
    );

    const leftFilteredEnabledKeys = computed(() =>
      leftFilteredDataSource.value.filter((v) => !v.disabled).map((v) => v.key)
    );

    const rightFilteredEnabledKeys = computed(() =>
      rightFilteredDataSource.value.filter((v) => !v.disabled).map((v) => v.key)
    );

    const leftSelectedAllStatus = computed<CheckedStatus>(() => {
      if (leftSelectedKeys.value.length === 0) {
        return CheckedStatus.none;
      }
      if (leftFilteredDataSource.value.every((v) => leftSelectedKeys.value.indexOf(v.key) >= 0 || !!v.disabled)) {
        return CheckedStatus.all;
      }
      return CheckedStatus.part;
    });

    const rightSelectedAllStatus = computed<CheckedStatus>(() => {
      if (rightSelectedKeys.value.length === 0) {
        return CheckedStatus.none;
      }
      if (rightFilteredDataSource.value.every((v) => rightSelectedKeys.value.indexOf(v.key) >= 0 || !!v.disabled)) {
        return CheckedStatus.all;
      }
      return CheckedStatus.part;
    });

    const renderItem = (option: DataOption) => {
      return [
        createVNode('div', { class: `${classNamePrefix}-transfer-item` }, [
          createVNode('span', { class: `${classNamePrefix}-transfer-item-title` }, option.title),
          createVNode(OioIcon, { class: `${classNamePrefix}-transfer-item-handle`, icon: 'oinone-yidong', size: 10 })
        ])
      ];
    };

    const onLeftSelectedAll = (val: boolean) => {
      if (val) {
        selectedKeys.value = getNewSelectedKeys(leftFilteredEnabledKeys.value, rightSelectedKeys.value, []);
      } else {
        selectedKeys.value = getNewSelectedKeys([], rightSelectedKeys.value, leftFilteredEnabledKeys.value);
      }
    };

    const onRightSelectedAll = (val: boolean) => {
      if (val) {
        selectedKeys.value = getNewSelectedKeys(rightFilteredEnabledKeys.value, leftSelectedKeys.value, []);
      } else {
        selectedKeys.value = getNewSelectedKeys([], leftSelectedKeys.value, rightFilteredEnabledKeys.value);
      }
    };

    const onCancel = () => {
      onUpdateVisible(false);
    };

    const onOk = () => {
      return props.ok?.(dataSource.value, leftDataSource.value, rightDataSource.value);
    };

    const onReset = () => {
      return props.reset?.();
    };

    let sortableInstances: [Sortable | null, Sortable | null] = [null, null];

    const destroySortable = () => {
      sortableInstances?.forEach((v) => v?.destroy());
      sortableInstances = [null, null];
    };

    const getTransferDom = (): HTMLElement | undefined => {
      const modalDom = document.getElementById(modalId)?.firstElementChild;
      if (!modalDom) {
        return undefined;
      }
      const [transferDom] = modalDom.getElementsByClassName(`${classNamePrefix}-transfer`);
      if (!transferDom) {
        return undefined;
      }
      return transferDom as HTMLElement;
    };

    const getTransferListContentDom = (transferDom: HTMLElement, index: number): HTMLElement | undefined => {
      return transferDom.children
        .item(index)
        ?.getElementsByClassName('ant-transfer-list-content')
        ?.item(0) as HTMLElement;
    };

    const createLeftSortable = (dom: HTMLElement) => {
      sortableInstances[0] = new Sortable(dom, {
        group: `${classNamePrefix}-transfer-left`,
        handle: `.${classNamePrefix}-transfer-item-handle`,
        animation: 150,
        onSort: ({ oldIndex, newIndex }) => {
          const oldTarget = leftFilteredDataSource.value[oldIndex];
          const newTarget = leftFilteredDataSource.value[newIndex];
          if (oldTarget && newTarget) {
            const originOldTargetIndex = findDataOptionIndex(dataSource.value, oldTarget.key);
            const originNewTargetIndex = findDataOptionIndex(dataSource.value, newTarget.key);
            if (originOldTargetIndex >= 0 && originNewTargetIndex >= 0) {
              move(dataSource.value, originOldTargetIndex, originNewTargetIndex);
              onUpdateDataSource([...dataSource.value]);
            }
          }
        }
      });
    };

    const createRightSortable = (dom: HTMLElement) => {
      sortableInstances[1] = new Sortable(dom, {
        group: `${classNamePrefix}-transfer-right`,
        handle: `.${classNamePrefix}-transfer-item-handle`,
        animation: 150,
        onSort: ({ oldIndex, newIndex }) => {
          const oldTarget = rightFilteredDataSource.value[oldIndex];
          const newTarget = rightFilteredDataSource.value[newIndex];
          if (oldTarget && newTarget) {
            const originOldTargetIndex = findDataOptionIndex(dataSource.value, oldTarget.key);
            const originNewTargetIndex = findDataOptionIndex(dataSource.value, newTarget.key);
            if (originOldTargetIndex >= 0 && originNewTargetIndex >= 0) {
              move(dataSource.value, originOldTargetIndex, originNewTargetIndex);
              onUpdateDataSource([...dataSource.value]);
            }
          }
        }
      });
    };

    const findDataOptionIndex = (list: DataOption[], key: string): number => {
      return list.findIndex((v) => v.key === key);
    };

    const move = (list: unknown[], oldIndex: number, newIndex: number) => {
      const target = list[oldIndex];
      list.splice(oldIndex, 1);
      list.splice(newIndex, 0, target);
    };

    const init = () => {
      if (props.fields) {
        const allFields = [...props.fields];
        dataSource.value = allFields;
        targetKeys.value = allFields.filter((v) => v.invisible == null || !v.invisible).map((v) => v.key);
      } else {
        dataSource.value = [...(props.invisibleFields || []), ...(props.visibleFields || [])];
        targetKeys.value = (props.visibleFields || []).map((v) => v.key);
      }
      selectedKeys.value = [];
      searchValues.value = ['', ''];
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          init();
          nextTick(() => {
            const transferDom = getTransferDom();
            if (!transferDom) {
              return;
            }
            const leftListDom = getTransferListContentDom(transferDom, 0);
            if (leftListDom) {
              createLeftSortable(leftListDom);
            }
            const rightListDom = getTransferListContentDom(transferDom, 2);
            if (rightListDom) {
              createRightSortable(rightListDom);
            }
          });
        } else {
          destroySortable();
        }
      }
    );

    watch(leftFilteredDataSource, (val) => {
      if (val.length) {
        if (sortableInstances[0]) {
          return;
        }
        nextTick(() => {
          if (sortableInstances[0]) {
            return;
          }
          const transferDom = getTransferDom();
          if (!transferDom) {
            return;
          }
          const leftListDom = getTransferListContentDom(transferDom, 0);
          if (leftListDom) {
            createLeftSortable(leftListDom);
          }
        });
      } else {
        sortableInstances[0]?.destroy();
        sortableInstances[0] = null;
      }
    });

    watch(rightFilteredDataSource, (val) => {
      if (val.length) {
        if (sortableInstances[1]) {
          return;
        }
        nextTick(() => {
          if (sortableInstances[1]) {
            return;
          }
          const transferDom = getTransferDom();
          if (!transferDom) {
            return;
          }
          const rightListDom = getTransferListContentDom(transferDom, 2);
          if (rightListDom) {
            createRightSortable(rightListDom);
          }
        });
      } else {
        sortableInstances[1]?.destroy();
        sortableInstances[1] = null;
      }
    });

    onUnmounted(() => {
      destroySortable();
    });

    return {
      modalId,

      onUpdateVisible,

      dataSource,
      targetKeys,
      onUpdateTargetKeys,
      selectedKeys,
      onUpdateSelectedKeys,
      searchValues,
      onSearch,
      filterOption,
      leftSelectedAllStatus,
      rightSelectedAllStatus,

      renderItem,
      onCancel,
      onOk,
      onReset,
      onLeftSelectedAll,
      onRightSelectedAll
    };
  },
  render() {
    const {
      modalId,

      visible,
      onUpdateVisible,

      dataSource,
      renderItem,
      targetKeys,
      onUpdateTargetKeys,
      selectedKeys,
      onUpdateSelectedKeys,
      onSearch,
      filterOption,
      leftSelectedAllStatus,
      rightSelectedAllStatus,

      onCancel,
      onOk,
      onReset,
      onLeftSelectedAll,
      onRightSelectedAll
    } = this;
    return createVNode(
      OioModal,
      {
        title: this.$translate('表头设置'),
        wrapperClassName: `${classNamePrefix}-modal`,
        wrapperProps: {
          id: modalId
        },
        width: '720px',
        destroyOnClose: true,
        visible,
        'onUpdate:visible': onUpdateVisible,
        cancelCallback: onCancel
      },
      {
        default: () => {
          return [
            createVNode(
              ATransfer,
              {
                class: `${classNamePrefix}-transfer`,
                dataSource,
                render: renderItem,
                showSearch: true,
                showSelectAll: false,
                filterOption,
                targetKeys,
                selectedKeys,
                'onUpdate:targetKeys': onUpdateTargetKeys,
                'onUpdate:selectedKeys': onUpdateSelectedKeys,
                onSearch
              },
              {
                leftTitle: () => {
                  return [
                    createVNode('div', { class: [`${classNamePrefix}-title`, `${classNamePrefix}-title-left`] }, [
                      createVNode(OioCheckbox, {
                        checked: leftSelectedAllStatus === CheckedStatus.all,
                        indeterminate: leftSelectedAllStatus === CheckedStatus.part,
                        'onUpdate:checked': onLeftSelectedAll
                      }),
                      createVNode('span', {}, this.$translate('未展示字段'))
                    ])
                  ];
                },
                rightTitle: () => {
                  return [
                    createVNode('div', { class: [`${classNamePrefix}-title`, `${classNamePrefix}-title-right`] }, [
                      createVNode(OioCheckbox, {
                        checked: rightSelectedAllStatus === CheckedStatus.all,
                        indeterminate: rightSelectedAllStatus === CheckedStatus.part,
                        'onUpdate:checked': onRightSelectedAll
                      }),
                      createVNode('span', {}, this.$translate('已展示字段'))
                    ])
                  ];
                },
                leftSelectAllLabel: ({ selectedCount, totalCount }) => {
                  return `${selectedCount}/${totalCount}`;
                },
                rightSelectAllLabel: ({ selectedCount, totalCount }) => {
                  return `${selectedCount}/${totalCount}`;
                }
                // children: (props) => {
                //   return [
                //     createVNode(
                //       'div',
                //       {
                //         class: 'ant-transfer-list-body-search-wrapper'
                //       },
                //       [
                //         createVNode(OioInputSearch, {
                //           class: 'ant-transfer-list-search',
                //           placeholder: this.$translate('请输入搜索内容'),
                //           onSearch: (e: InputSearchEvent) => onSearch(props.direction, e.value)
                //         })
                //       ]
                //     ),
                //     createVNode(AListBody, { ...props })
                //   ];
                // }
              }
            )
          ];
        },
        footer: () => {
          return [
            createVNode('div', { class: `${classNamePrefix}-modal-footer` }, [
              createVNode('div', { class: `${classNamePrefix}-modal-footer-left` }, [
                createVNode(
                  OioButton,
                  { type: ButtonType.link, async: true, icon: 'oinone-zhongzhi2', onClick: onReset },
                  { default: () => this.$translate('恢复默认值') }
                )
              ]),
              createVNode('div', { class: `${classNamePrefix}-modal-footer-right` }, [
                createVNode(OioButton, { onClick: onCancel }, { default: () => this.$translate('取消') }),
                createVNode(
                  OioButton,
                  { type: ButtonType.primary, async: true, onClick: onOk },
                  { default: () => this.$translate('确定') }
                )
              ])
            ])
          ];
        }
      }
    );
  }
});
</script>
