import { RuntimeViewAction } from '@oinone/kunlun-engine';
import { IMenu, IViewAction } from '@oinone/kunlun-meta';
import { CastHelper, TreeHelper, TreeNode } from '@oinone/kunlun-shared';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';

export interface IResolvedMenu {
  value: IMenu;
  children: IResolvedMenu[];
  key?: string;
  title?: string;
}

const MASK_CLASS = 'k-m-layout-mask';
const COLLAPSED_CLASS = 'collapsed';

export function resolveMenu(menus: IMenu[]): IResolvedMenu[] {
  const root: OioTreeNode<IMenu>[] = TreeHelper.convert(
    menus,
    (menu) => menu.name,
    (menu) => menu.parentName,
    undefined,
    (key, value: IMenu | undefined, parent) => {
      const node = TreeNode.newInstance(key, value, CastHelper.cast(parent)) as OioTreeNode<IMenu>;
      node.title = value?.displayName;
      return node;
    },
    (node) => {
      node.title = node.value?.displayName;
      return node;
    }
  );
  return root;
}

export function findSelectKeyByAction(menus: IResolvedMenu[], action: string): string | undefined {
  return findSelectMenuByAction(menus, action)?.key;
}

export function findSelectMenuByAction(menus: IResolvedMenu[], action: string): IResolvedMenu | undefined {
  for (const menu of menus) {
    const { value, children } = menu;
    const actionName = value?.viewAction?.name;
    if (actionName && actionName === action) {
      return menu;
    }
    if (children) {
      const targetMenu = findSelectMenuByAction(children, action);
      if (targetMenu) {
        return targetMenu;
      }
    }
  }
}

export function findPathArrByMenus(menus: IResolvedMenu[], selectedKey: string): IMenu[] {
  const resultMenus: IMenu[] = [];
  menus.forEach((menu) => findPathArrByMenuItem(resultMenus, menu, selectedKey));
  return resultMenus;
}

function findPathArrByMenuItem(resultMenus: IMenu[], resolvedMenu: IResolvedMenu, selectedKey: string): boolean {
  if (resolvedMenu.value.name === selectedKey) {
    resultMenus.splice(0, 0, resolvedMenu.value);
    return true;
  }
  for (const menu of resolvedMenu.children) {
    if (findPathArrByMenuItem(resultMenus, menu, selectedKey)) {
      resultMenus.splice(0, 0, resolvedMenu.value);
      return true;
    }
  }
  return false;
}

export function fetchBreadcrumbCurrentViewTitle(viewAction: IViewAction | RuntimeViewAction | undefined) {
  const resView = viewAction?.resView;
  return viewAction?.title || resView?.title || resView?.name;
}

/**
 * 菜单收起util类
 * 菜单收起后统一处理appSwitcher menu对应的变化
 * */
export function maskCollapsed(collapsed: boolean) {
  const maskElement = document.getElementsByClassName(MASK_CLASS)[0];
  if (!maskElement) {
    throw new Error('mask element not found');
  }
  if (collapsed) {
    maskElement.className = `${MASK_CLASS} ${COLLAPSED_CLASS}`;
  } else {
    maskElement.className = `${MASK_CLASS}`;
  }
}
