<template>
  <div class="oio-group oio-group-border oio-default-group permission-menu flex flex-column" ref="leftMenuRef">
    <div class="flex-b-c">
      <span class="fs-16 bold">1.{{ $translate('选择应用/菜单') }}</span>
      <oio-button type="primary" v-if="hasPermissionCreateBatchAction" @click="switchEnableMulti"
        >{{ store.enableMulti ? $translate('取消批量') : $translate('批量配置') }}
      </oio-button>
    </div>
    <div class="mt-5 flex-1 flex flex-column" style="overflow: hidden">
      <oio-input-search v-model:value="searchValue" :placeholder="$translate('使用名称进行搜索')" />

      <div class="mt-2 flex-1" style="overflow: scroll">
        <a-tree
          class="oio-tree"
          :checkable="store.enableMulti ? true : false"
          :expandedKeys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
          :tree-data="filteredData"
          v-model:selectedKeys="selectedKeys"
          v-model:checkedKeys="checkedKeys"
          @expand="onExpand"
          @select="onSelectedTreeItem"
          @check="onCheckTree"
        >
          <template #title="{ title, data }">
            <div class="flex-s-c">
              <img
                v-if="data.nodeType === 'MODULE' && data.icon"
                style="width: 15px; height: 15px; margin-right: 5px"
                :src="data.icon"
                alt=""
              />
              <oio-icon
                style="margin-right: 5px"
                v-if="data.icon && data.nodeType === 'MENU'"
                :icon="data.icon"
              ></oio-icon>
              <span v-if="title && title.indexOf(searchValue) > -1">
                {{ title.substr(0, title.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ title }}</span>
            </div>
          </template>
        </a-tree>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { OioButton, OioIcon, OioInputSearch } from '@oinone/kunlun-vue-ui-antd';
import { debounce } from 'lodash-es';
import { computed, defineEmits, ref, watch } from 'vue';
import { AnyPermissionNode, MenuPermissionNode, ModulePermissionNode } from '../../types';
import { useDslActionPermission } from '../hooks';
import { queryMenus } from '../service';
import { useStore } from '../store';

const getNodeItem = (node: AnyPermissionNode) => ({
  key: node.id,
  title: node.displayValue,
  value: node.resourceId,
  id: node.resourceId,
  nodeType: node.nodeType,
  resourceId: node.resourceId,
  path: node.path,
  canAccess: node.canAccess,
  canAllot: node.canAllot,
  module: (node as ModulePermissionNode).module,
  action: (node as MenuPermissionNode).action,
  model: (node as MenuPermissionNode).model,
  icon: (node as ModulePermissionNode).icon
});

const getChildrenNodes = (nodes: any[]) => {
  return nodes.map((v) => {
    let children: any[] = [];
    if (v.nodes) {
      children = getChildrenNodes(v.nodes || []);
    }
    return {
      ...getNodeItem(v),
      children
    };
  });
};

const dataList: any[] = [];
const generateList = (data: any[]) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const key = node.key;
    dataList.push({ key, title: node.title as string });
    if (node.children) {
      generateList(node.children);
    }
  }
};

const getParentKey = (key: string, tree: any[]): string | number | undefined => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

const filterTreeData = (treeData, searchValue: string) => {
  return treeData
    .map((node) => {
      if (node.title.indexOf(searchValue) > -1) {
        return { ...node };
      } else if (node.children) {
        const children = filterTreeData(node.children, searchValue);
        if (children.length) {
          return { ...node, children };
        }
      }
      return null;
    })
    .filter((node) => node);
};

const emits = defineEmits(['checked-tree']);

const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([]);
const searchValue = ref<string>('');
const autoExpandParent = ref<boolean>(true);
const treeData = ref<any[]>([]);
const leftMenuRef = ref();
const store = useStore();

const filteredData = computed(() => {
  if (!searchValue.value) {
    return treeData.value;
  }

  return filterTreeData(treeData.value, searchValue.value);
});

// 是否有批量修改角色的权限
const hasPermissionCreateBatchAction = computed(
  () => useDslActionPermission().state.value.hasPermissionCreateBatchAction
);

/**
 * 初始化、获取菜单
 */
const init = async () => {
  try {
    store.loading = true;
    const nodes = await queryMenus();

    treeData.value = nodes.map((v) => {
      const children = getChildrenNodes(v.nodes || []);

      return {
        ...getNodeItem(v),
        children
      };
    });

    generateList(treeData.value);
  } finally {
    store.loading = false;
  }
};
init();

const onExpand = (keys: string[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

const switchEnableMulti = () => {
  store.enableMulti = !store.enableMulti;
  resetEmpty();
};

const resetEmpty = () => {
  store.selectedTreeItem = {};
  store.nodeType = '';
  selectedKeys.value = [];

  if (!store.enableMulti) {
    checkedKeys.value = [];
  }
};

const onCheckTree = (keys, e) => {
  const { checkedNodes = [] } = e;
  emits('checked-tree', checkedNodes);
};

/**
 * 选中 树
 */
const onSelectedTreeItem = (keys: string[], e) => {
  if (store.enableMulti) {
    selectedKeys.value = [];
    return;
  }

  const { selectedNodes = [] } = e;
  const [node] = selectedNodes;

  // 如果当先选择的是菜单，并且是父菜单，那么就不做任何事情
  if (node.nodeType === 'MENU' && node.children && node.children.length) {
    selectedKeys.value = [];
    return;
  }

  if (!node || !node.nodeType) {
    return;
  }

  if (node) {
    store.selectedTreeItem = node;
    store.nodeType = node.nodeType;
  }
};

const onSearch = debounce((value) => {
  if (!value) {
    expandedKeys.value = [];
    autoExpandParent.value = false;
    return;
  }

  const expanded = dataList
    .map((item: any) => {
      if ((item.title as string).indexOf(value) > -1) {
        return getParentKey(item.key as string, treeData.value);
      }
      return null;
    })
    .filter((item, i, self) => item && self.indexOf(item) === i);

  expandedKeys.value = expanded as string[];
  autoExpandParent.value = true;
}, 500);

watch(searchValue, (value) => {
  onSearch(value);
});
</script>
<style lang="scss">
.permission-menu {
  position: relative;
  overflow-y: scroll;
  scrollbar-width: 0;

  &::-webkit-scrollbar {
    display: none;
  }

  .ant-tree-switcher {
    color: #c0c4cc;
  }

  .ant-tree-treenode-disabled {
    .ant-tree-title {
      color: var(--oio-disabled-color);
    }
  }
}
</style>
