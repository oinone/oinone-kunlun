<script lang="ts">
import { AuthRole } from '@oinone/kunlun-engine';
import { OioList, OioListItem, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType } from 'vue';
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
    checkedKeys: {
      type: Array as PropType<string[]>
    }
  },
  emits: ['update:checkedKeys'],
  setup(props, { emit, expose }) {
    const { state, init, onChecked, onCheckedAll, updateCheckedAllState } = useRoleList({
      mode: props.selectMode
    });

    const filterData = computed(() => {
      const searchValue = props.searchValue;
      if (searchValue) {
        const filterList: OioListItem<AuthRole>[] = [];
        for (const item of state.data) {
          if (item.label.indexOf(searchValue) > -1) {
            filterList.push(item);
          }
        }
        return filterList;
      }
      return state.data;
    });

    const onUpdateCheckedAll = (checked: boolean) => {
      onCheckedAll(state.data, checked);
      state.checkedAll = checked;
      state.halfCheckedAll = false;
      updateListData();
    };

    const onUpdateChecked = (node: OioListItem<AuthRole>, checked: boolean) => {
      onChecked(node, checked);
      updateCheckedAllState();
      updateListData();
    };

    const updateListData = () => {
      state.data = [...state.data];
      emit('update:checkedKeys', state.checkedKeys);
    };

    expose({
      init
    });

    return {
      state,
      filterData,
      onUpdateCheckedAll,
      onUpdateChecked
    };
  },
  render() {
    const { selectMode, checkedKeys, state, filterData, onUpdateChecked, onUpdateCheckedAll } = this;
    return createVNode(OioList, {
      class: 'oio-role-list oio-scrollbar',
      mode: selectMode,
      list: filterData,
      checkedKeys,
      showIcon: true,
      showCheckedAll: true,
      checkedAll: state.checkedAll,
      halfCheckedAll: state.halfCheckedAll,
      onChecked: onUpdateChecked,
      'onUpdate:checkedAll': onUpdateCheckedAll
    });
  }
});
</script>
