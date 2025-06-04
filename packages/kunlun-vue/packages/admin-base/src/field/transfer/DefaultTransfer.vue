<template>
  <div>
    <a-transfer
      v-model:target-keys="targetKeys"
      :rowKey="(option) => option.id"
      :data-source="options"
      :show-search="true"
      :disabled="disabled || readonly"
      :render="(item) => item.title"
      :titles="titles"
      class="default-translate-wrapper"
      :filter-option="filterOption"
      :list-style="{ flex: 1, background: '#fff', width: 0 }"
      @change="onChange"
      @search="onSearch"
    >
      <template
        #children="{ direction, filteredItems, selectedKeys, disabled: listDisabled, onItemSelectAll, onItemSelect }"
      >
        <a-table
          v-if="showTable[direction]"
          :row-selection="
            getRowSelection({
              disabled: listDisabled,
              selectedKeys,
              onItemSelectAll,
              onItemSelect
            })
          "
          :pagination="false"
          :columns="getColumns(direction)"
          :data-source="getPageOptions(direction, filteredItems)"
          size="small"
          :style="{ pointerEvents: listDisabled ? 'none' : null }"
          :custom-row="
            ({ key, disabled: itemDisabled }) => ({
              onClick: () => {
                if (itemDisabled || listDisabled) return;
                onItemSelect(key, !selectedKeys.includes(key));
              }
            })
          "
        />
        <div style="background: #fff; height: 344px" v-else>
          <div class="transfer-sortable-wrapper" v-if="sortable && direction === 'right'">
            <draggable :list="filteredItems" @end="(e) => ondragend(filteredItems)" item-key="id">
              <template #item="{ element }">
                <div>
                  <a-checkbox
                    :value="element.id"
                    :checked="selectedKeys.includes(element.id)"
                    :disabled="listDisabled"
                    @change="
                      (e) => {
                        onCheckboxChange(e, onItemSelect);
                      }
                    "
                  >
                    {{ element.title || element.displayName || element.label }}
                  </a-checkbox>
                  <oio-icon icon="oinone-yidong" />
                </div>
              </template>
            </draggable>
          </div>
          <a-checkbox-group
            v-else
            :value="selectedKeys"
            :options="
              getPageOptions(direction, filteredItems).map((o) => {
                return { label: o.title, value: o.id, disabled: listDisabled };
              })
            "
            @change="(val) => onCheckboxGroupChange(val, onItemSelectAll)"
          />
        </div>
        <a-pagination
          v-if="direction === 'left' && filteredItems && filteredItems.length"
          v-model:current="leftCurrentPage"
          simple
          :total="filteredItems.length"
          style="float: right; margin: 5px"
        />
        <a-pagination
          v-else-if="direction === 'right' && filteredItems && filteredItems.length && !sortable"
          v-model:current="rightCurrentPage"
          simple
          :total="filteredItems.length"
          style="float: right; margin: 5px"
        />
      </template>
    </a-transfer>
  </div>
</template>
<script lang="ts">
import { ActiveRecord, translateValueByKey } from '@oinone/kunlun-engine';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import {
  CheckboxGroup as ACheckboxGroup,
  Pagination as APagination,
  Table as ATable,
  Transfer as ATransfer
} from 'ant-design-vue';
import { computed, defineComponent, ref, watch } from 'vue';
import Draggable from 'vuedraggable';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../basic';
import { ChildrenViewType, DefaultTransferProps } from './typings';

export default defineComponent({
  name: 'DefaultTransfer',
  components: {
    ATransfer,
    ATable,
    APagination,
    ACheckboxGroup,
    Draggable,
    OioIcon
  },
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    ...DefaultTransferProps
  },
  setup(props) {
    const { readonly, disabled } = useMetadataProps(props, true);
    const titles = ['待选择', '已选择'].map((v) => ` ${translateValueByKey(v)}`);

    const targetKeys = ref<string[]>([]);

    watch(
      () => props.defaultValue,
      () => {
        if (props.defaultValue?.length) {
          targetKeys.value = props.defaultValue.map((v: ActiveRecord) => v.id as string);
        }
      }
    );

    watch(
      () => props.value,
      () => {
        targetKeys.value = (props.value ?? props.defaultValue ?? []).map((v: ActiveRecord) => v.id as string);
      }
    );

    const rightCurrentPage = ref(1);

    const leftCurrentPage = ref(1);

    const rightTotalPage = computed(() => {
      return props.value?.length ?? 1;
    });

    const leftTotalPage = computed(() => {
      return (props.options?.length ?? 1) - (props.value?.length ?? 0);
    });

    const getColumns = (direction) => {
      return (direction === 'left' ? leftTableColumns : rightTableColumns).value.map((c) =>
        Object.assign(c, { ellipsis: true })
      );
    };

    const leftTableColumns = computed(() => {
      if (props.leftColumns) {
        return props.leftColumns;
      }
      if (props.leftFields) {
        return props.leftFields.split(',').map((field) => {
          return { dataIndex: field, title: field };
        }) as Record<string, string>[];
      }
      if (!props.leftFieldDefinitions?.length) {
        return [];
      }
      return props.leftFieldDefinitions.map((field) => {
        return { dataIndex: field.name, title: field.label };
      }) as Record<string, string>[];
    });

    const rightTableColumns = computed(() => {
      if (props.rightColumns) {
        return props.rightColumns;
      }
      if (props.rightFields) {
        return props.rightFields.split(',').map((field) => {
          return { dataIndex: field, title: field };
        }) as Record<string, string>[];
      }
      if (!props.rightFieldDefinitions?.length) {
        return [];
      }
      return props.rightFieldDefinitions.map((field) => {
        return { dataIndex: field.name, title: field.label };
      }) as Record<string, string>[];
    });

    const showTable = computed(() => {
      return {
        left: props.leftDisplayType === ChildrenViewType.TABLE,
        right: props.rightDisplayType === ChildrenViewType.TABLE
      };
    });

    const getPageOptions = (direction, options) => {
      const currentPage = direction === 'left' ? leftCurrentPage.value : rightCurrentPage.value;
      const startIndex = (currentPage - 1) * 10;
      return options.slice(startIndex, startIndex + 10);
    };

    const getRowSelection = ({ disabled, selectedKeys, onItemSelectAll, onItemSelect }) => {
      return {
        getCheckboxProps: (item: Record<string, string | boolean>) => ({
          disabled: disabled || item.disabled
        }),
        onSelectAll(selected: boolean, selectedRows: Record<string, string | boolean>[]) {
          const treeSelectedKeys = selectedRows.filter((item) => !item.disabled).map(({ key }) => key);
          onItemSelectAll(treeSelectedKeys, selected);
        },
        onSelect({ key }: Record<string, string>, selected: boolean) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: selectedKeys,
        hideSelectAll: true
      };
    };

    const onCheckboxChange = (e, onItemSelect) => {
      onItemSelect(e.target.value, e.target.checked);
    };

    const onCheckboxGroupChange = (val, onItemSelectAll) => {
      onItemSelectAll(val);
    };

    const onCheckboxAllChange = (direction, filteredItems, onItemSelectAll, e) => {
      if (!e.target.checked) {
        onItemSelectAll([]);
        return;
      }
      const options = getPageOptions(direction, filteredItems);
      onItemSelectAll(options.map((o) => o.id));
    };

    const onChange = (keys, direction = null, moveKeys = []) => {
      if (direction === 'right' && targetKeys.value.length) {
        targetKeys.value = [...keys.slice(moveKeys.length, keys.length), ...moveKeys];
        props.change?.(targetKeys.value);
      } else {
        props.change?.(keys);
      }
      leftCurrentPage.value = 1;
      rightCurrentPage.value = 1;
    };

    const onSearch = (direction) => {
      if (direction === 'left') {
        leftCurrentPage.value = 1;
      }
      if (direction === 'right') {
        rightCurrentPage.value = 1;
      }
    };

    const filterOption = (inputValue, option) => {
      if (!inputValue) {
        return true;
      }
      if (!props.searchFields?.length) {
        return true;
      }
      let matched = false;
      props.searchFields?.forEach((fields) => {
        if (option[fields]?.includes(inputValue)) {
          matched = true;
        }
      });
      return matched;
    };
    const ondragend = (items) => {
      onChange(items.map((i) => i.id));
    };

    return {
      readonly,
      titles,
      ondragend,
      leftCurrentPage,
      rightCurrentPage,
      disabled,
      targetKeys,
      getRowSelection,
      showTable,
      leftTableColumns,
      rightTableColumns,
      leftTotalPage,
      rightTotalPage,
      getPageOptions,
      onCheckboxGroupChange,
      onCheckboxAllChange,
      onChange,
      getColumns,
      filterOption,
      onSearch,
      onCheckboxChange
    };
  }
});
</script>

<style lang="scss">
.default-translate-wrapper {
  .ant-transfer-list-header-dropdown {
    display: none;
  }

  .ant-checkbox-group {
    display: flex;
    flex-direction: column;
    margin: 0 16px;
  }

  .ant-checkbox-group-item {
    margin-bottom: 12px;
    width: 100%;
  }

  .default-transfer-checkall {
    margin-bottom: 12px;
    width: 100%;
    background: #fafafa;
    padding: 6px 16px;
  }

  .ant-checkbox + span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .transfer-sortable-wrapper {
    overflow: auto;
    height: 354px;
    padding-bottom: 24px;

    > div {
      display: flex;
      flex-direction: column;
      gap: 12px;

      > div {
        display: flex;
        padding: 0 12px;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
    }
  }
}
</style>
