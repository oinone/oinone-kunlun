<script lang="ts">
import type { AuthRole, PamirsEmployee } from '@oinone/kunlun-engine';
import { OioList, OioListItem, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, onMounted, type PropType } from 'vue';
import type { ListStateLoadFunction } from '../../quick-utils';
import { useRoleList } from './init';

export default defineComponent({
  name: 'RoleList',
  components: {},
  props: {
    searchValue: {
      type: String
    },
    selectMode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>
    },
    showCheckedAll: {
      type: Boolean
    },
    loading: {
      type: Boolean
    },
    usingLoading: {
      type: Boolean
    },
    autoInit: {
      type: Boolean
    },
    load: {
      type: Function as PropType<ListStateLoadFunction<PamirsEmployee>>
    },
    domain: {
      type: String
    },
    initCheckedKeys: {
      type: Array as PropType<string[]>
    },
    checkedKeys: {
      type: Array as PropType<string[]>
    },
    selectable: {
      type: Boolean
    },
    selectedKeys: {
      type: Array as PropType<string[]>
    }
  },
  emits: ['update:loading', 'update:checkedKeys', 'update:selectedKeys', 'init', 'change'],
  setup(props, { emit, expose }) {
    const { state, filterData, checkedAll, halfCheckedAll, init, search, onChecked, onCheckedAll } = useRoleList({
      mode: props.selectMode,
      getCheckedKeys: () => props.checkedKeys,
      getSearchValue: () => props.searchValue,
      load: props.load
    });

    const loading = computed({
      get: () => {
        if (props.loading == null) {
          return state.loading;
        }
        return props.loading;
      },
      set: (value) => {
        emit('update:loading', value);
        state.loading = value;
      }
    });

    const onUpdateCheckedAll = (checked: boolean) => {
      onCheckedAll(filterData.value, checked);
      updateListData();
    };

    const onUpdateChecked = (node: OioListItem<AuthRole>, checked: boolean) => {
      onChecked(node, checked);
      updateListData();
    };

    const updateListData = () => {
      state.data = [...state.data];
      const checkedKeys = state.submitCheckedKeys || state.checkedKeys;
      const items = state.submitCheckedItems || state.checkedItems;
      emit('update:checkedKeys', checkedKeys);
      emit('change', {
        items,
        checkedKeys
      });
    };

    if (props.autoInit) {
      onMounted(async () => {
        loading.value = true;
        try {
          const res = await init({
            rsql: props.domain,
            checkedKeys: props.initCheckedKeys || props.checkedKeys
          });
          emit('init', res);
        } finally {
          loading.value = false;
        }
      });
    }

    expose({
      state,
      filterData,
      checkedAll,
      halfCheckedAll,
      init,
      search
    });

    return {
      state,
      filterData,
      checkedAll,
      halfCheckedAll,
      onUpdateCheckedAll,
      onUpdateChecked
    };
  },
  render() {
    const {
      selectMode,
      showCheckedAll,
      loading,
      usingLoading,
      checkedKeys,
      filterData,
      checkedAll,
      halfCheckedAll,
      selectable,
      selectedKeys,
      onUpdateChecked,
      onUpdateCheckedAll
    } = this;
    return createVNode(OioList, {
      class: 'oio-role-list oio-scrollbar',
      mode: selectMode,
      list: filterData,
      showIcon: true,

      checkedKeys,
      showCheckedAll,
      checkedAll,
      halfCheckedAll,
      onChecked: onUpdateChecked,
      'onUpdate:checkedAll': onUpdateCheckedAll,

      selectable,
      selectedKeys,
      'onUpdate:selectedKeys': (val) => this.$emit('update:selectedKeys', val)
    });
  }
});
</script>
