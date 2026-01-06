<script lang="ts">
import { type AuthRole, type AuthRoleService, QueryWrapper } from '@oinone/kunlun-engine';
import { CastHelper, OioEmptyData, OioInput, OioInputSearch, OioListItem, OioModal, OioModalProps, OioSelectItem, OioTab, OioTabs, PropRecordHelper, SelectMode, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, type PropType, reactive, type VNode, watch } from 'vue';
import { CheckedHelper, type ListState } from '../../quick-utils';
import { BaseSelect } from '../base';
import RoleList from './RoleList.vue';

interface BaseState {
  init: boolean;
  storage: Record<string, OioListItem<AuthRole>>;
}

interface State extends BaseState {
  loading: boolean;
  searchValue: string;
  checkedKeys: string[];
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
      type: [Object, Array] as PropType<OioSelectItem<AuthRole> | OioSelectItem<AuthRole>[]>
    },
    allowClear: {
      type: Boolean
    },
    domain: {
      type: String
    },
    roleCodes: {
      type: Array as PropType<string[]>
    },
    userRole: {
      type: Boolean,
      default: undefined
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const state: State = reactive({
      init: false,
      storage: {},
      loading: false,
      searchValue: '',
      checkedKeys: []
    });

    const initCheckedKeys = computed(() => {
      let checkedKeys: string[] = [];
      if (props.selected != null) {
        if (Array.isArray(props.selected)) {
          checkedKeys = props.selected.map((v) => v.key);
        } else {
          checkedKeys = [props.selected.key];
        }
      }
      return checkedKeys;
    });

    const selectedValues = computed(() => {
      let checkedKeys: string[];
      if (props.mode === SelectMode.single) {
        const firstKey = state.checkedKeys[0];
        if (firstKey) {
          checkedKeys = [firstKey];
        } else {
          checkedKeys = [];
        }
      } else {
        checkedKeys = state.checkedKeys;
      }
      const selectedItems: OioSelectItem<AuthRole>[] = [];
      for (const checkedKey of checkedKeys) {
        const item = state.storage[checkedKey];
        if (!item) {
          continue;
        }
        const { key, value, label, data } = item;
        selectedItems.push({
          key,
          value,
          label,
          data
        });
      }
      return selectedItems;
    });

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

    const onUpdateState = (key: string, value: unknown) => {
      state[key] = value;
    };

    const roleLoad = (res: ListState<AuthRole>, service: AuthRoleService, queryWrapper: QueryWrapper) => {
      return service.queryListByFilter({
        rsql: queryWrapper.rsql,
        roleCodes: props.roleCodes,
        userRole: props.userRole
      });
    };

    const onInit = (res: ListState<AuthRole>) => {
      state.init = true;
      state.storage = res.storage;
      state.checkedKeys = res.checkedKeys;
    };

    const userRoleListState: BaseState = reactive({
      init: false,
      storage: {}
    });

    const userRoleLoad = (res: ListState<AuthRole>, service: AuthRoleService, queryWrapper: QueryWrapper) => {
      return service.queryListByFilter({
        rsql: queryWrapper.rsql,
        userRole: true
      });
    };

    const onInitUserRoleList = (res: ListState<AuthRole>) => {
      userRoleListState.init = true;
      userRoleListState.storage = res.storage;
    };

    const onUpdateCheckedKeysByUserRoleList = (checkedKeys: string[]) => {
      state.checkedKeys = CheckedHelper.diffListCheckedKeys(
        state.storage,
        userRoleListState.storage,
        state.checkedKeys,
        checkedKeys
      );
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          state.init = false;
        }
      }
    );

    return {
      state,
      selectedValues,
      initCheckedKeys,
      enterCallback,
      onUpdateState,
      roleLoad,
      onInit,
      userRoleLoad,
      onInitUserRoleList,
      onUpdateCheckedKeysByUserRoleList
    };
  },
  render() {
    const {
      $translate,
      mode,
      allowClear,
      domain,
      roleCodes,
      userRole,

      state,
      selectedValues,
      initCheckedKeys,
      enterCallback,
      onUpdateState,
      roleLoad,
      onInit,
      userRoleLoad,
      onInitUserRoleList,
      onUpdateCheckedKeysByUserRoleList
    } = this;
    return createVNode(
      OioModal,
      {
        title: $translate('选择角色'),
        width: '720px',
        maskClosable: false,
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        wrapperClassName: StringHelper.append(['oio-role-modal', 'vxe-table--ignore-clear'], this.wrapperClassName),
        destroyOnClose: true,
        loading: state.loading,
        enterCallback
      },
      {
        default: () => {
          if (state.init && !Object.keys(state.storage).length) {
            return createVNode(OioEmptyData);
          }
          const tabs: { key: string; label: string }[] = [];
          const vNodes: VNode[] = [];
          tabs.push({
            key: 'role',
            label: '角色'
          });
          vNodes.push(
            createVNode(RoleList, {
              searchValue: state.searchValue,
              selectMode: mode,
              showCheckedAll: true,
              loading: state.loading,
              usingLoading: false,
              autoInit: true,
              load: roleLoad,
              domain,
              initCheckedKeys,
              checkedKeys: state.checkedKeys,
              onInit,
              'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
              'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
            })
          );
          let showUserRole = userRole;
          if (!roleCodes?.length) {
            showUserRole = !userRole;
          }
          if (showUserRole) {
            tabs.push({
              key: 'user-role',
              label: '当前角色'
            });
            vNodes.push(
              createVNode(RoleList, {
                searchValue: state.searchValue,
                selectMode: mode,
                showCheckedAll: true,
                loading: state.loading,
                usingLoading: false,
                autoInit: true,
                load: userRoleLoad,
                domain,
                initCheckedKeys: state.checkedKeys,
                checkedKeys: state.checkedKeys,
                onInit: onInitUserRoleList,
                'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
                'onUpdate:checkedKeys': onUpdateCheckedKeysByUserRoleList
              })
            );
          }
          const children: VNode[] = [];
          if (vNodes.length === 1) {
            children.push(vNodes[0]);
          } else {
            children.push(
              createVNode(
                OioTabs,
                {},
                {
                  default: () =>
                    tabs.map((v, i) => {
                      return createVNode(
                        OioTab,
                        {
                          key: v.key,
                          tab: $translate(v.label)
                        },
                        {
                          default: () => [vNodes[i]]
                        }
                      );
                    })
                }
              )
            );
          }
          return [
            createVNode('div', { class: 'oio-role-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                allowClear,
                placeholder: $translate('选择角色'),
                allowArrow: false,
                allowSearch: false,
                notFoundContent: null,
                change: (items: OioSelectItem[]) =>
                  onUpdateState(
                    'checkedKeys',
                    items.map((v) => v.key)
                  )
              }),
              createVNode(OioInputSearch, {
                value: state.searchValue,
                placeholder: $translate('搜索'),
                allowClear: true,
                'onUpdate:value': (val: string) => onUpdateState('searchValue', val)
              }),
              ...children
            ])
          ];
        }
      }
    );
  }
});
</script>
<style lang="scss">
.oio-role-modal {
  .oio-role-modal-content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    height: 100%;

    & > .oio-role-list {
      height: 400px;
      overflow: auto;
    }
  }

  .oio-tab-content {
    height: 400px;
    overflow: auto;
  }
}
</style>
