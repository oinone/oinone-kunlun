<template>
  <a-sub-menu
    popupClassName="inline-menu-popup"
    :class="['oio-scrollbar', 'root-sub-menu-' + treeNode.level, treeNode.level === 1 ? 'root-menu' : 'not-root-menu']"
    :key="treeNode.key"
  >
    <template #title>
      <oio-icon
        v-if="treeNode.level === 1"
        color="var(--oio-menu-default-icon-color)"
        size="14"
        :icon="treeNode.value.icon || DEFAULT_MENU_ICON"
      />
      <span :title="treeNode.value.title">{{ treeNode.value.title }}</span>
    </template>
    <template v-for="item in treeNode.children" :key="item.key">
      <template v-if="!item.children || !item.children.length">
        <a-menu-item class="oio-sub-menu-menu-item" :key="item.key" :title="item.value.title">
          {{ item.value.title }}
        </a-menu-item>
      </template>
      <template v-else>
        <default-sub-menu :tree-node="item" :key="item.key" />
      </template>
    </template>
    <template #expandIcon="{ isOpen }">
      <oio-icon
        v-if="treeNode.children"
        icon="oinone-menu-caidanxiala"
        color="var(--oio-menu-root-title-hover-color)"
        :style="{
          transform: isOpen ? 'rotate(360deg)' : 'rotate(270deg)',
          transition: 'all 0.3s ease'
        }"
      />
    </template>
  </a-sub-menu>
</template>
<script lang="ts">
import { IMenu } from '@kunlun/meta';
import { TreeNode } from '@kunlun/shared';
import { OioIcon } from '@kunlun/vue-ui-antd';
import { MenuItem as AMenuItem, SubMenu as ASubMenu } from 'ant-design-vue';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DefaultSubMenu',
  components: {
    OioIcon,
    ASubMenu,
    AMenuItem
  },
  inheritAttrs: false,
  props: {
    treeNode: {
      type: Object as PropType<TreeNode<IMenu>>,
      required: true
    }
  },
  setup() {
    const DEFAULT_MENU_ICON = 'oinone-menu-caidanmoren';

    return {
      DEFAULT_MENU_ICON
    };
  }
});
</script>
