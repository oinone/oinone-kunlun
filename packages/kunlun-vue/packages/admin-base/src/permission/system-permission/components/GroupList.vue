<template>
  <div class="permission-group-list">
    <!--没有开启批量操作并且选中的是菜单，才能添加权限组 -->
    <oio-button
      type="primary"
      v-if="store.nodeType !== 'MODULE' && !store.enableMulti && showAddAction && hasPermissionCreateAction"
      icon="oinone-tianjia"
      @click="onShowAddGroupDialog"
      >{{ $translate('添加权限组') }}
    </oio-button>
    <div class="permission-group-item mt-6" v-for="(item, index) in groupList" :key="index">
      <div class="flex-b-c fs-14">
        <span class="flex-s-c flex-1 hidden">
          <oio-icon icon="oinone-quanxian" size="16" color="#035DFF"></oio-icon>
          <span class="black bold ml-2 omit" style="max-width: 30%" :title="$translate(item.displayName)">{{
            $translate(item.displayName)
          }}</span>
          <span class="ml-3 grey flex-1 omit" :title="item.comment">{{ $translate(item.comment) }}</span>
        </span>

        <!-- 没有开启批量操作，并且只有选中菜单才能进行编辑等操作 -->
        <span v-if="store.nodeType !== 'MODULE' && !store.enableMulti && showAddAction">
          <oio-button v-if="hasPermissionUpdateAction" type="link" @click="onEditCurrentPermission(index)">{{
            $translate('编辑')
          }}</oio-button>
          <a-divider type="vertical" />
          <a-popconfirm
            v-if="item.dataSource !== 'SYSTEM' && hasDeleteGroupAction"
            placement="topLeft"
            :ok-text="$translate('确定')"
            :cancel-text="$translate('取消')"
            @confirm="onDeleteGroup(index, item.id)"
          >
            <template #title>
              <p style="width: 200px">{{ $translate('删除权限组将清空关联角色的对应权限，确认删除吗？') }}</p>
            </template>
            <oio-button type="link" danger style="color: var(--oio-error-color); margin-right: 15px">{{
              $translate('删除')
            }}</oio-button>
          </a-popconfirm>
          <span>
            <oio-switch
              :disabled="!validateToggleGroup(!item.active)"
              :checked="item.active"
              @change="onSwitchActive($event, item)"
            ></oio-switch>
          </span>
        </span>
      </div>

      <div class="mt-4 permission-group-item-group">
        <!-- 暂无角色 -->
        <div class="permission-group-item-group-empty flex-c-c" v-if="!item.roles || item.roles.length === 0">
          <span class="flex-c-c pointer" v-if="hasModifyRoleAction" @click="onShowRoleDialog(index)">
            <oio-icon icon="oinone-circle-add" size="14" color="#035DFF"></oio-icon>
            <span class="ml-1">{{ $translate('添加角色') }}</span>
          </span>
        </div>

        <!-- 角色列表 -->
        <div class="permission-group-item-children flex wrap" v-else>
          <div
            class="permission-group-item-children-tag flex-b-c"
            v-for="(role, roleIndex) in item.roles"
            :key="role.code"
            @click.stop
          >
            <span>{{ role.name }}</span>
            <oio-icon
              v-if="hasModifyRoleAction"
              class="ml-2"
              icon="oinone-guanbi1"
              size="10"
              color="var(--oio-default-icon-color)"
              @click.stop="onRemoveRole(index, roleIndex)"
            ></oio-icon>
          </div>

          <div style="width: 100%" class="flex-c-c">
            <span class="flex-c-c pointer" v-if="hasModifyRoleAction" @click="onShowRoleDialog(index)">
              <oio-icon icon="oinone-circle-add" size="14" color="#035DFF"></oio-icon>
              <span class="ml-1" style="color: var(--oio-primary-color)">{{ $translate('添加角色') }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 添加角色弹窗 -->
  <role-dialog
    v-if="showAddRoleDialog"
    v-model="showAddRoleDialog"
    :active-roles="activeRoles"
    @sure="onAddOrRemoveRole"
    @close="onCloseDialog"
  ></role-dialog>

  <!-- 添加权限组弹窗 -->
  <permission-dialog
    v-if="showPermissionDialog"
    v-model="showPermissionDialog"
    :group="currentSelectedGroup"
    :show-ok-action="
      currentSelectedGroup && currentSelectedGroup.id ? hasPermissionUpdateAction : hasPermissionCreateAction
    "
    @sure="onAddGroup"
    @close="onCloseDialog"
  ></permission-dialog>
</template>
<script lang="ts" setup>
import { OioButton, OioIcon, OioSwitch } from '@oinone/kunlun-vue-ui-antd';
import { computed, defineEmits, defineProps, ref } from 'vue';
import { useDslActionPermission } from '../hooks';
import {
  activeOrCancelGroup,
  batchModifyRole,
  createOrUpdateGroup,
  deleteGroupById,
  modifyManagementRole,
  modifyRole
} from '../service';

import { useStore } from '../store';
import PermissionDialog from './PermissionDialog.vue';

import RoleDialog from './RoleDialog.vue';

const props =
  defineProps<{ groupList: any[]; selectedLeftTree: any; showAddAction: boolean; isManagement?: boolean }>();
const emits = defineEmits(['reload']);

const store = useStore();

const showAddRoleDialog = ref(false);
const showPermissionDialog = ref(false);
const activeGroupIndex = ref(-1);
const activeRoles = ref<any[]>([]);

const currentSelectedGroup = computed(() => {
  if (activeGroupIndex.value >= 0) {
    return props.groupList[activeGroupIndex.value];
  }

  return null;
});

// 是否有查看分组的权限
const hasAuthGroupSystemPermissionLookupAction = computed(
  () => useDslActionPermission().state.value.hasAuthGroupSystemPermissionLookupAction
);

// 是否有新建分组的权限
const hasPermissionCreateAction = computed(() => useDslActionPermission().state.value.hasPermissionCreateAction);

// 是否有编辑分组的权限
const hasPermissionUpdateAction = computed(() => useDslActionPermission().state.value.hasPermissionUpdateAction);

const hasModifyRoleAction = computed(() => {
  if (props.isManagement) {
    // 是否有修改管理权限组角色的权限
    return useDslActionPermission().state.value.hasModifyManagementRoleAction;
  }
  // 是否有修改访问权限组角色的权限
  return useDslActionPermission().state.value.hasModifyRoleAction;
});

// 是否有激活分组的权限
const hasActiveGroupAction = computed(() => useDslActionPermission().state.value.hasActiveGroupAction);

// 是否有取消分组的权限
const hasCancelGroupAction = computed(() => useDslActionPermission().state.value.hasCancelGroupAction);

// 是否有删除分组的权限
const hasDeleteGroupAction = computed(() => useDslActionPermission().state.value.hasDeleteGroupAction);

/**
 * 显示角色弹窗
 */
const onShowRoleDialog = (index) => {
  const { roles = [] } = props.groupList[index];
  activeRoles.value = roles || [];
  activeGroupIndex.value = index;
  showAddRoleDialog.value = true;
};

/**
 * 显示添加分组弹窗
 */
const onShowAddGroupDialog = () => {
  activeGroupIndex.value = -1;
  showPermissionDialog.value = true;
};

/**
 * 编辑分组
 */
const onEditCurrentPermission = (index) => {
  onShowAddGroupDialog();
  activeGroupIndex.value = index;
};

const onCloseDialog = () => {
  activeGroupIndex.value = -1;
};

/**
 * 添加/删除角色
 */
const onAddOrRemoveRole = async (data) => {
  try {
    store.loading = true;
    if (store.enableMulti) {
      const { roles = [] } = await batchModifyRole({
        permissions: props.selectedLeftTree!,
        roles: data
      });
      // eslint-disable-next-line vue/no-mutating-props
      props.groupList[0].roles = roles;
    } else {
      const group = props.groupList[activeGroupIndex.value];
      const condition = {
        ...group,
        module: store.selectedTreeItem.module,
        roles: [...data]
      };
      if (props.isManagement) {
        await modifyManagementRole(condition);
      } else {
        await modifyRole(condition);
      }
      emits('reload');
    }
  } finally {
    store.loading = false;
  }
};

/**
 * 添加分组
 */
const onAddGroup = async (data) => {
  try {
    store.loading = true;
    await createOrUpdateGroup(data);
    emits('reload');
    showPermissionDialog.value = false;
    activeGroupIndex.value = -1;
  } finally {
    store.loading = false;
  }
};

/**
 * 删除分组
 */
const onDeleteGroup = async (index, id) => {
  await deleteGroupById(id);

  // eslint-disable-next-line vue/no-mutating-props
  props.groupList.splice(index, 1);
};

/**
 * 删除角色
 */
const onRemoveRole = async (groupIndex, roleIndex) => {
  activeGroupIndex.value = groupIndex;
  const group = props.groupList[groupIndex];
  const updateRoles = group.roles?.filter((r, index) => index !== roleIndex) || [];
  await onAddOrRemoveRole(updateRoles);
  activeGroupIndex.value = -1;
  group.roles = updateRoles;
};

const validateToggleGroup = (val) => {
  if (val && hasActiveGroupAction.value) {
    return true;
  }

  if (!val && hasCancelGroupAction.value) {
    return true;
  }

  return false;
};

const onSwitchActive = (value, item) => {
  if (validateToggleGroup(value)) {
    item.active = value;
    activeOrCancelGroup(item.id, value);
  }
};
</script>
