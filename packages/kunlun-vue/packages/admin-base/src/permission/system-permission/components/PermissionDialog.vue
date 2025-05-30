<template>
  <oio-modal
    v-model:visible="visible"
    :loading="modalLoading"
    width="876"
    :title="$translate(title)"
    wrapper-class-name="permission-dialog-content"
    :get-trigger-container="addRoleDialogContainer"
    :cancel-callback="onCancel"
    :enter-callback="onOk"
    :bodyStyle="{
      padding: 0
    }"
    :footer-invisible="!showOkAction"
    :keyboard="false"
    :maskClosable="false"
  >
    <div class="permission-mode-switch">
      <!-- <a-switch
        class="oio-switch"
        v-model:checked="permissionMode"
        checked-children="快捷模式"
        un-checked-children="专家模式"
      /> -->
    </div>

    <oio-tabs type="card" v-model:activeKey="activeKey">
      <oio-tab key="1" :tab="$translate('基础定义')">
        <oio-form layout="vertical" ref="formRef" :data="formState" :rules="rules">
          <oio-form-item required name="name" :label="$translate('权限组名称')">
            <oio-input
              :readonly="!showOkAction"
              :placeholder="$translate('请填写名称')"
              v-model:value="formState.name"
            />
          </oio-form-item>

          <oio-form-item required name="comment" :label="$translate('权限组描述')">
            <oio-textarea
              :readonly="!showOkAction"
              :placeholder="$translate('请填写描述信息')"
              v-model:value="formState.comment"
            />
          </oio-form-item>
        </oio-form>
      </oio-tab>

      <oio-tab key="2" :tab="$translate('动作权限')" class="action-permission-tab" :invisible="!hasActionPermission">
        <div>
          <div style="margin: 5px 0">
            {{ $translate('自定义该权限组包含菜单下的哪些操作权限') }}（<span style="color: var(--oio-error-color)">{{
              $translate('提示：未遵循 Oinone Action 研发规范的 Action 将不受权限管控')
            }}</span
            >）
          </div>
          <oio-button v-if="showOkAction" type="primary" @click="onToggleAllAction"
            >{{ hasSelectAllActions ? $translate('取消全选') : $translate('全选') }}
          </oio-button>
          <a-tree
            ref="treeNode"
            class="oio-tree"
            checkable
            check-strictly
            default-expand-all
            :disabled="!showOkAction"
            :auto-expand-parent="autoExpandParent"
            :tree-data="actionData"
            v-model:checkedKeys="checkedKeys"
            @check="onCheckTree"
          >
            <template #title="{ title, data }">
              <div>
                {{ title }}
                <span style="position: absolute; right: 0; color: var(--oio-icon-color)">
                  >{{ data.menuName }}/{{ data.displayValue }}</span
                >
              </div>
            </template>
          </a-tree>
        </div>
      </oio-tab>

      <oio-tab key="3" :tab="$translate('字段权限')" :invisible="!hasFieldPermission">
        <div>
          <div style="color: var(--oio-text-color-secondary); margin: 5px 0">
            {{ $translate('自定义菜单关联主模型的字段权限，默认全部可见、可编辑') }}
          </div>
          <div class="flex-s-c mt-2" v-if="showOkAction">
            <oio-button type="primary" @click="onSetAllVisible">{{ $translate('设为全部可见') }}</oio-button>
            <oio-button class="ml-3" type="primary" @click="onSetAllEdit"
              >{{ $translate('设为全部可编辑') }}
            </oio-button>
          </div>
          <div class="mt-2">
            <a-table :dataSource="fieldData" :columns="columns">
              <template v-slot:emptyText>
                <a-empty :description="$translate('暂无数据')"></a-empty>
              </template>
              <template v-slot:bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'permRead'">
                  <oio-switch
                    :disabled="!showOkAction"
                    v-model:checked="record.permRead"
                    @change="onOperatorField(record)"
                  />
                </template>

                <template v-if="column.dataIndex === 'permWrite'">
                  <oio-switch
                    :disabled="!showOkAction"
                    v-model:checked="record.permWrite"
                    @change="onOperatorField(record)"
                  />
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </oio-tab>

      <oio-tab key="4" :tab="$translate('数据权限')" class="data-permission-tab" :invisible="!hasDataPermission">
        <data-permission
          ref="dataPermissionRef"
          :help="$translate('您所拥有的当前资源数据权限，如未设置，将视为拥有全部数据权限。')"
          :data-permission="dataPermission"
          :showOkAction="showOkAction"
        />
      </oio-tab>
    </oio-tabs>
  </oio-modal>
</template>
<script lang="ts" setup>
import { translateValueByKey } from '@kunlun/engine';
import { ModelFieldTypeDisplayName } from '@kunlun/meta';
import { GraphqlHelper } from '@kunlun/shared';
import {
  OioButton,
  OioForm,
  OioFormItem,
  OioInput,
  OioModal,
  OioSwitch,
  OioTab,
  OioTabs,
  OioTextarea
} from '@kunlun/vue-ui-antd';
import { computed, defineEmits, defineProps, ref, watch, withDefaults } from 'vue';
import { IPermission } from '../../permission/type';
import { queryActionsByMenu, queryGroupData } from '../service';
import { useStore } from '../store';
import { ActionPermissionNode, AnyPermissionNode } from '../../types';
import DataPermission from './data-permission/data-permission.vue';

interface ActionTreeItem {
  key: string;
  title: string;
  value: ActionPermissionNode;
  hasNext: boolean;
  menuName: string;
  displayValue: string;
  children: ActionTreeItem[];
}

const columns = [
  {
    title: translateValueByKey('显示名称'),
    dataIndex: 'displayValue',
    key: 'displayValue'
  },
  {
    title: translateValueByKey('字段技术名称'),
    dataIndex: 'field',
    key: 'field'
  },
  {
    title: translateValueByKey('字段类型'),
    dataIndex: 'typeName',
    key: 'typeName'
  },
  {
    title: translateValueByKey('字段描述'),
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: translateValueByKey('可见'),
    dataIndex: 'permRead',
    key: 'permRead'
  },
  {
    title: translateValueByKey('可编辑'),
    dataIndex: 'permWrite',
    key: 'permWrite'
  }
];

const rules = {
  name: [{ required: true, message: translateValueByKey('请输入权限组名称'), trigger: 'blur' }],
  comment: [{ required: true, message: translateValueByKey('请输入权限组描述'), trigger: 'blur' }]
};

const props = withDefaults(defineProps<{ modelValue: boolean; group: Record<string, any>; showOkAction: boolean }>(), {
  modelValue: false,
  group: {} as any,
  showOkAction: true
});
const emits = defineEmits(['update:modelValue', 'sure', 'close']);

const title = ref(translateValueByKey('添加权限组'));
const formRef = ref<any>();
const visible = ref(false);
const activeKey = ref('1');
const treeNode = ref();
const formState = ref({
  name: '',
  comment: ''
});

const checkedKeys = ref<string[]>([]);
const autoExpandParent = ref<boolean>(true);
const actionData = ref<ActionTreeItem[]>([]);
const fieldData = ref<any[]>([]);

const allActionKeys = ref<string[]>([]);

const hasChangedFieldData = ref<string[]>([]);

const dataPermission = ref<IPermission>({} as IPermission);

const hasActionPermission = ref(true);
const hasFieldPermission = ref(true);
const hasDataPermission = ref(true);
const modalLoading = ref(false);

const store = useStore();

const hasSelectAllActions = computed(
  () => checkedKeys.value.length && allActionKeys.value.length === checkedKeys.value.length
);

/**
 * 动作提交的数据
 */
const submitActionData = () => {
  return submitActionData0(actionData.value);
};

const submitActionData0 = (items: ActionTreeItem[]): any[] => {
  const nodes: any[] = [];
  for (const item of items) {
    const action = item.value;
    nodes.push({
      id: action.id,
      path: action.path,
      model: action.model,
      name: action.action,
      resourceId: action.resourceId,
      canAccess: checkedKeys.value.includes(item.key)
    });
    if (item.children) {
      nodes.push(...submitActionData0(item.children));
    }
  }
  return nodes;
};

/**
 * 字段提交的数据
 */
const submitFieldData = () => {
  return [...fieldData.value];
};

const genActionTree = (node: ActionPermissionNode): ActionTreeItem => {
  const uniqueId = node.path;
  allActionKeys.value.push(uniqueId);
  if (node.canAccess) {
    checkedKeys.value.push(uniqueId);
  }
  return {
    key: uniqueId,
    title: `${node.displayValue}    ${node.action}`,
    value: node,
    hasNext: node.hasNext,
    menuName: node.menuName,
    displayValue: node.displayValue,
    children: node.nodes?.map((n) => genActionTree(n as unknown as ActionPermissionNode)) || []
  };
};

/**
 * 初始化：获取动作、字段
 */
const init = async () => {
  allActionKeys.value = [];

  const { group } = props;
  const groupId = group?.id;
  if (groupId) {
    title.value = translateValueByKey('编辑权限组');
    formState.value = {
      name: group.displayName,
      comment: group.comment
    };
  }

  const [res, { nodesJson }] = await Promise.all([
    queryGroupData(store.selectedTreeItem as unknown as AnyPermissionNode, groupId),
    queryActionsByMenu(store.selectedTreeItem as unknown as AnyPermissionNode, groupId)
  ]);
  const actions = nodesJson ? JSON.parse(nodesJson) || [] : [];
  actionData.value = actions.map((a) => genActionTree(a));

  hasActionPermission.value = !!nodesJson;
  hasFieldPermission.value = !!res.fieldPermissions;
  hasDataPermission.value = !!res.rowPermission;

  fieldData.value =
    res.fieldPermissions?.map((r) => ({
      ...r,
      typeName: ModelFieldTypeDisplayName[r.ttype]
    })) || [];
  dataPermission.value = res.rowPermission || {};
};

const onToggleAllAction = () => {
  if (hasSelectAllActions.value) {
    checkedKeys.value = [];
    return;
  }
  checkedKeys.value = [...allActionKeys.value];
};

/**
 * 操作了字段
 * 用来记录被修改过的字段
 */
const onOperatorField = (record) => {
  hasChangedFieldData.value.push(record.resourceId);
  hasChangedFieldData.value = Array.from(new Set(hasChangedFieldData.value));
};

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v;
    activeKey.value = '1';

    if (visible.value) {
      modalLoading.value = true;
      init().finally(() => {
        modalLoading.value = false;
      });
    }
  },
  { immediate: true }
);

/**
 * 选中动作树
 */
const onCheckTree = ({ checked }) => {
  checkedKeys.value = checked;
};

const onCancel = () => {
  visible.value = false;
  emits('update:modelValue', false);
  emits('close');
};

const dataPermissionRef = ref(null as any);

/**
 * 提交数据
 */
const onOk = async () => {
  try {
    await formRef.value.validate();

    const { module, resourceId, nodeType, path } = store.selectedTreeItem;

    if (dataPermission.value) {
      if (dataPermission.value.domainExp) {
        const domainExpJson = await dataPermissionRef.value?.submitExp();
        if (domainExpJson) {
          dataPermission.value.domainExpJson = domainExpJson;
        } else {
          const _domainExpJson = dataPermission.value.domainExpJson as string;
          if (_domainExpJson) {
            try {
              const json = JSON.parse(_domainExpJson);
              dataPermission.value.domainExpJson = GraphqlHelper.serializableObjectArray(json);
            } catch (error) {
              console.error(error as any);
            }
          }
        }
      } else {
        dataPermission.value.domainExpJson = '';
      }
    }

    emits('sure', {
      ...(props.group || {}),
      ...formState.value,
      module,
      fieldPermissions: hasFieldPermission.value ? submitFieldData() : null,
      actionPermissions: hasActionPermission.value ? submitActionData() : null,
      rowPermission: hasDataPermission.value ? { ...dataPermission.value } : null,
      nodeType,
      resourceId,
      path
    });
  } catch (error) {
    console.error('error', error);
    activeKey.value = '1';
  }
};

const onSetAllVisible = () => {
  fieldData.value = fieldData.value.map((v) => ({
    ...v,
    permRead: true
  }));

  hasChangedFieldData.value = fieldData.value.map((f) => f.resourceId);
};

const onSetAllEdit = () => {
  fieldData.value = fieldData.value.map((v) => ({
    ...v,
    permRead: true,
    permWrite: true
  }));

  hasChangedFieldData.value = fieldData.value.map((f) => f.resourceId);
};

const addRoleDialogContainer = () => document.getElementById('permission-config')!;
</script>
<style lang="scss"></style>