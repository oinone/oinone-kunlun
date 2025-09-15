<script lang="ts">
import { PamirsEmployee } from '@oinone/kunlun-engine';
import {
  CastHelper,
  OioDivider,
  OioInput,
  OioInputSearch,
  OioListItem,
  OioModal,
  OioModalProps,
  OioTab,
  OioTabs,
  PropRecordHelper,
  RSQLCondition,
  SelectItem,
  SelectMode
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, nextTick, PropType, reactive, ref, Ref, watch } from 'vue';
import { BaseSelect } from '../base';
import { DepartmentTree } from '../department-select';
import EmployeeList from './EmployeeList.vue';
import { EmployeeListInstance } from './init';

interface State {
  storage: Record<string, OioListItem<PamirsEmployee>>;
  loading: boolean;
  filterStorage?: Record<string, OioListItem<PamirsEmployee>>;
}

export default defineComponent({
  name: 'DepartmentModal',
  components: {
    OioInput,
    OioModal,
    OioTab,
    OioTabs,
    DepartmentTree
  },
  props: {
    ...OioModalProps,
    mode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>
    },
    selected: {
      type: [Object, Array] as PropType<SelectItem<PamirsEmployee> | SelectItem<PamirsEmployee>[]>
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const employeeListRef: Ref<EmployeeListInstance | undefined> = ref();

    const state: State = reactive({
      storage: {},
      loading: false
    });

    const checkedKeys: Ref<string[]> = ref([]);

    const onUpdateCheckedKeys = (keys: string[]) => {
      if (state.filterStorage) {
        const clone = { ...state.filterStorage };
        for (const key of keys) {
          if (checkedKeys.value.indexOf(key) <= -1) {
            checkedKeys.value.push(key);
          }
          delete clone[key];
        }
        for (const key of Object.keys(clone)) {
          const index = checkedKeys.value.indexOf(key);
          if (index > -1) {
            checkedKeys.value.splice(index, 1);
          }
        }
      } else {
        checkedKeys.value = keys;
      }
    };

    const selectedValues = computed(() => {
      const selectedItems: SelectItem<PamirsEmployee>[] = [];
      for (const checkedKey of checkedKeys.value) {
        const node = state.storage[checkedKey];
        const { key, value, label, data } = node;
        selectedItems.push({
          key,
          value,
          label,
          data
        });
      }
      return selectedItems;
    });

    const searchValue = ref('');

    const onUpdateSearchValue = (val: string) => {
      searchValue.value = val;
    };

    const onSearch = (keyword: string) => {
      console.log(keyword);
    };

    const activeTabKey = ref('1');

    const onUpdateActiveTabKey = (key: string) => {
      activeTabKey.value = key;
    };

    const enterCallback = () => {
      if (props.mode === SelectMode.single) {
        emit('change', selectedValues.value[0]?.data);
      } else {
        emit(
          'change',
          selectedValues.value.map((v) => v.data)
        );
      }
      return true;
    };

    const onDepartmentSelected = async ({ selectedKeys }: { selectedKeys: string[] }) => {
      if (selectedKeys.length) {
        const rsql = RSQLCondition.wrapper().in('departmentCode', selectedKeys).toString();
        const res = await reload(rsql);
        state.filterStorage = res.storage;
      } else {
        await reload();
        state.filterStorage = undefined;
      }
    };

    const reload = async (rsql?: string) => {
      state.loading = true;
      try {
        return await employeeListRef.value!.init({
          rsql,
          checkedKeys: checkedKeys.value
        });
      } finally {
        state.loading = false;
      }
    };

    const init = async () => {
      state.loading = true;
      try {
        await $$init();
      } finally {
        state.loading = false;
      }
    };

    const $$init = async () => {
      const result = await employeeListRef.value!.init({
        checkedKeys: $$initCheckedKeys()
      });
      checkedKeys.value = result.checkedKeys;
      state.storage = result.storage;
    };

    const $$initCheckedKeys = () => {
      let checkedKeys: string[] = [];
      if (props.selected != null) {
        if (Array.isArray(props.selected)) {
          checkedKeys = props.selected.map((v) => v.key);
        } else {
          checkedKeys = [props.selected.key];
        }
      }
      return checkedKeys;
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          nextTick().then(() => {
            init();
          });
        }
      },
      { immediate: true }
    );

    return {
      employeeListRef,

      state,
      checkedKeys,
      selectedValues,

      searchValue,
      onUpdateSearchValue,
      onSearch,

      activeTabKey,
      onUpdateActiveTabKey,

      onUpdateCheckedKeys,
      enterCallback,

      onDepartmentSelected
    };
  },
  render() {
    const {
      mode,
      state,
      checkedKeys,
      selectedValues,

      searchValue,
      onUpdateSearchValue,
      onSearch,
      activeTabKey,
      onUpdateActiveTabKey,
      onUpdateCheckedKeys,
      enterCallback,

      onDepartmentSelected
    } = this;
    return createVNode(
      OioModal,
      {
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        destroyOnClose: true,
        loading: state.loading,
        enterCallback
      },
      {
        default: () => {
          return [
            createVNode('div', { class: 'oio-employee-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                placeholder: '选择员工',
                notFoundContent: null,
                allowArrow: false
              }),
              createVNode(OioInputSearch, {
                value: searchValue,
                placeholder: '搜索',
                allowClear: true,
                'onUpdate:value': onUpdateSearchValue,
                onSearch
              }),
              createVNode(
                OioTabs,
                {
                  activeKey: activeTabKey,
                  'onUpdate:active-key': onUpdateActiveTabKey
                },
                {
                  default: () => {
                    return [
                      createVNode(
                        OioTab,
                        {
                          key: '1',
                          tab: '所有员工'
                        },
                        {
                          default: () => {
                            return [
                              createVNode('div', { class: 'oio-employee-selected-panel' }, [
                                createVNode(DepartmentTree, {
                                  autoInit: true,
                                  selectable: true,
                                  onSelected: onDepartmentSelected
                                }),
                                createVNode(OioDivider, { type: 'vertical' }),
                                createVNode(EmployeeList, {
                                  ref: 'employeeListRef',
                                  searchValue,
                                  selectMode: mode,
                                  checkedKeys,
                                  'onUpdate:checkedKeys': onUpdateCheckedKeys
                                })
                              ])
                            ];
                          }
                        }
                      ),
                      createVNode(
                        OioTab,
                        {
                          key: '2',
                          tab: '当前用户所在部门'
                        },
                        {
                          default: () => {
                            return [createVNode('span', {}, 'ss')];
                          }
                        }
                      )
                    ];
                  }
                }
              )
            ])
          ];
        }
      }
    );
  }
});
</script>
<style lang="scss">
.oio-employee-modal-content {
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  .oio-employee-selected-panel {
    position: relative;
    display: flex;
    height: 400px;

    .oio-department-tree {
      width: 50%;
      flex-basis: 50%;
      padding-right: 8px;
      overflow: auto;
    }

    .oio-divider {
      position: absolute;
      height: 100%;
      left: 50%;
    }

    .oio-employee-list {
      width: 50%;
      flex-basis: 50%;
      padding-left: 8px;
      overflow: auto;
    }
  }
}
</style>
