<template>
  <DefaultSelect v-bind="selectProps">
    <template #dropdownContentRender>
      <oio-table v-if="state.dropdownVisible" v-bind="tableProps">
        <oio-column v-if="checkbox" type="checkbox" width="50" />
        <oio-column v-else type="radio" width="50" />
        <oio-column v-for="column in tableSelectColumns" :key="column.key" v-bind="column" />
      </oio-table>
    </template>
  </DefaultSelect>
</template>
<script lang="ts">
import { ActiveRecordExtendKeys } from '@oinone/kunlun-engine';
import { CheckedChangeEvent, OioColumn, OioTable, RadioChangeEvent } from '@oinone/kunlun-vue-ui';
import { PropRecordHelper, SelectMode, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { computed, defineComponent, nextTick, reactive } from 'vue';
import { DefaultSelect, DefaultSelectProps } from '../base';
import { DefaultTableSelectProps } from './props';

interface State {
  dropdownVisible: boolean;
}

export default defineComponent({
  components: {
    DefaultSelect,
    OioTable,
    OioColumn
  },
  inheritAttrs: false,
  props: {
    ...DefaultTableSelectProps
  },
  setup(props, { attrs }) {
    const state: State = reactive({
      dropdownVisible: false
    });

    const tableData = computed(() => props.options?.map((v) => v.data) || []);

    const checkRowKey = computed(() => {
      if (props.selected == null) {
        return null;
      }
      if (checkbox.value) {
        let keys: string[];
        if (Array.isArray(props.selected)) {
          keys = props.selected.map((v) => v.data[ActiveRecordExtendKeys.DRAFT_ID]);
        } else {
          keys = [props.selected.data[ActiveRecordExtendKeys.DRAFT_ID]];
        }
        return keys;
      }
      if (Array.isArray(props.selected)) {
        return props.selected[0]?.data[ActiveRecordExtendKeys.DRAFT_ID];
      }
      return props.selected.data[ActiveRecordExtendKeys.DRAFT_ID];
    });

    const checkbox = computed(() => {
      return props.mode === SelectMode.multiple;
    });

    const selectProps = computed(() => {
      return {
        ...PropRecordHelper.convert(DefaultSelectProps, props),
        ...PropRecordHelper.collectionBasicProps(attrs, ['oio-table-select']),
        dropdownClassName: StringHelper.append(
          ['oio-table-select-dropdown vxe-table--ignore-clear'],
          props.dropdownClassName
        ),
        loadMoreLoading: null,
        onUpdateDropdownVisible: (val: boolean) => {
          if (val) {
            state.dropdownVisible = true;
          } else {
            setTimeout(() => {
              state.dropdownVisible = false;
            }, 500);
          }
        }
      };
    });

    const tableProps = computed(() => {
      const value: Record<string, unknown> = {
        class: 'oio-table-select-table',
        size: 'small',
        showOverflow: true,
        autoResize: true,
        stripe: true,
        border: true,
        height: props.tableHeight || '300px',
        data: tableData.value,
        loading: props.loadMoreLoading,
        rowConfig: { isCurrent: false, isHover: true, keyField: ActiveRecordExtendKeys.DRAFT_ID }
      };
      if (checkbox.value) {
        value.checkboxConfig = { highlight: true, checkRowKeys: checkRowKey.value };
        value.onCheckedChange = onCheckedChange;
        value.onCheckedAllChange = onCheckedAllChange;
      } else {
        value.radioConfig = { highlight: true, checkRowKey: checkRowKey.value };
        value.onRadioChange = onRadioChange;
      }
      value.onScroll = onScroll;
      return value;
    });

    const onCheckedChange = (event: CheckedChangeEvent) => {
      const { records } = event;
      if (records.length) {
        props.change?.(records);
      } else {
        props.change?.(null);
      }
    };

    const onCheckedAllChange = (event: CheckedChangeEvent) => {
      const { checked, records } = event;
      if (checked) {
        props.change?.(records);
      } else {
        props.change?.(null);
      }
    };

    const onRadioChange = (event: RadioChangeEvent) => {
      const { newRecord } = event;
      props.change?.(newRecord);
    };

    const onScroll = (e: { scrollHeight: number; scrollTop: number; bodyHeight: number }) => {
      const { scrollHeight, scrollTop, bodyHeight } = e;
      if (scrollHeight - scrollTop - 1 <= bodyHeight) {
        if (props.loadCompleted) {
          return;
        }
        nextTick(() => props.loadMore?.());
      }
    };

    return {
      state,
      checkbox,
      selectProps,
      tableProps
    };
  }
});
</script>
