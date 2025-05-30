<template>
  <div class="select-field-action-select-wrapper">
    <draggable v-model="draggableList" :disabled="disabled || readonly" item-key="sort">
      <template #item="{ element, index }">
        <select-node
          :field="element.items"
          :dataSource="dataSource"
          :valueSource="value"
          :filterSource="unSelectedOptionList"
          :readonly="readonly"
          :disabled="disabled"
          :key="index"
          :label-editable="labelEditable"
          @onChange="
            (payload) => {
              onSelectChange(payload, index);
            }
          "
          @onDelete="() => onDelete(index)"
        />
      </template>
    </draggable>
    <oio-button
      v-if="!readonly"
      :disabled="disabled"
      class="select-field-action__button"
      type="primary"
      @click="onAddRow"
    >
      {{ $translate('添加一行') }}
    </oio-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { OioButton, OioNotification } from '@kunlun/vue-ui-antd';
import { translateValueByKey } from '@kunlun/engine';
import Draggable from 'vuedraggable';
import { BooleanHelper } from '@kunlun/shared';
import { OioMetadataProps } from '../../../../basic/props';
import SelectNode from './SelectFieldActionNode.vue';
import {
  SelectListType,
  SourceDataCollection,
  FormValue,
  SelectWidgetType,
  SortedFields,
  SelectType,
  WidgetTypeMap
} from '../typing';

export default defineComponent({
  name: 'SelectFieldActionSelectComponent',
  props: {
    ...OioMetadataProps,
    widgetType: {
      type: String as PropType<SelectWidgetType>,
      required: true
    },
    fieldActionOptionsList: {
      type: Object as PropType<SourceDataCollection>,
      required: true
    },
    unSelectedOptionList: {
      type: Object as PropType<SourceDataCollection>,
      required: true
    },
    selectedOptionList: {
      type: Object as PropType<SourceDataCollection>,
      required: true
    },
    onFormChange: {
      type: Function as PropType<(payload: SelectListType) => void>,
      required: true
    },
    value: {
      type: Array as PropType<FormValue>,
      default: () => []
    },
    valueFlattend: {
      type: Array as PropType<SelectListType>,
      default: () => []
    },
    labelEditable: {
      type: Boolean,
      default: true
    }
  },
  components: { OioButton, SelectNode, Draggable },
  emits: [],
  setup(props) {
    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

    const dataSource = computed(() => {
      return props.fieldActionOptionsList[props.widgetType];
    });

    const fieldList = computed(() => {
      return props.value.map((v) => getLabelsByValue(v).flat()).flat();
    });

    const draggableList = computed({
      get(): SortedFields[] {
        return sort(fieldList.value);
      },
      set(val: SortedFields[]) {
        props.onFormChange(formateFormValue(val.map((v) => v.items ?? [])));
      }
    });

    const sort = (list: SortedFields[]): SortedFields[] => {
      if (!list.length) {
        return list;
      }
      return list.sort((a, b) => (a?.sort ?? -1) - (b?.sort ?? -1));
    };

    const onAddRow = () => {
      const formPayload: SortedFields[] = [...draggableList.value, { items: [] }];
      props.onFormChange(formateFormValue(formPayload.map((v) => v.items ?? [])) as SelectListType);
    };

    const getLabelsByValue = (value): SortedFields[] => {
      if (!value.children?.length) {
        return [{ sort: value.sort, items: [value.name] }];
      }
      return value.children.map((c) => {
        if (c.name) {
          return [{ sort: c.sort, items: [value.name, c.name] }];
        }
        return [{ sort: c.sort, items: [value.name] }];
      });
    };

    const onSelectChange = ({ value, address, isInput = false }, index) => {
      const findIndex = draggableList.value.findIndex((val) => {
        return val?.items?.join('-') === address.join('-');
      });
      if (!isInput && findIndex > 1) {
        OioNotification.error(
          translateValueByKey('错误'),
          translateValueByKey(`该${WidgetTypeMap[props.widgetType]}已被选择`)
        );
        return;
      }
      const formPayload: SortedFields[] = [...draggableList.value];
      formPayload.splice(index, 1, { items: address });
      if (isInput) {
        props.onFormChange(
          updateInputValue(formateFormValue(formPayload.map((v) => v.items ?? [])), value, address) as SelectListType
        );
        return;
      }
      props.onFormChange(formateFormValue(formPayload.map((v) => v.items ?? [])) as SelectListType);
    };

    const updateInputValue = (sourceList: SelectListType, value: SelectType, address: string[]): SelectListType => {
      if (!sourceList.length) {
        return [];
      }
      const source = [...sourceList];
      if (address.length === 1) {
        return source.map((s) => {
          if (s.name !== value.name) {
            return s;
          }
          return value;
        });
      }
      const parentIndex = source.findIndex((s) => s.name === address[0]);
      if (!source[parentIndex]?.children && !source[parentIndex]?.children?.length) {
        return source;
      }
      source[parentIndex].children = source[parentIndex]?.children?.map((c) => {
        if (c.name === address[1]) {
          return value;
        }
        return c;
      });
      return source;
    };

    const formateFormValue = (list: string[][]): SelectListType => {
      let sortNum = 1;
      return list.map((i) => {
        if (!i?.length) {
          return { sort: sortNum++ };
        }
        // 非关系字段处理
        if (i.length < 2) {
          const target = dataSource.value.find((option) => option.name === i[0]);
          if (!target) {
            return { sort: sortNum++ };
          }
          const existTarget = props.value.find((v) => v.name === target.name && v.model === target.model);
          return {
            name: existTarget?.name ?? target.name,
            model: existTarget?.model ?? target.model,
            label: existTarget?.label ?? target.label,
            type: props.widgetType,
            displayName: target.displayName,
            sort: sortNum++
          };
        }
        // 关系型字段处理
        const parent = dataSource.value.find((o) => o.name === i[0]);
        if (!parent) {
          return { sort: sortNum++ };
        }
        const children = parent.children?.length && i[1] ? parent.children.find((c) => c.name === i[1]) : null;
        const existParent = props.value.find((v) => v.name === parent.name && v.model === parent.model);
        let existChildren: SelectType = {} as SelectType;
        if (children) {
          existChildren = props.valueFlattend.find(
            (v) =>
              v.name === children.name &&
              v.model === children.model &&
              v.parentName === parent.name &&
              v.parentModel === parent.model
          ) as SelectType;
        }
        return {
          name: parent.name,
          model: parent.model,
          label: existParent?.label ?? parent.label,
          type: props.widgetType,
          displayName: parent.displayName,
          sort: sortNum++,
          children: children && [{ ...children, ...existChildren, type: props.widgetType, sort: sortNum++ }]
        };
      }) as SelectListType;
    };

    const onDelete = (index: number) => {
      const formPayload = [...draggableList.value];
      formPayload.splice(index, 1);
      props.onFormChange(formateFormValue(formPayload.map((v) => v.items ?? [])) as SelectListType);
    };

    return { readonly, disabled, dataSource, fieldList, draggableList, onAddRow, onSelectChange, onDelete };
  }
});
</script>
<style lang="scss">
.select-field-action-select-wrapper {
  display: flex;
  flex-direction: column;

  .select-field-action__button {
    width: 88px;
    margin-top: var(--oio-margin-sm);
  }
}
</style>
