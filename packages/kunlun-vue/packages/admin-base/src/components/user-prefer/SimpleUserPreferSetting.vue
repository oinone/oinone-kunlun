<script lang="ts">
import { OioCheckbox, OioEmptyData, OioIcon, OioInputSearch, PropRecordHelper } from '@kunlun/vue-ui-antd';
import { Popover as APopover } from 'ant-design-vue';
import { computed, createVNode, defineComponent, PropType, ref, watch } from 'vue';
import { Container, Draggable } from 'vue3-smooth-dnd';
import { classNamePrefix, DataOption } from './typing';

export default defineComponent({
  name: 'SimpleUserPreferSetting',
  components: {
    OioCheckbox,
    OioIcon,
    OioInputSearch,
    APopover,
    Container,
    Draggable,
    OioEmptyData
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
    }
  },
  emits: ['update:visible', 'save'],
  setup(props, context) {
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

    const searchValue = ref<string>('');

    const onUpdateSearchValue = (val: string) => {
      searchValue.value = val;
    };

    const filterOption = (inputValue: string, option: DataOption) => {
      if (!inputValue) {
        return true;
      }
      return option.title.indexOf(inputValue) > -1;
    };

    const invisibleDataSource = computed(() => dataSource.value.filter((v) => !targetKeys.value.includes(v.key)));

    const visibleDataSource = computed(() => dataSource.value.filter((v) => targetKeys.value.includes(v.key)));

    const filteredDataSource = computed(() => dataSource.value.filter((v) => filterOption(searchValue.value, v)));

    const onChecked = (val: boolean, option: DataOption) => {
      const { key } = option;
      if (val) {
        onUpdateTargetKeys([...new Set([...targetKeys.value, key])]);
      } else {
        onUpdateTargetKeys(targetKeys.value.filter((v) => v !== key));
      }
      onSave();
    };

    const findDataOptionIndex = (list: DataOption[], key: string): number => {
      return list.findIndex((v) => v.key === key);
    };

    const move = (list: unknown[], oldIndex: number, newIndex: number) => {
      const target = list[oldIndex];
      list.splice(oldIndex, 1);
      list.splice(newIndex, 0, target);
    };

    const onDrop = ({ removedIndex, addedIndex }) => {
      if (!removedIndex || !addedIndex) {
        return;
      }
      const oldTarget = filteredDataSource.value[removedIndex];
      const newTarget = filteredDataSource.value[addedIndex];
      if (oldTarget && newTarget) {
        const originOldTargetIndex = findDataOptionIndex(dataSource.value, oldTarget.key);
        const originNewTargetIndex = findDataOptionIndex(dataSource.value, newTarget.key);
        if (originOldTargetIndex >= 0 && originNewTargetIndex >= 0) {
          move(dataSource.value, originOldTargetIndex, originNewTargetIndex);
          onUpdateDataSource([...dataSource.value]);
        }
      }
      onSave();
    };

    const onSave = () => {
      context.emit('save', dataSource.value, invisibleDataSource.value, visibleDataSource.value);
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
      searchValue.value = '';
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          init();
        }
      }
    );

    return {
      onUpdateVisible,
      targetKeys,
      filteredDataSource,
      searchValue,
      onUpdateSearchValue,
      onChecked,
      onDrop
    };
  },
  render() {
    const {
      $slots,
      visible,
      onUpdateVisible,
      targetKeys,
      filteredDataSource,
      searchValue,
      onUpdateSearchValue,
      onChecked,
      onDrop
    } = this;
    const { trigger: triggerSlot } = PropRecordHelper.collectionSlots($slots, ['trigger']);
    const triggerChildren = triggerSlot?.() || [];
    return createVNode(
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
          const contentChildren = [
            createVNode(OioInputSearch, {
              value: searchValue,
              placeholder: '请输入关键字',
              'onUpdate:value': onUpdateSearchValue
            })
          ];
          if (filteredDataSource.length) {
            contentChildren.push(
              createVNode(
                Container,
                {
                  class: `${classNamePrefix}-draggable-wrapper`,
                  dragHandleSelector: `.${classNamePrefix}-draggable-item-handle`,
                  behaviour: 'contain',
                  onDrop
                },
                {
                  default: () => {
                    return filteredDataSource.map((element) => {
                      return createVNode(
                        Draggable,
                        { key: element.key },
                        {
                          default: () => {
                            return createVNode('div', { class: `${classNamePrefix}-draggable-item` }, [
                              createVNode('span', { class: `${classNamePrefix}-draggable-item-title` }, [
                                createVNode(OioCheckbox, {
                                  checked: targetKeys.includes(element.key),
                                  'onUpdate:checked': (val: boolean) => onChecked(val, element)
                                }),
                                createVNode('span', {}, element.title)
                              ]),
                              createVNode(OioIcon, {
                                class: `${classNamePrefix}-draggable-item-handle`,
                                icon: 'oinone-yidong',
                                size: 10
                              })
                            ]);
                          }
                        }
                      );
                    });
                  }
                }
              )
            );
          } else {
            contentChildren.push(createVNode(OioEmptyData));
          }
          return contentChildren;
        }
      }
    );
  }
});
</script>
