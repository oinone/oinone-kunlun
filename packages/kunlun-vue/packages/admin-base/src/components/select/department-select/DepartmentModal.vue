<script lang="ts">
import { PamirsDepartment, PamirsDepartmentService, QueryWrapper } from '@oinone/kunlun-engine';
import {
  CastHelper,
  OioEmptyData,
  OioInput,
  OioInputSearch,
  OioModal,
  OioModalProps,
  OioTab,
  OioTabs,
  OioTreeNode,
  PropRecordHelper,
  SelectItem,
  SelectMode,
  StringHelper
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, reactive, watch } from 'vue';
import { TreeState } from '../../quick-utils';
import { BaseSelect } from '../base';
import DepartmentTree from './DepartmentTree.vue';

interface State {
  init: boolean;
  storage: Record<string, OioTreeNode<PamirsDepartment>>;
  loading: boolean;
  searchValue: string;
  checkedKeys: string[];
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
    },
    domain: {
      type: String
    },
    userDept: {
      type: Boolean
    },
    userDeptAndChildren: {
      type: Boolean
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
      const selectedItems: SelectItem<PamirsDepartment>[] = [];
      if (props.mode === SelectMode.single) {
        const checkedKey = state.checkedKeys[0];
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
      for (const checkedKey of state.checkedKeys) {
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

    const load = async (
      res: TreeState<PamirsDepartment>,
      service: PamirsDepartmentService,
      queryWrapper: QueryWrapper
    ) => {
      try {
        return await service.queryDepartmentRootList(queryWrapper);
      } catch (e) {
        state.init = true;
        state.loading = false;
        throw e;
      }
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

    const onUpdateState = (key: string, value: unknown) => {
      state[key] = value;
    };

    const onInit = (res: TreeState<PamirsDepartment>) => {
      state.init = true;
      state.storage = res.storage;
      state.checkedKeys = res.checkedKeys;
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
      load,
      enterCallback,
      onUpdateState,
      onInit
    };
  },
  render() {
    const {
      $translate,
      mode,
      domain,

      state,
      selectedValues,
      initCheckedKeys,
      load,
      enterCallback,
      onUpdateState,
      onInit
    } = this;
    return createVNode(
      OioModal,
      {
        title: $translate('选择部门'),
        width: '720px',
        height: '664px',
        maskClosable: false,
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        wrapperClassName: StringHelper.append(['oio-department-modal'], this.wrapperClassName),
        destroyOnClose: true,
        loading: state.loading,
        enterCallback
      },
      {
        default: () => {
          if (state.init && !Object.keys(state.storage).length) {
            return createVNode(OioEmptyData);
          }
          return [
            createVNode('div', { class: 'oio-department-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                options: selectedValues,
                placeholder: $translate('选择部门'),
                notFoundContent: null,
                allowArrow: false
              }),
              createVNode(OioInputSearch, {
                value: state.searchValue,
                placeholder: $translate('搜索'),
                allowClear: true,
                'onUpdate:value': (val: string) => onUpdateState('searchValue', val)
              }),
              createVNode(DepartmentTree, {
                searchValue: state.searchValue,
                selectMode: mode,
                showCheckedAll: true,
                loading: state.loading,
                usingLoading: false,
                autoInit: true,
                domain,
                initCheckedKeys,
                checkedKeys: state.checkedKeys,
                load,
                onInit,
                'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
                'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
              })
            ])
          ];
        }
      }
    );
  }
});
</script>
<style lang="scss">
.oio-department-modal {
  .ant-modal-body {
    overflow-x: hidden;

    & > .oio-spin-wrapper {
      height: 100%;

      & > .ant-spin-container {
        height: 100%;
      }
    }
  }

  .oio-department-modal-content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    height: 100%;

    & > .oio-department-tree-wrapper,
    & > .oio-department-tree {
      flex: 1;
    }
  }
}
</style>
