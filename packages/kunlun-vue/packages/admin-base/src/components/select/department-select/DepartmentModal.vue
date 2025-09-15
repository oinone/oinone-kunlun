<script lang="ts">
import { PamirsDepartment, translateValueByKey } from '@oinone/kunlun-engine';
import {
  CastHelper,
  OioInput,
  OioInputSearch,
  OioModal,
  OioModalProps,
  OioTab,
  OioTabs,
  OioTreeNode,
  PropRecordHelper,
  SelectItem,
  SelectMode
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, nextTick, PropType, reactive, ref, Ref, watch } from 'vue';
import { BaseSelect } from '../base';
import DepartmentTree from './DepartmentTree.vue';
import { DepartmentTreeInstance } from './init';

interface State {
  storage: Record<string, OioTreeNode<PamirsDepartment>>;
  loading: boolean;
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
      type: [Object, Array] as PropType<SelectItem<PamirsDepartment> | SelectItem<PamirsDepartment>[]>
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const departmentTreeRef: Ref<DepartmentTreeInstance | undefined> = ref();

    const state: State = reactive({
      storage: {},
      loading: false
    });

    const checkedKeys: Ref<string[]> = ref([]);

    const onUpdateCheckedKeys = (keys: string[]) => {
      checkedKeys.value = keys;
    };

    const selectedValues = computed(() => {
      const selectedItems: SelectItem<PamirsDepartment>[] = [];
      if (props.mode === SelectMode.single) {
        const checkedKey = checkedKeys.value[0];
        const node = state.storage[checkedKey];
        if (!node) {
          return selectedItems;
        }
        const { key, title, value } = node;
        selectedItems.push({
          key,
          value: key,
          label: title || '-',
          data: value
        });
        return selectedItems;
      }
      for (const checkedKey of checkedKeys.value) {
        const node = state.storage[checkedKey];
        if (!node || !node.isLeaf) {
          continue;
        }
        const { key, title, value } = node;
        selectedItems.push({
          key,
          value: key,
          label: title || '-',
          data: value
        });
      }
      return selectedItems;
    });

    const searchValue = ref('');

    const onUpdateSearchValue = (val: string) => {
      searchValue.value = val;
    };

    const onSearch = (keyword: string) => {
      searchValue.value = keyword;
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

    const tree2 = ref([]);

    const filterTree2 = computed(() => {
      if (searchValue.value) {
        console.log(1);
      }
      return tree2.value;
    });

    const init = async () => {
      state.loading = true;
      try {
        await $$init();
      } finally {
        state.loading = false;
      }
    };

    const $$init = async () => {
      const result = await departmentTreeRef.value!.init({
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
      departmentTreeRef,

      state,
      selectedValues,

      searchValue,
      onUpdateSearchValue,
      onSearch,

      activeTabKey,
      onUpdateActiveTabKey,

      tree2,
      filterTree2,

      onUpdateCheckedKeys,
      enterCallback
    };
  },
  render() {
    const {
      mode,
      state,
      selectedValues,
      searchValue,
      onUpdateSearchValue,
      onSearch,
      activeTabKey,
      onUpdateActiveTabKey,
      onUpdateCheckedKeys,
      enterCallback
    } = this;
    return createVNode(
      OioModal,
      {
        title: translateValueByKey('选择部门'),
        width: '720px',
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        destroyOnClose: true,
        loading: state.loading,
        enterCallback
      },
      {
        default: () => {
          return [
            createVNode('div', { class: 'oio-department-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                options: selectedValues,
                placeholder: '选择部门',
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
                          tab: '所有部门'
                        },
                        {
                          default: () => {
                            return createVNode(DepartmentTree, {
                              ref: 'departmentTreeRef',
                              searchValue,
                              selectMode: mode,
                              showCheckedAll: true,
                              'onUpdate:checkedKeys': onUpdateCheckedKeys
                            });
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
.oio-department-modal-content {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
}
</style>
