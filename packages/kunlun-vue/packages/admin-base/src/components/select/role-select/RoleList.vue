<script lang="ts">
import { AuthRole } from '@oinone/kunlun-engine';
import { OioList, OioListItem, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, onMounted, PropType } from 'vue';
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
    }
  },
  emits: ['update:loading', 'update:checkedKeys', 'init', 'change'],
  setup(props, { emit, expose }) {
    const { state, filterData, checkedAll, halfCheckedAll, init, search, onChecked, onCheckedAll } = useRoleList({
      mode: props.selectMode,
      getCheckedKeys: () => props.checkedKeys,
      getSearchValue: () => props.searchValue
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
      onCheckedAll(state.data, checked);
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
      onUpdateChecked,
      onUpdateCheckedAll
    } = this;
    return createVNode(OioList, {
      class: 'oio-role-list oio-scrollbar',
      mode: selectMode,
      list: filterData,
      checkedKeys,
      showIcon: true,
      showCheckedAll,
      checkedAll,
      halfCheckedAll,
      selectable,
      onChecked: onUpdateChecked,
      'onUpdate:checkedAll': onUpdateCheckedAll
    });
  }
});
</script>
