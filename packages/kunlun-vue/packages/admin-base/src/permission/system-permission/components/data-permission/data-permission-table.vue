<template>
  <div class="data-permission-table" style="padding: 0 var(--oio-padding)">
    <oio-button type="primary" :loading="addBtnLoading" @click="onAdd">{{ $translate('添加权限项') }}</oio-button>
    <oio-button class="ml-3" type="primary" :disabled="!selectedRowKeys.length" @click="onDelete">{{
      $translate('删除')
    }}</oio-button>
    <oio-table
      ref="vxeTableRef"
      class="data-permission-table-inner"
      height="auto"
      size="small"
      stripe
      show-overflow
      :checkboxConfig="{ highlight: true }"
      :onCheckedChange="onCheckedChange"
      :onCheckedAllChange="onCheckedAllChange"
      :data="dataSource"
    >
      <oio-column
        type="checkbox"
        class-name="table-column-checkbox"
        header-class-name="table-header-column-checkbox"
        width="52"
        align="center"
        fixed="left"
      />
      <oio-column v-for="(column, index) in columns" :key="index" :label="$translate(column.title)" :field="column.key">
        <template #default="colItem">
          <oio-switch v-if="column.ttype == ModelFieldType.Boolean" v-model:checked="colItem.data[column.key]" />
          <oio-button
            type="link"
            v-if="column.key === 'operator'"
            @click="onEdit(colItem && colItem.data)"
            :loading="editBtnLoadingRow === colItem.data._X_ROW_KEY"
            >{{ $translate('编辑') }}</oio-button
          >
        </template>
      </oio-column>
    </oio-table>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, nextTick, onMounted, reactive, ref, watch, withDefaults } from 'vue';
import { OioButton, OioSwitch } from '@oinone/kunlun-vue-ui-antd';
import { OioTable, OioColumn } from '@oinone/kunlun-vue-ui';
import { IPermission } from '../../../permission/type';
import {
  ActionContextType,
  ModelDefaultActionName,
  ModelFieldType,
  ViewActionTarget,
  ViewType
} from '@oinone/kunlun-meta';
import {
  Dialog,
  IPopupInstance,
  PopupManager,
  RuntimeViewAction,
  DisposeEventHandler,
  OpenEventHandler,
  RuntimeAction,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { DialogWidget } from '../../../popup';
import { ClickResult, PopupSubmitParameters } from '../../../../typing';

const props = withDefaults(defineProps<{ authGroupId: string; model: string; dataPermissions: IPermission[] }>(), {
  authGroupId: '',
  model: '',
  dataPermissions: [] as any
});

const emits = defineEmits(['change']);

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    ellipsis: true,
    key: 'name'
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: '关联模型',
    dataIndex: 'model',
    key: 'model'
  },
  {
    title: '过滤条件',
    dataIndex: 'domainExpDisplayName',
    key: 'domainExpDisplayName'
  },
  {
    title: '可见',
    dataIndex: 'permRead',
    key: 'permRead',
    ttype: ModelFieldType.Boolean
  },
  {
    title: '可编辑',
    dataIndex: 'permWrite',
    key: 'permWrite',
    ttype: ModelFieldType.Boolean
  },
  {
    title: '可删除',
    dataIndex: 'permDelete',
    key: 'permDelete',
    ttype: ModelFieldType.Boolean
  },
  {
    title: '操作',
    dataIndex: 'operator',
    key: 'operator'
  }
];

const dataSource = ref([] as IPermission[]);
const activeRecord = ref({});
const vxeTableRef = ref(null as any);

const addBtnLoading = ref(false);
const editBtnLoadingRow = ref('');
const selectedRowKeys = ref([] as string[]);

const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

function disposeCallback(
  currentPopupKey: string,
  disposeEventHandler: DisposeEventHandler,
  openEventHandler?: OpenEventHandler
) {
  nextTick(() => {
    const innerOpenFn = (manager: PopupManager, instance: IPopupInstance) => {
      if (instance.key === currentPopupKey) {
        openEventHandler?.(manager, instance);
      }
    };
    const innerDisposeFn = (manager: PopupManager, instance: IPopupInstance, action?: RuntimeAction) => {
      if (instance.key === currentPopupKey) {
        disposeEventHandler?.(manager, instance, action);
      }
      openEventHandler && PopupManager.INSTANCE.clearOnOpen(innerOpenFn);
      PopupManager.INSTANCE.clearOnClose(innerDisposeFn);
    };

    PopupManager.INSTANCE.onClose(innerDisposeFn);
    if (openEventHandler) {
      PopupManager.INSTANCE.onOpen(innerOpenFn);
    }
  });
}

const viewAction = {
  name: 'authGroupPermissionDialog',
  model: 'auth.ResourcePermission',
  module: 'auth',
  moduleName: 'auth',
  label: translateValueByKey('新增权限项'),
  actionType: 'VIEW',
  contextType: ActionContextType.ContextFree,
  viewType: ViewType.Form,
  target: ViewActionTarget.Dialog
} as RuntimeViewAction;

function reloadTableData() {
  vxeTableRef.value?.getOrigin()?.loadData(dataSource.value);
  emits('change', dataSource.value);
}

const onAdd = () => {
  addBtnLoading.value = true;
  const excludeModels = dataSource.value.map((a) => a.model);
  const dialogKey = Dialog.createByViewAction(
    {
      ...viewAction,
      label: translateValueByKey('新增权限项')
    } as RuntimeViewAction,
    { domainExpJson: excludeModels.join(',') }
  ) as unknown as string;
  disposeCallback(
    dialogKey,
    async (manager: PopupManager, instance: IPopupInstance, action?: RuntimeAction) => {
      if (action?.name !== ModelDefaultActionName.$$internal_DialogSubmit) {
        return;
      }
      const dialogWidget = instance.widget as DialogWidget;
      const newPerm = dialogWidget?.rootData?.[0] as unknown as IPermission;
      if (newPerm) {
        console.log('newPerm', newPerm);
        dataSource.value.push({ ...newPerm, domainExpJson: '' });
        reloadTableData();
      }
    },
    (manager: PopupManager, instance: IPopupInstance) => {
      const dialogWidget = instance.widget as DialogWidget;
      if (dialogWidget) {
        dialogWidget.onSubmitToParent = (a: PopupSubmitParameters) => a as unknown as ClickResult;
      }
      addBtnLoading.value = false;
    }
  );
};

const onEdit = (perm: IPermission) => {
  editBtnLoadingRow.value = perm._X_ROW_KEY as string;
  const excludeModels = dataSource.value.filter((a) => a._X_ROW_KEY !== perm._X_ROW_KEY).map((a) => a.model);
  const dialogKey = Dialog.createByViewAction(
    {
      ...viewAction,
      label: translateValueByKey('编辑权限项')
    } as RuntimeViewAction,
    { ...perm, domainExpJson: excludeModels.join(',') }
  ) as unknown as string;
  disposeCallback(
    dialogKey,
    (manager: PopupManager, instance: IPopupInstance, action?: RuntimeAction) => {
      if (action?.name !== ModelDefaultActionName.$$internal_DialogSubmit) {
        return;
      }
      const dialogWidget = instance.widget as DialogWidget;
      if (dialogWidget?.rootData?.[0]) {
        Object.assign(perm, dialogWidget.rootData[0], { domainExpJson: '' });
        reloadTableData();
      }
    },
    (manager: PopupManager, instance: IPopupInstance) => {
      const dialogWidget = instance.widget as DialogWidget;
      if (dialogWidget) {
        dialogWidget.onSubmitToParent = (a) => a as unknown as ClickResult;
      }
      editBtnLoadingRow.value = '';
    }
  );
};

const onDelete = () => {
  dataSource.value = dataSource.value.filter((a) => !selectedRowKeys.value.includes(a._X_ROW_KEY as string));
  onSelectChange(dataSource.value.map((a) => a._X_ROW_KEY));
  reloadTableData();
};

const onCheckedChange = ({ records }: { records: any[] }) => {
  onSelectChange(records.map((a) => a._X_ROW_KEY));
};

const onCheckedAllChange = ({ checked }: { checked: boolean }) => {
  if (checked) {
    onSelectChange(dataSource.value.map((a) => a._X_ROW_KEY));
  } else {
    onSelectChange([]);
  }
};

watch(
  () => props.dataPermissions,
  (newVal) => {
    dataSource.value = props.dataPermissions;
  },
  { immediate: true }
);
</script>

<style lang="scss">
.data-permission-table {
  &-inner {
    margin-top: var(--oio-margin);
    height: 400px;
  }
}
</style>
