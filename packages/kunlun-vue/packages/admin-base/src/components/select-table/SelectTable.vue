<template>
  <a-select
    ref="selectRef"
    class="oio-select"
    option-label-prop="label"
    :mode="selectMode"
    :value="currentValue"
    :max-tag-count="maxTagCount"
    :allowClear="allowClear"
    :disabled="innerDisabled"
    :filter-option="false"
    :default-active-first-option="false"
    :options="optionList"
    :placeholder="placeholder"
    :get-popup-container="getTriggerContainer"
    :dropdownClassName="dropdownTableClassName"
    :open="dropdownOpen"
    @change="innerChange"
    @blur="blur"
    @focus="focus"
    @dropdownVisibleChange="dropdownVisibleChange"
  >
    <template #dropdownRender="{ menuNode: menu }">
      <!-- 隐藏默认的option选项，否则表格数据选中后，无法回填 -->
      <div v-show="false">
        <v-nodes :vnodes="menu" />
      </div>
      <div class="select-table-dropdown">
        <oio-input ref="dropdownInputRef" :placeholder="placeholder" :value="searchValue" @change="search">
          <template #prefix>
            <oio-icon icon="oinone-sousuo2" size="16"></oio-icon>
          </template>
        </oio-input>
        <div class="select-table-dropdown-body">
          <oio-table
            ref="oioTableRef"
            size="small"
            show-overflow
            auto-resize
            stripe
            border
            :height="tableHeight"
            :data="optionList"
            :row-config="{ isCurrent: false, isHover: true }"
            :checkbox-config="{ highlight: true }"
            :radio-config="{ highlight: true }"
            @scroll="onTableScroll"
            @cell-click="onCellClick"
            @checked-all-change="onCheckedAllChange"
          >
            <oio-column type="checkbox" width="50" v-if="field?.multi"></oio-column>
            <oio-column type="radio" width="50" v-else></oio-column>
            <oio-column v-for="field in optionFieldList" :field="field.name" :label="field.label"></oio-column>
          </oio-table>
        </div>
      </div>
      <div class="form-relation-select-dropdown-spin">
        <oio-spin v-if="loadMoreLoading" size="small" loading />
      </div>
    </template>
    <template #notFoundContent>
      <oio-empty-data v-if="!loadMoreLoading" />
    </template>
  </a-select>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeMount, onBeforeUnmount, Prop, PropType, ref, watch } from 'vue';
import { Select as ASelect } from 'ant-design-vue';
import { delay } from 'lodash-es';
import { OioSpin, OioEmptyData, OioInput, OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { OioTable, OioColumn, OioTableInstance, CheckedChangeEvent } from '@oinone/kunlun-vue-ui';
import { RuntimeModelField } from '@oinone/kunlun-engine';
import { Entity } from '@oinone/kunlun-meta';
import { RelationSelectProps, relationSelectSetup } from '../../field/prop';
import { useInjectOioDefaultFormContext } from '../../basic';
import { SelectTableMode } from '../../typing';

export default defineComponent({
  inheritAttrs: false,
  props: {
    ...RelationSelectProps,
    value: {
      type: [Array, Object]
    },
    generatorSelectOption: Function,
    optionFieldList: {
      type: Array as PropType<RuntimeModelField[]>,
      default: () => []
    },
    field: {
      type: Object as PropType<RuntimeModelField>
    },
    tableHeight: {
      type: [String, Number],
      default: 300
    },
    selectMode: {
      type: String
    },
    getDataList: {
      type: Function
    }
  },
  components: {
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    },
    OioSpin,
    OioEmptyData,
    ASelect,
    OioInput,
    OioTable,
    OioColumn,
    OioIcon
  },
  setup(props) {
    const selectSetup = relationSelectSetup(props);
    const optionList = ref<Record<string, unknown>[]>([]);
    const oioTableRef = ref<OioTableInstance>();

    const currentValue = computed(() => {
      /**
       * 下拉多选
       */
      if (props.selectMode === 'multiple') {
        return selectSetup.currentValue;
      }

      // 单选
      if (props.value && props.value[props.relationFieldKey]) {
        return { value: props.value[props.relationFieldKey] };
      }

      return null;
    });

    const dropdownTableClassName = computed(() => {
      return `${props.dropdownClassName} oio-select-table-dropdown`;
    });

    /**
     * 获取表格数据源
     */
    const getOptionList = (dataList: Record<string, unknown>[]) => {
      optionList.value = dataList.map((v, index) => ({
        ...props.options?.[index],
        ...v,
        value: v[props.relationFieldKey]
      }));
    };

    /**
     * 表格滚动底部加载更多
     */
    const onTableScroll = ({ scrollHeight, scrollTop, bodyHeight }) => {
      selectSetup.slipSelect({
        target: {
          scrollHeight,
          scrollTop,
          clientHeight: bodyHeight
        }
      });
    };

    /**
     * 表格选中
     */
    const onTableChecked = async () => {
      await nextTick();
      const tableData = oioTableRef.value?.getOrigin().data || [];
      if (props.field?.multi) {
        const rows = tableData.filter((v) =>
          props.value?.find((v2) => v2[props.relationFieldKey] === v[props.relationFieldKey])
        );
        oioTableRef.value?.getOrigin().setCheckboxRow(rows, true);
      } else {
        const row = tableData.find(
          (d) => d[props.relationFieldKey] === (props.value as Entity)[props.relationFieldKey]
        );
        row && oioTableRef.value?.getOrigin().setRadioRow(row);
      }
    };

    const dropdownVisibleChange = (val) => {
      selectSetup.dropdownVisibleChange(val);

      /**
       * 下拉展开时，回填表格选中
       */
      if (val) {
        delay(() => {
          onTableChecked();
        }, 200);
      }
    };

    /**
     * 单元格点击选中当前行
     */
    const onCellClick = ({ row, triggerCheckbox, triggerRadio }) => {
      if (props.selectMode !== SelectTableMode.Multiple) {
        selectSetup.dropdownOpen.value = false;
      }

      const records = oioTableRef.value?.getOrigin().getCheckboxRecords() || [];

      const value = props.field?.multi ? records : row;
      selectSetup.innerChange(value);

      onTableChecked();
    };

    /**
     * 表格全选切换
     */
    const onCheckedAllChange = (event: CheckedChangeEvent) => {
      let records = [] as any[];
      if (event.checked) {
        records = oioTableRef.value?.getOrigin().getCheckboxRecords() || [];
      }

      selectSetup.innerChange(records);
      onTableChecked();
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
          getOptionList(props.generatorSelectOption?.(value) || []);
        }
      },
      { immediate: true }
    );

    const formContext = useInjectOioDefaultFormContext();

    return {
      ...selectSetup,
      dropdownTableClassName,
      currentValue,
      optionList,
      oioTableRef,
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer,
      onTableScroll,
      onCellClick,
      dropdownVisibleChange,
      onCheckedAllChange
    };
  }
});
</script>
<style lang="scss">
.oio-select-table-dropdown {
  .vxe-header--column.col--checkbox {
    .vxe-cell {
      text-align: center;
    }
  }

  .select-table-dropdown-body {
    border-top: 1px solid var(--oio-border-color);
    padding: var(--oio-padding-sm);
  }
  .oio-table .vxe-table--render-default.size--mini .vxe-body--column.col--ellipsis,
  .oio-table .vxe-table--render-default.vxe-editable.size--mini .vxe-body--column {
    height: var(--oio-height);
  }
  .vxe-table--render-default.size--mini .vxe-header--column:not(.col--ellipsis) {
    padding: 5px 0;
  }
}
</style>
