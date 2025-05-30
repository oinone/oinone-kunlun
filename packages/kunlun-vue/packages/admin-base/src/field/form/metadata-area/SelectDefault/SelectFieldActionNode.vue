<template>
  <div class="select-field-action__wrapper">
    <oio-icon
      class="select-field-action__drop-icon"
      icon="oinone-yidong"
      color="#979797"
      size="var(--oio-font-size-sm)"
    />
    <a-cascader
      :class="['oio-cascader', !disabled && readonly && 'oio-cascader__readonly', open && 'oio-select-cascader-open']"
      dropdownClassName="oio-select-default-cascader__dropdown"
      size="large"
      expandTrigger="hover"
      :disabled="disabled || readonly"
      :allowClear="false"
      :placeholder="$translate('可根据名称或显示名称搜索')"
      v-model:value="selectValue"
      :options="options"
      :field-names="{ label: 'displayLabel', value: 'name', children: 'children' }"
      showSearch
      matchInputWidth
      :style="{ width: labelEditable ? '160px' : 'calc(100% - 76px)' }"
      :open="open"
      @change="onSelectChange"
      @dropdownVisibleChange="onDropdownVisibleChange"
      :get-popup-container="(triggerNode) => triggerNode.parentNode"
    >
      <template #displayRender="{ labels }">
        <span @click="onClick" class="select-field-action-select-span">{{
          labels.filter((l) => l).join('  >  ')
        }}</span>
      </template>
    </a-cascader>
    <oio-input
      v-if="labelEditable"
      :class="['select-field-action__input', readonly && 'select-field-action--input__readonly']"
      :disabled="disabled"
      :readonly="readonly"
      v-model:value="labelValue"
      @input="onInput"
    />
    <oio-icon
      v-if="!readonly"
      :class="['select-field-action-select-delete-icon', disabled && 'select-field-action-delete__disabled']"
      icon="oinone-a-ShapeCopy3beifen"
      size="var(--oio-font-size)"
      @click="onDelete"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import { Cascader as ACascader } from 'ant-design-vue';
import { OioIcon, OioInput } from '@kunlun/vue-ui-antd';
import { CascaderOptionType } from 'ant-design-vue/lib/cascader';
import { SelectListType, FormValue, ActionTypeMap, OioSelectMetadataProps } from '../typing';

export default defineComponent({
  name: 'SelectFieldActionNode',
  props: {
    ...OioSelectMetadataProps,
    field: {
      type: Array as PropType<string[]>,
      default: () => [],
      required: true
    },
    dataSource: {
      type: Array as PropType<SelectListType>,
      required: true
    },
    valueSource: {
      type: Array as PropType<FormValue>,
      default: () => []
    },
    labelEditable: {
      type: Boolean,
      default: true
    }
  },
  components: { ACascader, OioIcon, OioInput },
  emits: ['onChange', 'onDelete'],
  setup(props, { emit }) {
    const open = ref(false);
    const options = computed(() => {
      return convertDisplayLabel(props.dataSource) as CascaderOptionType[];
    });

    const selectValue = computed(() => {
      return props.field.filter((f: string) => f);
    });

    const label = ref();

    const labelValue = computed({
      get() {
        if (label.value) {
          return label.value;
        }
        const option = findFieldsInSource();
        return option?.label;
      },
      set(val) {
        label.value = val;
      }
    });

    const convertDisplayLabel = (list: SelectListType, depth = 1): SelectListType => {
      if (!list?.length) {
        return list;
      }
      return list.map((l) => {
        let displayLabel: string | undefined = '';
        if (l.actionType) {
          displayLabel = l.children?.length
            ? l.displayName ?? l.label
            : `${l.displayName}(${ActionTypeMap[l.actionType]}) - ${l.name}`;
        } else {
          displayLabel = l.children?.length ? l.displayName ?? l.label : `${l.displayName} - ${l.name}`;
        }
        return {
          ...l,
          isLeaf: !(l.children?.length && depth < 2),
          displayLabel,
          children: l.children?.length && depth < 2 ? convertDisplayLabel(l.children, depth + 1) : null
        };
      }) as SelectListType;
    };

    const findFieldsInSource = (address = selectValue.value) => {
      const option = props.valueSource.find((o) => o.name === address[0]);
      if (!option) {
        return;
      }
      if (address.length < 2) {
        return option;
      }
      if (!option.children || !option.children.length) {
        return option;
      }
      return option.children.find((o) => o.name === address[1]);
    };

    const onSelectChange = (value) => {
      emit('onChange', { value: findFieldsInSource(value), address: value });
    };

    const onDelete = () => {
      if (props.disabled) {
        return;
      }
      emit('onDelete');
    };

    const onInput = () => {
      emit('onChange', {
        value: { ...findFieldsInSource(), label: label.value },
        address: selectValue.value,
        isInput: true
      });
    };

    const onClick = (e) => {
      e.preventDefault();
    };

    const onDropdownVisibleChange = (visible) => {
      open.value = visible;
    };
    
    return {
      open,
      onDropdownVisibleChange,
      labelValue,
      options,
      selectValue,
      onSelectChange,
      onDelete,
      onInput,
      onClick
    };
  }
});
</script>
<style lang="scss">
.select-field-action__wrapper {
  padding: var(--oio-padding-xs) 0;
  display: flex;
  flex: 1;
  align-items: center;
  width: 408px;
  height: 56px;
  background: var(--oio-readonly-bg);
  border: 1px solid var(--oio-border-color);
  border-radius: var(--oio-border-radius);
  margin-top: var(--oio-margin-xs);

  .oio-cascader {
    font-size: var(--oio-font-size);
  }

  &:hover {
    cursor: grab;
    background: var(--oio-search-background);
    box-shadow: 0px 0px 6px 0px var(--oio-select-shadow-hover);

    .select-field-action__drop-icon > svg {
      color: var(--oio-primary-color);
    }
  }

  .oio-cascader {
    width: 160px;
  }

  .select-field-action__drop-icon {
    margin: 0 var(--oio-margin-sm);
  }

  .select-field-action__input {
    width: 160px;
    margin-left: var(--oio-margin-sm);
  }

  .select-field-action__button {
    margin-top: var(--oio-margin-md);
  }

  .select-field-action-select-delete-icon {
    cursor: pointer;
    color: var(--oio-primary-color);
    margin-left: var(--oio-margin-sm);
  }

  .select-field-action-delete__disabled {
    cursor: not-allowed;
    color: var(--oio-disabled-color);
  }

  .oio-cascader__readonly {
    width: 175px;
    & > .ant-select-selector {
      background-color: var(--oio-disabled-bg);
      &:hover {
        cursor: text;
        border-color: var(--oio-input-border-color-hover);
      }
    }

    .select-field-action-select-span {
      color: var(--oio-input-text-color);
    }
  }

  .select-field-action--input__readonly {
    width: 175px;
  }
}

.oio-select-default-cascader__dropdown {
  z-index: 9999;
  .ant-cascader-menu-item {
    width: 160px !important;
  }
  .ant-cascader-menu-item-content {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

.oio-select-cascader-open {
  .ant-select-selection-search {
    z-index: 9999;
  }
}
</style>
