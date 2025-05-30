<template>
  <div class="k-oinone-menu-wrapper">
    <div class="menu-search" v-if="showSearch">
      <a-select
        ref="menuSelectSearch"
        class="oio-select"
        dropdownClassName="default-menu-select-dropdown"
        option-filter-prop="label"
        allowClear
        :placeholder="translateValueByKey('搜索菜单')"
        :show-search="true"
        v-model:value="searchSelectValue"
        :search-value="searchValue"
        @search="onSearchValueChange"
        @change="innerSearchSelect"
      >
        <a-select-option v-for="item in searchMenus" :key="item.name" :value="item.name" :label="item.displayName">
          {{ item.displayName }}
        </a-select-option>
        <template #suffixIcon>
          <oio-icon icon="oinone-sousuo" size="12px" color="var(--oio-menu-default-icon-color)" />
        </template>
      </a-select>
    </div>
    <div class="menu-area oio-scrollbar">
      <div class="menu-content" :class="collapsed && 'collapsed'">
        <oio-spin :loading="loading">
          <!-- 
            oinone-menu-theme1: 菜单1 连接线, 
            oinone-menu-theme2: 菜单二 不含背景颜色, 菜单左侧是圆点 + 竖线, 
            oinone-menu-theme3: 含背景颜色, 菜单左侧是圆点 , 
            oinone-menu-theme4: 含背景颜色, 箭头在左侧 
            oinone-menu-theme5: 不含背景颜色，菜单左侧是空心圆
          -->
          <a-menu
            :class="['oinone-menu', menuThemeClass]"
            mode="inline"
            :inlineIndent="0"
            :inline-collapsed="collapsed"
            :selectedKeys="selectedKeys"
            :openKeys="currentOpenKeys"
            @click="onMenuSelected"
            @open-change="onOpenChange"
          >
            <template v-for="item in treeNodes" :key="item.key">
              <a-menu-item
                v-if="item.isLeaf"
                :key="item.key"
                :title="item.value.title"
                class="root-menu root-menu-item"
              >
                <oio-icon
                  size="14px"
                  :icon="item.value.icon || DEFAULT_MENU_ICON"
                  color="var(--oio-menu-default-icon-color)"
                />
                <span>{{ item.value.title }}</span>
              </a-menu-item>
              <default-sub-menu v-else :tree-node="item" :key="item.key" />
            </template>
          </a-menu>
        </oio-spin>
      </div>
    </div>
    <div class="menu-footer" :class="collapsed && 'collapsed'">
      <div class="menu-toggle-collapsed" @click="onCollapsedChange(!collapsed)">
        <span class="collapsed-icon">
          <oio-icon
            :icon="collapsed ? 'oinone-menu-caidanzhankai' : 'oinone-menu-caidanshouqi'"
            size="16px"
            color="var(--oio-menu-default-icon-color)"
          />
        </span>
        <span v-show="!collapsed" class="collapsed-text">{{ translateValueByKey('点击收起菜单') }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { translateValueByKey } from '@kunlun/engine';
import { OioIcon, OioSpin, TreeNode } from '@kunlun/vue-ui-antd';
import { Menu as AMenu, MenuItem as AMenuItem, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue';
import { computed, defineComponent, nextTick, onMounted, PropType, ref, watch } from 'vue';
import { RuntimeMenu } from '../../typing';
import DefaultSubMenu from './DefaultSubMenu.vue';

interface SelectMenuItemEvent {
  keyPath: string[];
}

export default defineComponent({
  name: 'DefaultMenu',
  components: {
    DefaultSubMenu,
    OioIcon,
    OioSpin,
    AMenu,
    AMenuItem,
    ASelect,
    ASelectOption
  },
  inheritAttrs: false,
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String as PropType<'horizontal' | 'inline'>
    },
    collapsed: {
      type: Boolean,
      default: undefined
    },
    menus: {
      type: Array as PropType<RuntimeMenu[]>,
      required: true
    },
    treeNodes: {
      type: Array as PropType<TreeNode<RuntimeMenu>[]>,
      required: true
    },
    selectedKeys: {
      type: Array as PropType<string[]>
    },
    openKeys: {
      type: Array as PropType<string[]>
    },
    translate: {
      type: Function
    },
    onOpenChange: {
      type: Function
    },
    onCollapsedChange: {
      type: Function
    },
    onSelect: {
      type: Function
    },
    onClick: {
      type: Function
    },
    menuThemeClass: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const DEFAULT_MENU_ICON = 'oinone-yijicaidan';

    const showSearch = computed(() => {
      return props.menus.length && props.mode === 'inline' && !props.collapsed;
    });

    const searchMenus = computed(() => {
      return props.menus.filter((v) => !!v.viewAction) || [];
    });

    // 菜单折叠时，不需要展开的 SubMenu，否则会导致切换多tab的会导致打开SubMenu气泡区域
    const currentOpenKeys = computed(() => {
      return props.collapsed ? [] : props.openKeys;
    });

    const onMenuSelected = ({ keyPath }: SelectMenuItemEvent) => {
      let targetNode: TreeNode<RuntimeMenu> | undefined;
      let currentNodes = props.treeNodes;
      let currentNode: TreeNode<RuntimeMenu> | undefined;
      for (let i = 0; i < keyPath.length; i++) {
        const key = keyPath[i];
        currentNode = currentNodes.find((v) => v.key === key);
        if (!currentNode) {
          return;
        }
        if (i === keyPath.length - 1) {
          targetNode = currentNode;
          break;
        }
        currentNodes = currentNode.children;
      }
      if (targetNode) {
        props.onClick?.(targetNode);
      }
    };

    const onCollapsedChange = (val: boolean) => {
      props.onCollapsedChange?.(val);
    };

    const menuSelectSearch = ref();

    const searchSelectValue = ref();
    const searchValue = ref('');

    const onSearchValueChange = (val: string) => {
      searchValue.value = val;
    };

    const innerSearchSelect = (key: string) => {
      const targetNode = findTreeNode(props.treeNodes, key);
      if (targetNode) {
        props.onSelect?.(targetNode);
      }
      menuSelectSearch.value.blur?.();
    };

    const findTreeNode = (nodes: TreeNode<RuntimeMenu>[], key: string): TreeNode<RuntimeMenu> | undefined => {
      for (const node of nodes) {
        if (node.key === key) {
          return node;
        }
        if (node.children.length) {
          const target = findTreeNode(node.children, key);
          if (target) {
            return target;
          }
        }
      }
    };

    onMounted(() => {
      nextTick(() => {
        onCollapsedChange(false);
      });
    });

    watch(
      () => props.menus,
      () => {
        searchSelectValue.value = undefined;
        searchValue.value = '';
      }
    );

    return {
      DEFAULT_MENU_ICON,
      onCollapsedChange,
      currentOpenKeys,
      showSearch,
      searchMenus,
      menuSelectSearch,
      searchSelectValue,
      searchValue,
      onSearchValueChange,
      innerSearchSelect,

      onMenuSelected,
      translateValueByKey
    };
  }
});
</script>
