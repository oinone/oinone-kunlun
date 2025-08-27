<script lang="ts">
import { createVNode, defineComponent, PropType, ref, watch } from 'vue';
import { OioIcon, OioButton, ButtonType } from '@oinone/kunlun-vue-ui-antd';
import { Popover as APopover, RadioGroup as ARadioGroup } from 'ant-design-vue';
import { Container, Draggable } from 'vue3-smooth-dnd';
import { EDirection, ISort } from '@oinone/kunlun-service';
import { deepClone } from '@oinone/kunlun-meta';
import { RuntimeModelField, translateValueByKey } from '@oinone/kunlun-engine';

const classNamePrefix = 'table-sort-field';

const fieldSortOptions = [
  { value: EDirection.ASC, label: translateValueByKey('升序') },
  { value: EDirection.DESC, label: translateValueByKey('降序') }
];
function RenderField(props) {
  const { element, onChangeElement } = props;
  const onChangeSortType = (val) => {
    const newElement = {
      ...element,
      direction: val
    };
    onChangeElement(newElement);
  };
  return createVNode(
    Draggable,
    { class: `${classNamePrefix}-draggable-item`, key: element.key },
    {
      default: () =>
        createVNode(
          'div',
          {
            class: `${classNamePrefix}-draggable-item`,
            title: element.title,
            draggable: true
          },
          [
            createVNode(OioIcon, {
              class: `${classNamePrefix}-draggable-item-handle`,
              icon: 'oinone-yidong',
              size: 10
            }),
            createVNode('span', { class: `${classNamePrefix}-draggable-item-title` }, [
              createVNode('span', {}, element.title)
            ]),
            createVNode(ARadioGroup, {
              value: element.direction,
              options: fieldSortOptions,
              optionType: 'button',
              'onUpdate:value': onChangeSortType,
              buttonStyle: 'solid'
            })
          ]
        )
    }
  );
}

function SortFieldPopoverFooter(props) {
  return createVNode('div', { class: `${classNamePrefix}-popover-footer` }, [
    createVNode(
      OioButton,
      {
        type: ButtonType.primary,
        onClick: () => props.onSave(),
        height: '20px'
      },
      { default: () => '确定' }
    )
  ]);
}

function SortAddField(props) {
  return createVNode(
    'a',
    { class: `${classNamePrefix}-add-field`, onClick: () => props.onAdd() },
    translateValueByKey('+ 添加排序字段')
  );
}

export default defineComponent({
  name: 'TableControlIconWidget',
  props: {
    fields: {
      type: Array as PropType<(ISort & { title: string })[]>,
      default: () => []
    },
    onSortChange: {
      type: Function as PropType<(fields: ISort[]) => void>
    },
    allFields: {
      type: Array as PropType<RuntimeModelField[]>,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const dataSource = ref<(ISort & { title?: string })[]>(props.fields);

    watch(
      () => props.fields,
      () => {
        dataSource.value = deepClone(props.fields);
      }
    );

    const findDataOptionIndex = (list: ISort[], key: string): number => {
      return list.findIndex((v) => v.sortField === key);
    };

    const move = (list: unknown[], oldIndex: number, newIndex: number) => {
      const target = list[oldIndex];
      list.splice(oldIndex, 1);
      list.splice(newIndex, 0, target);
    };

    const onDrop = ({ removedIndex, addedIndex }) => {
      if (removedIndex < 0 || addedIndex < 0) {
        return;
      }
      const oldTarget = dataSource.value[removedIndex];
      const newTarget = dataSource.value[addedIndex];
      if (oldTarget && newTarget) {
        const originOldTargetIndex = findDataOptionIndex(dataSource.value, oldTarget.sortField);
        const originNewTargetIndex = findDataOptionIndex(dataSource.value, newTarget.sortField);
        if (originOldTargetIndex >= 0 && originNewTargetIndex >= 0) {
          move(dataSource.value, originOldTargetIndex, originNewTargetIndex);
        }
      }
    };
    const onSave = () => {
      props.onSortChange?.(
        dataSource.value.map((item) => {
          const { title, ...rest } = item;
          return rest as ISort;
        })
      );
    };

    const handleElementChange = (newElement, index) => {
      dataSource.value[index] = {
        ...dataSource.value[index],
        ...newElement
      };
    };

    const visible = ref(false);

    const onUpdateVisible = (val: boolean) => {
      visible.value = val;
    };

    const onAddField = (field: RuntimeModelField) => {
      const newElement = {
        sortField: field.name,
        title: field.label,
        direction: EDirection.ASC
      };
      dataSource.value.push(newElement);
    };

    return {
      onSave,
      onDrop,
      dataSource,
      visible,
      onUpdateVisible,
      handleElementChange,
      onAddField
    };
  },
  render() {
    const { onSave, onDrop, dataSource, visible, onUpdateVisible, handleElementChange } = this;
    return createVNode(
      'div',
      {
        class: 'table-control-icon-widget'
      },
      [
        createVNode(
          APopover,
          {
            trigger: 'click',
            placement: 'bottomRight',
            visible,
            'onUpdate:visible': onUpdateVisible,
            class: `${classNamePrefix}-popover-wrapper`
          },
          {
            content: () =>
              createVNode('div', { class: `${classNamePrefix}-popover-content` }, [
                createVNode(
                  Container,
                  {
                    class: `${classNamePrefix}-draggable-wrapper`,
                    dragHandleSelector: `.${classNamePrefix}-draggable-item-handle`,
                    behaviour: 'contain',
                    onDrop
                  },
                  {
                    default: () =>
                      (dataSource || []).map((field, index) =>
                        createVNode(RenderField, {
                          key: field.sortField,
                          element: field,
                          onChangeElement: (newElement) => {
                            handleElementChange(newElement, index);
                          }
                        })
                      )
                  }
                ),
                createVNode(SortAddField, {
                  onAdd: () => {
                    this.$emit('add');
                  }
                }),
                createVNode(SortFieldPopoverFooter, {
                  onSave
                })
              ]),
            default: () =>
              createVNode(OioButton, {
                type: ButtonType.link,
                icon: 'oinone-biaotoushezhi',
                style: 'font-size: 16px; margin-right: 8px; cursor: pointer;'
              })
          }
        )
      ]
    );
  }
});
</script>
<style lang="scss">
.table-sort-field-popover-wrapper {
  padding: 12px 0px;
}
.table-sort-field {
  &-popover-content {
    display: flex;
    flex-direction: column;
    // width: 120px;
  }
  &-draggable-wrapper {
    min-height: 32px;
    border-radius: 4px;
    padding: 8px 0px;
  }
  &-draggable-item {
    display: flex;
    justify-content: space-between;
    line-height: 32px;
    padding: 2px 8px;
  }
  &-draggable-item-handle {
    cursor: pointer;
  }
  &-popover-footer {
    border-top: 1px solid #f0f0f0;
    padding-top: 8px;
  }

  &-draggable-item-title {
    padding: 0px 12px;
  }
}
</style>
