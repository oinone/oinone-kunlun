<template>
  <a-menu-item :key="menuId" v-if="menu.children.length === 0">
    <tooltip placement="top">
      <span>
        <span v-if="menu.menu.icon" class="anticon">
          <i aria-hidden="true" class="iconfont" style="margin-right: 10px" :class="`icon${menu.menu.icon}`" />
        </span>
        <span>{{ menu.menu.displayName }}</span>
      </span>
    </tooltip>
  </a-menu-item>
  <a-sub-menu :key="menuId" :class="[isSelected ? 'ant-menu-submenu-selected' : '']" v-else>
    <template #title>
      <div @click.stop="onSubMenuClick">
        <span v-if="!menu.menu.parent && menu.menu.icon" class="anticon">
          <i aria-hidden="true" class="iconfont" style="margin-right: 10px" :class="`icon${menu.menu.icon}`" />
        </span>
        <span>{{ menu.menu.displayName }}</span>
      </div>
    </template>
    <template #expandIcon>
      <i class="iconfont oinone-zhankai2" />
    </template>
    <menu-item v-for="m in menu.children" :key="m.menu.id" :menu="m"></menu-item>
  </a-sub-menu>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { Menu, Tooltip } from 'ant-design-vue';

export default defineComponent({
  name: 'MenuItem',
  props: ['menu', 'selectKeys'],
  components: {
    ASubMenu: Menu.SubMenu,
    AMenuItem: Menu.Item,
    Tooltip
  },
  emits: ['subMenuSelected'],
  setup(props, context) {
    const menuId = computed(() => {
      return props.menu?.menu?.name;
    });

    const isSelected = computed(() => {
      const { selectKeys = [] } = props;
      return menuId.value === selectKeys[0];
    });

    const onSubMenuClick = () => {
      context.emit('subMenuSelected', menuId.value);
    };

    return {
      menuId,
      isSelected,
      onSubMenuClick
    };
  }
});
</script>

<style lang="scss" scoped>
.title {
  position: relative;
  top: 24px;
  left: 20px;

  .iconfont {
    margin-right: 12px;
  }
}
</style>
