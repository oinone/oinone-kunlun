<template>
  <div class="menu-wrapper">
    <div class="menu-content">
      <a-menu
        class="menu"
        :class="[mode === 'horizontal' && 'menu-horizontal-line-height']"
        :mode="mode"
        :inline-collapsed="collapsed"
        :selectedKeys="selectKeys"
        :openKeys="openKeys"
        @select="onMenuSelected"
        @openChange="openChange"
      >
        <menu-item
          v-for="menu in menus"
          :key="menu.menu && menu.menu.id"
          :menu="menu"
          :selectKeys="selectKeys"
          @subMenuSelected="onSubMenuSelected"
        ></menu-item>
      </a-menu>
    </div>

    <div class="collapsed" :class="[collapsed && 'close']" @click="onChangeCollapsed">
      <i class="d-iconfont oinone-shouqicaidan"></i>
      <span>{{ translateValueByKey('点击收起菜单') }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { executeViewAction, RedirectTargetEnum } from '@kunlun/engine';
import { translateValueByKey } from '@kunlun/engine';
import { IMenu } from '@kunlun/meta';
import { CastHelper } from '@kunlun/shared';
import { useMatched, useRouter } from '@kunlun/vue-router';
import { Menu as AMenu } from 'ant-design-vue';
import { defineComponent, onMounted, ref } from 'vue';
import { getIFrameMenus } from '../service';
import MenuItem from './MenuItem.vue';

interface IResolvedMenu {
  menu: IMenu;
  children: IResolvedMenu[];
}

export default defineComponent({
  props: {
    collapsed: {
      type: Boolean,
      default: undefined
    },
    onMenuCollapsedChange: {
      type: Function
    }
  },
  components: {
    AMenu,
    MenuItem
  },
  setup(props) {
    const menus = ref(<IResolvedMenu[]>[]);
    const menuArray = ref<IMenu[]>([]);
    const mode = ref('inline');
    const selectKeys = ref<string[]>([]);
    const openKeys = ref<string[]>([]);

    const resolvedMenus = new Map();
    let router = null as any;
    let matchedInstance = null as any;
    let rootSubmenuKeys: string[] = [];

    onMounted(async () => {
      router = useRouter().router;
      const { matched } = useMatched();
      matchedInstance = matched;
      //FIXME 取菜单数据
      const module = await getIFrameMenus();
      menuArray.value = module.allMenus;
      rootSubmenuKeys = module.allMenus.map((m) => m.id);
      module.allMenus.forEach((menu) => resolveMenu(menu));
    });

    const openChange = (keys: string[]) => {
      const latestOpenKey = keys.find((key) => openKeys.value.indexOf(key) === -1);
      if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
        openKeys.value = keys;
      } else {
        openKeys.value = latestOpenKey ? [latestOpenKey] : [];
      }
    };

    const onChangeCollapsed = () => {
      props.onMenuCollapsedChange?.(false);
    };

    const resolveMenu = (menu: IMenu & { resolved?: boolean }) => {
      if (menu.resolved) {
        return resolvedMenus.get(menu.id)!;
      }

      if (!menu.parent) {
        const resolved: IResolvedMenu = { menu, children: [] };
        resolvedMenus.set(menu.id, resolved);
        menus.value.push(resolved);
        menu.resolved = true;
        return resolved;
      }

      const resolved: IResolvedMenu = { menu, children: [] };
      menu.resolved = true;
      resolvedMenus.set(menu.id, resolved);

      const parentId = menu.parent.id;
      const parent = menuArray.value.find((m) => m.id === parentId)!;
      if (parent) {
        const resolvedParent = resolveMenu(parent)!;
        resolvedParent.children.push(resolved);
      }
      return resolved;
    };

    const onMenuSelected = ({ key }) => {
      const menu = menuArray.value.find((m) => m.id === key)!;
      if (menu.viewAction) {
        return executeViewAction(
          CastHelper.cast(menu.viewAction),
          router,
          matchedInstance,
          {},
          RedirectTargetEnum.BLANK
        );
      }

      const path: IMenu[] = [];
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const includePath = (node: IResolvedMenu, key: string) => {
        if (node.menu.id === key) {
          return true;
        }
        if (!node.children.length) {
          return false;
        }
        return node.children.map((c) => includePath(c, key)).includes(true);
      };
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const findPath = (node: IResolvedMenu, key: string) => {
        if (includePath(node, key)) {
          path.push(node.menu);
          if (node.children.length) {
            node.children.forEach((n) => findPath(n, key));
          }
        }
      };
      menus.value.forEach((m) => findPath(m, selectKeys.value[0]));
    };

    const onSubMenuSelected = (key) => {
      onMenuSelected(key);
    };

    return {
      menus,
      selectKeys,
      openKeys,
      mode,
      openChange,
      onChangeCollapsed,
      onMenuSelected,
      onSubMenuSelected,
      translateValueByKey
    };
  }
});
</script>
