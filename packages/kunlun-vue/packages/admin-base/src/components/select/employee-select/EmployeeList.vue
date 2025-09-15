<script lang="ts">
import { PamirsDepartment, PamirsEmployee } from '@oinone/kunlun-engine';
import { OioList, OioListItem, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType } from 'vue';
import { useEmployeeList } from './init';

export default defineComponent({
  name: 'EmployeeList',
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
    const { state, init, onChecked, onCheckedAll, updateCheckedAllState } = useEmployeeList({
      mode: props.selectMode
    });

    const filterData = computed(() => {
      const searchValue = props.searchValue;
      if (searchValue) {
        const filterList: OioListItem<PamirsEmployee>[] = [];
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

    const onUpdateChecked = (node: OioListItem<PamirsDepartment>, checked: boolean) => {
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
      class: 'oio-employee-list oio-scrollbar',
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
<style lang="scss"></style>
