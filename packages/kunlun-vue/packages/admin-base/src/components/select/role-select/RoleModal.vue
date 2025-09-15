<script lang="ts">
import { AuthRole } from '@oinone/kunlun-engine';
import {
  CastHelper,
  OioInput,
  OioInputSearch,
  OioListItem,
  OioModal,
  OioModalProps,
  OioTab,
  OioTabs,
  PropRecordHelper,
  SelectItem,
  SelectMode
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, nextTick, PropType, reactive, ref, Ref, watch } from 'vue';
import { BaseSelect } from '../base';
import { RoleListInstance } from './init';
import RoleList from './RoleList.vue';

interface State {
  storage: Record<string, OioListItem<AuthRole>>;
  loading: boolean;
}

export default defineComponent({
  name: 'RoleModal',
  components: {
    OioInput,
    OioModal,
    OioTab,
    OioTabs,
    RoleList
  },
  props: {
    ...OioModalProps,
    mode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>
    },
    selected: {
      type: [Object, Array] as PropType<SelectItem<AuthRole> | SelectItem<AuthRole>[]>
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const roleListRef: Ref<RoleListInstance | undefined> = ref();

    const state: State = reactive({
      storage: {},
      loading: false
    });

    const checkedKeys: Ref<string[]> = ref([]);

    const onUpdateCheckedKeys = (keys: string[]) => {
      checkedKeys.value = keys;
    };

    const selectedValues = computed(() => {
      const selectedItems: SelectItem<AuthRole>[] = [];
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

    const init = async () => {
      state.loading = true;
      try {
        await $$init();
      } finally {
        state.loading = false;
      }
    };

    const $$init = async () => {
      const result = await roleListRef.value!.init({
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
      roleListRef,

      state,
      checkedKeys,
      selectedValues,

      searchValue,
      onUpdateSearchValue,
      onSearch,

      activeTabKey,
      onUpdateActiveTabKey,

      onUpdateCheckedKeys,
      enterCallback
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
      enterCallback
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
            createVNode('div', { class: 'oio-role-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                options: selectedValues,
                placeholder: '选择角色',
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
                          tab: '所有角色'
                        },
                        {
                          default: () => {
                            return createVNode('div', { class: 'oio-role-selected-panel' }, [
                              createVNode(RoleList, {
                                ref: 'roleListRef',
                                searchValue,
                                selectMode: mode,
                                checkedKeys,
                                'onUpdate:checkedKeys': onUpdateCheckedKeys
                              })
                            ]);
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
.oio-role-modal-content {
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  .oio-role-selected-panel {
    height: 400px;

    .oio-role-list {
      overflow: auto;
    }
  }
}
</style>
