import { ModuleCache } from '@kunlun/engine';
import { IMenu } from '@kunlun/meta';
import { Comparator, TreeHelper, TreeNode } from '@kunlun/shared';
import { MenuUrlParameters, RuntimeMenu } from '../typing';

const defaultCompareFunction: Comparator<TreeNode<RuntimeMenu>> = (a, b) => {
  const ap = a.value?.priority;
  const bp = b.value?.priority;
  if (ap == null || bp == null) {
    return 0;
  }
  return Number(ap) - Number(bp);
};

export class MenuService {
  public static async queryMenus(moduleName: string): Promise<IMenu[]> {
    const module = await ModuleCache.get(moduleName);
    if (module) {
      return module.allMenus || [];
    }
    return [];
  }

  public static convert(menus: IMenu[]): TreeNode<RuntimeMenu>[] {
    const nodes: TreeNode<RuntimeMenu>[] = TreeHelper.convert(
      menus,
      (v) => v.name,
      (v) => v.parentName,
      (v) => {
        const runtimeValue = v as RuntimeMenu;
        runtimeValue.title = v.displayName || v.name;
        return runtimeValue;
      }
    );
    return MenuService.clearInvalidNodes(nodes);
  }

  protected static clearInvalidNodes(nodes: TreeNode<RuntimeMenu>[]): TreeNode<RuntimeMenu>[] {
    return nodes.filter((node) => {
      if (node.value) {
        node.children = MenuService.clearInvalidNodes(node.children);
        return true;
      }
      return false;
    });
  }

  public static sort(nodes: TreeNode<RuntimeMenu>[]): void {
    nodes.sort(defaultCompareFunction);
    for (const node of nodes) {
      MenuService.sort(node.children || []);
    }
  }

  public static findSelectedMenuItemByAction(
    nodes: TreeNode<RuntimeMenu>[],
    action: string
  ): TreeNode<RuntimeMenu> | undefined {
    for (const node of nodes) {
      const { children, value } = node;
      const key = value?.viewAction?.name;
      if (key && key === action) {
        return node;
      }
      if (children && children.length) {
        const selectedMenu = MenuService.findSelectedMenuItemByAction(children, action);
        if (selectedMenu) {
          return selectedMenu;
        }
      }
    }
  }

  public static findSelectedMenuItemByKey(
    nodes: TreeNode<RuntimeMenu>[],
    key: string
  ): TreeNode<RuntimeMenu> | undefined {
    for (const node of nodes) {
      const { key: targetKey, children } = node;
      if (targetKey === key) {
        return node;
      }
      if (children && children.length) {
        const selectedMenu = MenuService.findSelectedMenuItemByKey(children, key);
        if (selectedMenu) {
          return selectedMenu;
        }
      }
    }
  }

  public static generatorMenuUrlParameters(selected: TreeNode<RuntimeMenu>): MenuUrlParameters {
    const selectedKeys: string[] = [selected.key];
    let openKeys: string[] = [];
    let currentNode: TreeNode<RuntimeMenu> | undefined = selected;
    while (currentNode) {
      openKeys = [currentNode.key, ...openKeys];
      currentNode = currentNode.parent;
    }
    return {
      selectedKeys,
      openKeys
    };
  }
}
