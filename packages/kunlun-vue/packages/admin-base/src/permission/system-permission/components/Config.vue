<template>
  <div class="oio-group oio-group-border oio-default-group permission-config" id="permission-config">
    <oio-spin :loading="loading">
      <!-- 没有选中 或者 没有权限 -->
      <empty v-if="isEmpty" :title="emptyText"></empty>

      <div v-else>
        <!-- 非批量操作 -->
        <div v-if="!store.enableMulti">
          <!-- 管理权限 -->
          <div>
            <div class="flex-s-c">
              <span class="fs-16 bold black">2. {{ $translate('配置管理权限') }}</span>
              <span class="ml-2 fs-14 grey ml-2">{{ $translate('允许哪些角色可以管理当前应用') }}</span>
            </div>
            <div class="mt-6" :class="[managerList.length === 0 && !store.nodeType && 'flex-1']">
              <!-- 权限组列表 -->
              <group-list-component
                :group-list="managerList"
                :selected-left-tree="selectedLeftTree"
                :show-add-action="false"
                is-management
                @reload="onQueryGroupList"
              />
            </div>
          </div>

          <div v-if="store.nodeType === 'MODULE'">
            <!-- 配置访问权限 -->
            <div class="mt-6">
              <div class="flex-s-c">
                <span class="fs-16 bold black">3. {{ $translate('配置访问权限') }}</span>
                <span class="ml-2 fs-14 grey ml-2">{{ $translate('允许哪些角色可以访问当前应用') }}</span>
                <oio-button
                  class="btn-collection-permission-items"
                  v-if="hasCollectionPermissionItemsAction"
                  type="link"
                  @click="onCollectionPermissionItems"
                  >收集权限项
                </oio-button>
              </div>
              <div class="mt-6" :class="[groupList.length === 0 && !store.nodeType && 'flex-1']">
                <!-- 权限组列表 -->
                <group-list-component
                  :group-list="groupList"
                  :selected-left-tree="selectedLeftTree"
                  :show-add-action="false"
                  @reload="onQueryGroupList"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 批量操作 或者 选中的是菜单-->
        <div v-if="store.enableMulti || store.nodeType !== 'MODULE'">
          <Empty v-if="isEmpty" :title="emptyText"></Empty>
          <div v-else>
            <div class="flex-s-c mt-6" v-if="!notSelected">
              <span class="fs-16 bold black">{{ store.enableMulti ? '2' : '3' }}.{{ $translate('配置权限') }}</span>
              <span class="ml-2 fs-14 grey ml-2">{{ $translate('添加权限组，将权限授权给对应角色') }}</span>
              <oio-button
                class="btn-collection-permission-items"
                v-if="hasCollectionPermissionItemsAction && store.selectedTreeItem.path.endsWith('*')"
                type="link"
                @click="onCollectionPermissionItems"
                >收集权限项
              </oio-button>
            </div>
            <div class="mt-6 flex-1">
              <!-- 权限组列表 -->
              <group-list-component
                :group-list="groupList"
                :selected-left-tree="selectedLeftTree"
                show-add-action
                @reload="onQueryGroupList"
              />
            </div>
          </div>
        </div>
      </div>
    </oio-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, computed, defineProps, withDefaults } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
import { OioButton, OioSpin } from '@kunlun/vue-ui-antd';
import { useDslActionPermission } from '../hooks';
import { collectionPermissionItems, queryGroups } from '../service';
import { useStore } from '../store';
import { PermissionNode } from '../../types';
import GroupListComponent from './GroupList.vue';
import Empty from './Empty.vue';

const props = withDefaults(defineProps<{ selectedLeftTree: any[] }>(), {
  selectedLeftTree: [] as any
});

// 是否有收集权限项的权限
const hasCollectionPermissionItemsAction = computed(
  () =>
    useDslActionPermission().state.value.hasCollectionPermissionItemsAction &&
    !!store.selectedTreeItem?.path?.endsWith('*')
);

const groupList = ref<any[]>([]);
const managerList = ref<any[]>([]);
const loading = ref(false);

const store = useStore();

const notSelected = computed(() => groupList.value.length === 0 && !store.nodeType);

const notBindView = computed(() => {
  const { action, model } = store.selectedTreeItem;

  if (store.nodeType === 'MENU' || store.nodeType === 'HOMEPAGE') {
    if (!action || !model) {
      return true;
    }
  }

  return false;
});

const isEmpty = computed(() => notSelected.value || store.selectedTreeItem.canAllot === false || notBindView.value);
const emptyText = computed(() => {
  if (notBindView.value) {
    return translateValueByKey('当前资源未完成初始化设置，请设置后再次尝试分配权限');
  }

  if (store.selectedTreeItem.canAllot === false) {
    return translateValueByKey('未拥有当前资源管理权限，如仍需继续处理，请联系管理员');
  }

  return translateValueByKey('当前无可配置权限，请先选择应用/菜单');
});

/**
 * 左侧菜单树点击的时候，查询对应的权限组
 */
watch(
  () => store.selectedTreeItem,
  async (item) => {
    if (item && item.id) {
      onQueryGroupList();
    }
  }
);

/**
 * 开启、关闭批量操作的时候，要清空权限组
 */
watch(
  () => store.enableMulti,
  () => {
    groupList.value = [];
  }
);

/**
 * 批量操作下选中的菜单树，需要初始化一个分组进去
 */
watch(
  () => props.selectedLeftTree,
  (list) => {
    if (store.enableMulti) {
      if (list && list.length) {
        groupList.value = [
          {
            displayName: translateValueByKey('批量操作'),
            comment: translateValueByKey('批量操作下只能操作角色'),
            roles: []
          }
        ];
      } else {
        groupList.value = [];
      }
    }
  }
);

/**
 * 查询权限组列表
 */
const onQueryGroupList = async () => {
  try {
    loading.value = true;
    const selected = store.selectedTreeItem;
    const res = await queryGroups({
      nodeType: selected.nodeType,
      resourceId: selected.resourceId,
      path: selected.path
    });
    groupList.value = res.runtimeGroups;
    managerList.value = res.managementGroups;
  } finally {
    loading.value = false;
  }
};

/**
 * 收集权限项
 */
const onCollectionPermissionItems = async () => {
  try {
    loading.value = true;
    await collectionPermissionItems(store.selectedTreeItem as unknown as PermissionNode);
  } finally {
    loading.value = false;
  }
};
</script>
<style lang="scss">
.permission-config {
  overflow-y: scroll;
  scrollbar-width: 0;

  .oio-spin-wrapper,
  .ant-spin-container {
    width: 100%;
    height: 100%;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  .empty-permission {
    width: 100%;
    height: 100%;
    min-height: 300px;
    background: var(--body-background);
    border: 1px solid var(--oio-border-color);
    border-radius: 4px;
    box-sizing: border-box;
  }

  .ant-btn-dangerous.ant-btn-link {
    color: var(--oio-error-color);
  }

  .permission-group-item-group {
    padding: 12px;
    min-height: 100px;
    background: var(--oio-body-background);
    border: 1px solid var(--oio-border-color);
    border-radius: 4px;
    box-sizing: border-box;

    .permission-group-item-group-empty {
      height: 100px;
      color: var(--oio-primary-color);
    }
  }

  .permission-group-item-children {
    gap: 12px;

    &-tag {
      height: 32px;
      padding: 0 15px;
      background: rgba(3, 93, 255, 0.1);
      border: 1px solid var(--oio-primary-color);
      border-radius: 4px;
      box-sizing: border-box;
      color: var(--oio-primary-color);

      .oio-icon {
        cursor: pointer;
      }
    }
  }

  .ant-tree .ant-tree-node-content-wrapper {
    position: inherit;
  }
}

.delete-permission-group {
  background: var(--oio-background);

  .ant-popover-inner,
  .ant-popover-arrow-content {
    background: var(--oio-background);
  }

  .ant-popover-message-title {
    color: var(--oio-text-color);
  }

  .ant-popover-buttons {
    .ant-btn:first-child {
      background: var(--oio-background);
      border-color: var(--oio-border-color);
      color: var(--oio-text-color);
    }
  }
}

.btn-collection-permission-items {
  margin-left: 16px;
}
</style>
