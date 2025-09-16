<script lang="ts">
import { PamirsEmployee } from '@oinone/kunlun-engine';
import { OioList, OioListItem, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { createVNode, defineComponent, onMounted, PropType } from 'vue';
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
    autoInit: {
      type: Boolean
    },
    domain: {
      type: String
    },
    checkedKeys: {
      type: Array as PropType<string[]>
    }
  },
  emits: ['update:checkedKeys', 'change'],
  setup(props, { emit, expose }) {
    const { state, filterData, checkedAll, halfCheckedAll, init, onChecked, onCheckedAll } = useEmployeeList({
      mode: props.selectMode,
      getSearchValue: () => props.searchValue
    });

    const onUpdateCheckedAll = (checked: boolean) => {
      onCheckedAll(filterData.value, checked);
      updateListData();
    };

    const onUpdateChecked = (node: OioListItem<PamirsEmployee>, checked: boolean) => {
      onChecked(node, checked);
      updateListData();
    };

    const updateListData = () => {
      state.data = [...state.data];
      emit('update:checkedKeys', state.checkedKeys);
      emit('change', {
        items: state.data,
        checkedKeys: state.checkedKeys
      });
    };

    if (props.autoInit) {
      onMounted(() => {
        init({
          rsql: props.domain,
          checkedKeys: props.checkedKeys
        });
      });
    }

    expose({
      state,
      filterData,
      checkedAll,
      halfCheckedAll,
      init
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
    const { selectMode, checkedKeys, filterData, checkedAll, halfCheckedAll, onUpdateChecked, onUpdateCheckedAll } =
      this;
    return createVNode(OioList, {
      class: 'oio-employee-list oio-scrollbar',
      mode: selectMode,
      list: filterData,
      checkedKeys,
      showIcon: true,
      showCheckedAll: true,
      checkedAll,
      halfCheckedAll,
      onChecked: onUpdateChecked,
      'onUpdate:checkedAll': onUpdateCheckedAll
    });
  }
});
</script>
