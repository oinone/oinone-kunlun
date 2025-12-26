<template>
  <a-select
    ref="selectRef"
    class="oio-select"
    option-label-prop="label"
    label-in-value
    :mode="selectMode"
    :value="currentValue"
    :max-tag-count="maxTagCount"
    :allowClear="allowClear"
    :disabled="innerDisabled"
    :filter-option="false"
    :default-active-first-option="false"
    :options="optionList"
    :placeholder="placeholder"
    :open="false"
    @change="onSelectChange"
    @blur="blur"
    @focus="focus"
    @click="onShowModal"
  >
  </a-select>

  <!-- 弹窗 -->
  <oio-modal
    v-model:visible="showModal"
    :title="title"
    :width="modalWidth"
    wrapper-class-name="vxe-table--ignore-clear"
    @enter="onModalEnter"
    @cancel="onModalCancel"
  >
    <div class="oio-select-modal-dropdown">
      <oio-input
        ref="dropdownInputRef"
        :placeholder="placeholder"
        :value="searchValue"
        @change="(e) => search(e.target.value)"
      >
        <template #prefix>
          <oio-icon icon="oinone-sousuo2" size="16"></oio-icon>
        </template>
      </oio-input>
      <div class="select-modal-dropdown-body">
        <oio-table
          ref="oioTableRef"
          size="small"
          show-overflow
          auto-resize
          stripe
          border
          :height="modalHeight"
          :data="optionList"
          :row-config="{ isCurrent: false, isHover: true }"
          :checkbox-config="checkbox ? { highlight: true, trigger: 'row' } : {}"
          :radio-config="checkbox ? {} : { highlight: true, trigger: 'row' }"
          @checked-all-change="onCheckedAllChange"
          @checked-change="onCheckedChange"
          @radio-change="onRadioChange"
        >
          <oio-column type="checkbox" width="50" v-if="checkbox"></oio-column>
          <oio-column type="radio" width="50" v-else></oio-column>
          <oio-column v-for="column in optionColumns" :key="column.key" v-bind="column"></oio-column>
        </oio-table>

        <oio-pagination
          :page-size="tablePagination.pageSize"
          :current-page="tablePagination.current"
          :total="tablePagination.total"
          @change="onPaginationChange"
        ></oio-pagination>
      </div>
    </div>
  </oio-modal>
</template>
<script lang="ts">
import { Pagination, RuntimeModelField } from '@oinone/kunlun-engine';
import { deepClone, Entity } from '@oinone/kunlun-meta';
import { CheckedChangeEvent, OioColumn, OioTable, OioTableInstance } from '@oinone/kunlun-vue-ui';
import {
  ModalWidth,
  OioIcon,
  OioInput,
  OioModal,
  OioPagination,
  OioSpin,
  SelectMode
} from '@oinone/kunlun-vue-ui-antd';
import { Select as ASelect } from 'ant-design-vue';
import { uniqBy } from 'lodash-es';
import { computed, defineComponent, nextTick, PropType, ref, watch } from 'vue';
import { SelectTableColumn } from '../../basic';
import { RelationSelectProps, relationSelectSetup } from '../../field/prop';

export default defineComponent({
  inheritAttrs: false,
  props: {
    ...RelationSelectProps,
    value: {
      type: [Array, Object]
    },
    generatorSelectOption: Function,
    optionColumns: {
      type: Array as PropType<SelectTableColumn[]>,
      default: () => []
    },
    field: {
      type: Object as PropType<RuntimeModelField>
    },
    modalHeight: {
      type: [String, Number],
      default: 300
    },
    modalWidth: {
      type: [String, Number],
      default: ModalWidth.medium
    },
    selectMode: {
      type: String
    },
    getDataList: {
      type: Function
    },
    tablePagination: {
      type: Object as PropType<Pagination>,
      required: true
    },
    onPaginationChange: {
      type: Function
    }
  },
  components: {
    OioSpin,
    ASelect,
    OioInput,
    OioTable,
    OioColumn,
    OioIcon,
    OioModal,
    OioPagination
  },
  setup(props) {
    const selectSetup = relationSelectSetup(props);
    const optionList = ref<Entity[]>([]);
    const oioTableRef = ref<OioTableInstance>();
    const showModal = ref(false);
    const tableActiveRecords = ref<Entity[] | Entity | null>([]);

    const currentValue = computed(() => {
      /**
       * 多选
       */
      if (props.selectMode === SelectMode.multiple) {
        return selectSetup.currentValue;
      }

      // 单选
      if (props.value && props.value[props.relationFieldKey]) {
        return { value: props.value[props.relationFieldKey] };
      }

      return null;
    });

    const checkbox = computed(() => {
      return !!props.field?.multi;
    });

    const title = computed(() => {
      return props.field?.displayName || props.field?.label;
    })

    const onShowModal = () => {
      showModal.value = true;
      onTableChecked();
    };

    const onModalCancel = () => {
      if (!optionList.value.length) {
        props.search('');
      }
      tableActiveRecords.value = deepClone(props.value);
    };

    const onModalEnter = () => {
      if (!optionList.value.length) {
        props.search('');
      }

      selectSetup.innerChange(deepClone(tableActiveRecords.value));
    };

    const onSelectChange = (val) => {
      if (!val || (Array.isArray(val) && val.length === 0)) {
        tableActiveRecords.value = null;
      } else {
        if (Array.isArray(val)) {
          tableActiveRecords.value = (tableActiveRecords.value as Entity[]).filter((v) => {
            return val.some((v2) => v2.value === v[props.relationFieldKey]);
          });
        }
      }

      selectSetup.innerChange(deepClone(tableActiveRecords.value));
    };

    /**
     * 获取表格数据源
     */
    const getOptionList = (dataList: Entity[]) => {
      optionList.value = dataList.map((v, index) => ({
        ...props.options?.[index],
        ...v,
        value: v[props.relationFieldKey]
      }));
    };

    /**
     * 表格选中回填
     */
    const onTableChecked = async () => {
      await nextTick();
      const tableData = oioTableRef.value?.getOrigin().data || [];
      if (props.field?.multi) {
        const rows = tableData.filter((v) =>
          (tableActiveRecords.value as any)?.find((v2) => v2[props.relationFieldKey] === v[props.relationFieldKey])
        );
        await oioTableRef.value?.getOrigin().clearCheckboxRow();
        oioTableRef.value?.getOrigin().setCheckboxRow(rows, true);
      } else {
        const row = tableData.find(
          (d) => d[props.relationFieldKey] === (tableActiveRecords.value as Entity)?.[props.relationFieldKey]
        );
        row && oioTableRef.value?.getOrigin().setRadioRow(row);
      }
    };

    /**
     * 表格单选框切换
     */
    const onRadioChange = ({ newValue, oldValue, origin: { row } }) => {
      (tableActiveRecords.value as Entity) = row;
    };

    /**
     * 表格多选框切换
     */
    const onCheckedChange = ({ checked, origin: { row } }) => {
      if (checked) {
        (tableActiveRecords.value as Entity[]).push(row);
      } else {
        const index = (tableActiveRecords.value as Entity[]).findIndex(
          (d) => d[props.relationFieldKey] === row[props.relationFieldKey]
        );

        if (index > -1) {
          (tableActiveRecords.value as Entity[]).splice(index, 1);
        }
      }
    };

    /**
     * 表格全选切换
     */
    const onCheckedAllChange = (event: CheckedChangeEvent) => {
      let records = [] as any[];
      // 全选的时候，需要将选中的数据跟原先的数据合并去重
      if (event.checked) {
        records = oioTableRef.value?.getOrigin().getCheckboxRecords() || [];
        tableActiveRecords.value = uniqBy(
          [...((tableActiveRecords.value as any) || []), ...records],
          props.relationFieldKey
        );
      } else {
        // 反选的时候，需要将原先存在的数据过滤
        const tableData = oioTableRef.value?.getOrigin().getData() || [];
        tableActiveRecords.value = (tableActiveRecords.value as Entity[]).filter((item) => {
          return !tableData.find((d) => d[props.relationFieldKey] === item[props.relationFieldKey]);
        });
      }
    };

    watch(
      () => props.options,
      () => {
        if (props.options && props.options.length) {
          getOptionList(props.getDataList?.() || []);
        } else {
          optionList.value = [];
        }

        onTableChecked();
      },
      { immediate: true }
    );

    watch(
      () => props.value,
      () => {
        if (!props.isInitOptions && props.value) {
          const value = props.field?.multi ? props.value : [props.value];
          tableActiveRecords.value = deepClone(props.value);
          getOptionList(props.generatorSelectOption?.(value) || []);
          onTableChecked();
        }
      },
      { immediate: true }
    );

    return {
      ...selectSetup,
      tableActiveRecords,
      checkbox,
      title,
      showModal,
      currentValue,
      optionList,
      oioTableRef,
      onCheckedAllChange,
      onShowModal,
      onModalEnter,
      onModalCancel,
      onSelectChange,
      onCheckedChange,
      onRadioChange
    };
  }
});
</script>
<style lang="scss">
.oio-select-modal-dropdown {
  .oio-input {
    margin-bottom: var(--oio-margin-md);
  }

  .oio-pagination {
    margin-top: var(--oio-margin-md);
  }

  .vxe-header--column.col--checkbox {
    .vxe-cell {
      text-align: center;
    }
  }
}
</style>
