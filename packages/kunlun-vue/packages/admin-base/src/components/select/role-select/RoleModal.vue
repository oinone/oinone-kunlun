<script lang="ts">
import { AuthRole } from '@oinone/kunlun-engine';
import {
  CastHelper,
  OioEmptyData,
  OioInput,
  OioInputSearch,
  OioListItem,
  OioModal,
  OioModalProps,
  OioSelectItem,
  OioTab,
  OioTabs,
  PropRecordHelper,
  SelectMode,
  StringHelper
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, reactive, watch } from 'vue';
import { ListState } from '../../quick-utils';
import { BaseSelect } from '../base';
import RoleList from './RoleList.vue';

interface State {
  init: boolean;
  storage: Record<string, OioListItem<AuthRole>>;
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
      type: String
    },
    domain: {
      type: String
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

    const onInit = (res: ListState<AuthRole>) => {
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
      enterCallback,
      onUpdateState,
      onInit
    };
  },
  render() {
    const {
      $translate,
      mode,
      allowClear,
      domain,

      state,
      selectedValues,
      initCheckedKeys,
      enterCallback,
      onUpdateState,
      onInit
    } = this;
    return createVNode(
      OioModal,
      {
        title: $translate('选择角色'),
        width: '720px',
        height: '664px',
        maskClosable: false,
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        wrapperClassName: StringHelper.append(['oio-role-modal'], this.wrapperClassName),
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
              createVNode(RoleList, {
                searchValue: state.searchValue,
                selectMode: mode,
                showCheckedAll: true,
                loading: state.loading,
                usingLoading: false,
                autoInit: true,
                domain,
                initCheckedKeys,
                checkedKeys: state.checkedKeys,
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
.oio-role-modal {
  .ant-modal-body {
    overflow-x: hidden;

    & > .oio-spin-wrapper {
      height: 100%;

      & > .ant-spin-container {
        height: 100%;
      }
    }
  }

  .oio-role-modal-content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    height: 100%;

    & > .oio-role-list {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
