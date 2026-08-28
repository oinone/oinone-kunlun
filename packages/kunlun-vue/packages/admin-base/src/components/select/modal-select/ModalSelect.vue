<template>
  <div class="oio-modal-select-wrapper">
    <DefaultSelect v-bind="selectProps" />
    <oio-modal v-bind="modalProps">
      <oio-input-search
        :value="searchValue"
        :placeholder="$translate('搜索')"
        allow-clear
        @update:value="onUpdateSearchValue"
      />
      <oio-table v-bind="tableProps">
        <oio-column v-if="checkbox" type="checkbox" width="50" />
        <oio-column v-else type="radio" width="50" />
        <oio-column v-for="column in tableSelectColumns" :key="column.key" v-bind="column" />
      </oio-table>
    </oio-modal>
  </div>
</template>
<script lang="ts">
import { ActiveRecordExtendKeys, ActiveRecords } from '@oinone/kunlun-engine';
import { CheckedChangeEvent, OioColumn, OioTable, RadioChangeEvent } from '@oinone/kunlun-vue-ui';
import { OioInputSearch, OioModal, PropRecordHelper, SelectMode, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { debounce } from 'lodash-es';
import { computed, defineComponent, nextTick, reactive, ref, Ref } from 'vue';
import { DefaultSelect, DefaultSelectProps } from '../base';
import { DefaultTableSelectProps } from '../table-select';

interface State {
  visible: boolean;
  records?: ActiveRecords | null;
}

export default defineComponent({
  components: {
    DefaultSelect,
    OioModal,
    OioTable,
    OioColumn,
    OioInputSearch
  },
  inheritAttrs: false,
  props: {
    ...DefaultTableSelectProps,
    title: {
      type: String
    }
  },
  setup(props, { attrs, emit }) {
    const state: State = reactive({
      visible: false
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
        ...PropRecordHelper.collectionBasicProps(attrs, ['oio-modal-select']),
        mode: props.mode,
        selected: props.selected,
        initSelectedOptions: props.options,
        options: null,
        allowArrow: false,
        allowSearch: false,
        notFoundContent: null,
        loadMoreLoading: null,
        onClick: () => {
          searchValue.value = undefined;
          state.records = null;
          state.visible = true;
        }
      };
    });

    const modalProps = computed(() => {
      return {
        class: 'oio-modal-select-modal',
        wrapperClassName: StringHelper.append(['oio-modal-select-modal-wrapper vxe-table--ignore-clear']),
        width: '720px',
        title: props.title,
        maskClosable: false,
        destroyOnClose: true,
        visible: state.visible,
        'onUpdate:visible': (val: boolean) => (state.visible = val),
        onEnter: () => {
          props.change?.(state.records);
        }
      };
    });

    const tableProps = computed(() => {
      const value: Record<string, unknown> = {
        class: 'oio-modal-select-table',
        size: 'small',
        showOverflow: true,
        autoResize: true,
        stripe: true,
        border: true,
        height: props.tableHeight || '300px',
        data: tableData.value,
        loading: props.loadMoreLoading,
        rowConfig: { isCurrent: false, isHover: true, keyField: ActiveRecordExtendKeys.DRAFT_ID },
        onScroll
      };
      if (checkbox.value) {
        value.checkboxConfig = { highlight: true, checkRowKeys: checkRowKey.value };
        value.onCheckedChange = onCheckedChange;
        value.onCheckedAllChange = onCheckedAllChange;
      } else {
        value.radioConfig = { highlight: true, checkRowKey: checkRowKey.value };
        value.onRadioChange = onRadioChange;
      }
      return value;
    });

    const onCheckedChange = (event: CheckedChangeEvent) => {
      const { records } = event;
      if (records.length) {
        state.records = records;
      } else {
        state.records = null;
      }
    };

    const onCheckedAllChange = (event: CheckedChangeEvent) => {
      const { checked, records } = event;
      if (checked) {
        state.records = records;
      } else {
        state.records = null;
      }
    };

    const onRadioChange = (event: RadioChangeEvent) => {
      const { newRecord } = event;
      state.records = newRecord;
    };

    /**
     * 当 vxe-table 加载数据数量过多，scrollHeight 达到一定高度时，会出现 bodyHeight === scrollHeight 参数异常的问题
     * 此参数用于保留第一次滚动的有效值
     */
    let bodyHeight: number | undefined;

    const onScroll = (e: { scrollHeight: number; scrollTop: number; bodyHeight: number }) => {
      const { scrollHeight, scrollTop } = e;
      if (bodyHeight == null) {
        bodyHeight = e.bodyHeight;
      }
      if (scrollHeight - scrollTop - 1 <= bodyHeight) {
        if (props.loadCompleted) {
          return;
        }
        nextTick(() => props.loadMore?.());
      }
    };

    const $$searchValue: Ref<string | undefined> = ref();
    const searchValue = computed<string | undefined>({
      get() {
        if (props.searchValue === undefined) {
          return $$searchValue.value;
        }
        return props.searchValue;
      },
      set(val) {
        $$searchValue.value = val;
        emit('update:search-value', val);
        props.onUpdateSearchValue?.(val);
      }
    });

    const onUpdateSearchValue = (keyword: string) => {
      searchValue.value = keyword;
      onSearch(keyword);
    };

    const onSearch = debounce(async (keyword: string) => {
      await props.search?.(keyword);
    }, 300);

    return {
      state,
      selectProps,
      modalProps,
      tableProps,
      checkbox,
      onUpdateSearchValue
    };
  }
});
</script>
