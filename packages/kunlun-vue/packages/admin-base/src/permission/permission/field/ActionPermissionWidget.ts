import { RuntimeO2MField } from '@kunlun/engine';
import { ModelType, ViewType } from '@kunlun/meta';
import { getModel, http } from '@kunlun/service';
import { CallChaining } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { Tree as ATree } from 'ant-design-vue';
import { FormFieldWidget } from '../../../basic';
import { IPermission } from '../type';

interface ITreeNode {
  title: string;
  key: string;
  children: ITreeNode[];
  isLeaf: boolean;
  parentValue?: string;
}

enum NodeType {
  MENU = 'MENU',
  MODULE = 'MODULE',
  SERVER_ACTION = 'SERVER_ACTION',
  VIEW_ACTION = 'VIEW_ACTION',
  URL_ACTION = 'URL_ACTION'
}

interface IActionPermission {
  value: string;
  node: ITreeNode;
  module: string;
  nodeType: NodeType;
  hasNext: boolean;
  model: string;
  resModel?: string;
  displayValue: string;
  canAccess: boolean;
  change: boolean;
}

interface Menu {
  name: string;
  module: string;
}

interface AntdTreeParentNode {
  node: ITreeNode;
  parent: AntdTreeParentNode;
}

interface AntdTreeNode {
  dataRef: ITreeNode;
  parent: AntdTreeParentNode;
}

let counter = 0;

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'action-permission' }))
export class ActionPermissionWidget extends FormFieldWidget<unknown, RuntimeO2MField> {
  @Widget.Reactive()
  private class = 'oio-tree';

  public initialize(props) {
    super.initialize(props);
    this.setComponent(ATree);
    return this;
  }

  /**
   * 挂载时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  private get checkable() {
    return !this.disabled;
  }

  @Widget.Reactive()
  private selectable = false;

  @Widget.Reactive()
  public get disabled() {
    return this.viewType === ViewType.Detail;
  }

  @Widget.Reactive()
  private treeData: ITreeNode[] = [];

  @Widget.Reactive()
  private permissions: IActionPermission[] = [];

  @Widget.Reactive()
  private checkedKeys: { checked: string[]; halfChecked: string[] } = { checked: [], halfChecked: [] };

  private async queryNextNode(node?: AntdTreeNode): Promise<IActionPermission[]> {
    const data = node?.dataRef;
    const pnode = data && this.permissions.find((p) => p.node.key === data.key);
    const queryObject: { roleId?: string; value?: string; module?: string; nodeType?: string } = {};
    if (this.formData.id) {
      queryObject.roleId = this.formData.id as string;
    }
    if (pnode) {
      queryObject.module = pnode.module;
      queryObject.nodeType = pnode.nodeType;
      queryObject.value = pnode.value;
    }
    const queryStr = `{
      interactionPermissionNodeQuery {
        nextNode(interactionPermissionNode: {${Object.keys(queryObject)
          .map((name) => {
            const queryValue = queryObject[name];
            if (name === 'nodeType') {
              const parameterString = `${name}:${queryValue}`;
              if (queryValue === NodeType.VIEW_ACTION) {
                let menu = node?.parent;
                while (menu) {
                  const finalMenu = menu;
                  const target = this.permissions.find((p) => p.node.key === finalMenu.node.key);
                  if (!target) {
                    break;
                  }
                  if (target.nodeType === NodeType.MENU) {
                    return `${parameterString},menuName: "${target.value}"`;
                  }
                  menu = menu.parent;
                }
              }
              return parameterString;
            }
            return `${name}:"${queryValue}"`;
          })
          .join(',')}}) {
          nodes {
            model
            resModel
            value
            displayValue
            module
            canAccess
            nodeType
            hasNext
          }
        }
      }
    }`;
    return (
      ((await http.query('auth', queryStr)).data.interactionPermissionNodeQuery.nextNode
        .nodes as IActionPermission[]) || []
    );
  }

  private resolvePermissions(nodes: IActionPermission[], parentTreeNode?: ITreeNode) {
    const parentPermission = parentTreeNode && this.permissions.find((an) => an.node.key === parentTreeNode.key)!;
    // 如果父节点存在且父节点状变化了则删除父节点的权限
    if (parentTreeNode && !parentPermission!.change) {
      let index = this.checkedKeys.checked.findIndex((c) => c === parentTreeNode.key);
      if (index !== -1) {
        this.checkedKeys.checked.splice(index, 1);
      }
      index = this.checkedKeys.halfChecked.findIndex((c) => c === parentTreeNode.key);
      if (index !== -1) {
        this.checkedKeys.halfChecked.splice(index, 1);
      }
    }
    // 如果节点有权限（后端返回的初始化数据）或者是被选中
    nodes
      .filter((n) => n.canAccess || !this.disabled)
      .forEach((n) => {
        let parentValue = '';
        if (n.nodeType === NodeType.MENU || n.nodeType === NodeType.MODULE) {
          parentValue = n.value;
        } else {
          parentValue = parentTreeNode ? parentTreeNode.parentValue! : '';
        }

        const treeNode: ITreeNode = {
          title:
            n.nodeType === NodeType.MENU || n.nodeType === NodeType.MODULE
              ? `${n.displayValue}`
              : `${n.displayValue} ${n.value}`,
          children: [],
          key: `${n.module}-${n.model}-${n.value}-${counter++}`,
          isLeaf: !n.hasNext,
          parentValue
        };
        n.node = treeNode;
        if (parentTreeNode) {
          parentTreeNode.children.push(treeNode);
        } else {
          this.treeData.push(treeNode);
        }
        this.permissions.push(n);
        if (n.canAccess) {
          if (!parentPermission || parentPermission.canAccess) {
            this.checkedKeys.checked.push(n.node.key);
            if (parentTreeNode) {
              this.checkedKeys.halfChecked.push(parentPermission!.node.key);
            }
          } else {
            n.canAccess = false;
          }
        }
      });
  }

  public async fetchData() {
    const permissions = await this.queryNextNode();
    this.resolvePermissions(permissions);
  }

  @Widget.Method()
  private onCheck(
    checkedKeys: string[],
    info: { halfCheckedKeys: string[]; node: { dataRef: ITreeNode }; checked: boolean }
  ) {
    this.checkedKeys.checked = checkedKeys;
    this.checkedKeys.halfChecked = info.halfCheckedKeys;
    const anode = this.permissions.find((p) => p.node.key === info.node.dataRef.key);
    anode!.canAccess = info.checked;
    anode!.change = true;

    this.customCheck(anode!);
    this.forceUpdate();
  }

  private customCheck(node: IActionPermission) {
    // if (node.nodeType === 'VIEW_ACTION') {
    //   // 此处是推断 修改前后端协议由后端推断
    //   // if (node.value === 'redirectCreatePage') {
    //   //   const sn = this.permissions.find(
    //   //     (p) => p.model === node.model && p.module === node.module && p.value === 'create',
    //   //   )!;
    //   //   sn.canAccess = node.canAccess;
    //   // }
    //   // if (node.value === 'redirectUpdatePage') {
    //   //   const sn = this.permissions.find(
    //   //     (p) => p.model === node.model && p.module === node.module && p.value === 'update',
    //   //   )!;
    //   //   sn.canAccess = node.canAccess;
    //   // }
    // const menu = this.permissions.find(
    //   (p) => p.module === node.module && `${p.module}#${p.value}` === node.value && p.nodeType === 'MENU'
    // );
    //   if (!node.canAccess && menu) {
    //     menu.node.children
    //       .filter((c) => c.key !== node.node.key)
    //       .forEach((n) => {
    //         let index = this.checkedKeys.checked.findIndex((c) => c === n.key);
    //         this.checkedKeys.checked.splice(index, 1);
    //         index = this.checkedKeys.halfChecked.findIndex((c) => c === n.key);
    //         this.checkedKeys.halfChecked.splice(index, 1);
    //       });
    //     let index = this.checkedKeys.checked.findIndex((c) => c === menu.value);
    //     index !== -1 && this.checkedKeys.checked.splice(index, 1);
    //     index = this.checkedKeys.halfChecked.findIndex((c) => c === menu.value);
    //     index !== -1 && this.checkedKeys.halfChecked.splice(index, 1);
    //     menu.canAccess = false;
    //   }
    // }
    if (node.nodeType === NodeType.MODULE) {
      if (!node.canAccess) {
        this.permissions
          .filter((p) => p.nodeType === NodeType.MENU && p.module === node.module)
          .forEach((p) => {
            p.canAccess = false;
          });
      }
    }
  }

  @Widget.Method()
  private async loadData(node: AntdTreeNode): Promise<void> {
    const permissions = await this.queryNextNode(node);
    this.resolvePermissions(permissions, node.dataRef);
    this.treeData = [...this.treeData];
  }

  private async queryAllMenus() {
    const queryStr = `query {
      interactionPermissionQuery {
        menuData(interactionPermission: {${this.formData.id ? `roleId:"${this.formData.id}"` : ''}}) {
          menus {
            id
            name
            module
          }
        }
      }
    }`;
    return (await (
      await http.query('auth', queryStr)
    ).data.interactionPermissionQuery.menuData.menus) as {
      id: string;
      name: string;
      module: string;
    }[];
  }

  public async submit() {
    this.permissions.forEach((p) => {
      const isHalfChecked = this.checkedKeys.halfChecked.find((key) => p.node.key === key)!;
      const isChecked = this.checkedKeys.checked.find((key) => p.node.key === key)!;

      const isNotChecked =
        (isHalfChecked === null || undefined === isHalfChecked) && (isChecked === null || undefined === isChecked);
      if (!isNotChecked) {
        p.canAccess = true;
        this.customCheck(p);
      } else {
        p.canAccess = false;
      }
    });
    // this.checkedKeys.halfChecked.forEach((key) => {
    //   const n = this.permissions.find((p) => p.node.key === key)!;
    //   n.canAccess = true;
    //   this.customCheck(n);
    // });
    // this.checkedKeys.checked.forEach((key) => {
    //   const n = this.permissions.find((p) => p.node.key === key)!;
    //   n.canAccess = true;
    //   this.customCheck(n);
    // });
    await Promise.all(
      this.permissions
        .filter((p) => p.resModel)
        .map(async (p) => {
          if (p.nodeType === NodeType.VIEW_ACTION) {
            if (p.resModel !== p.model) {
              const resModel = await getModel(p.resModel!);
              if (resModel.type === ModelType.TRANSIENT) {
                resModel.viewActionList!.forEach((va) => {
                  const pva = this.permissions.find(
                    (_p) => _p.value === va.name && _p.model === va.model && _p.module === va.module!
                  );
                  if (!pva) {
                    this.permissions.push({
                      value: va.name,
                      model: va.model,
                      module: va.module!,
                      nodeType: NodeType.VIEW_ACTION,
                      hasNext: false,
                      displayValue: va.displayName!,
                      canAccess: true,
                      node: {} as ITreeNode,
                      change: false
                    });
                  }
                });
                resModel.serverActionList!.forEach((va) => {
                  const pva = this.permissions.find(
                    (_p) => _p.value === va.name && _p.model === va.model && _p.module === va.module!
                  );
                  if (!pva) {
                    this.permissions.push({
                      value: va.name,
                      model: va.model,
                      module: va.module!,
                      nodeType: NodeType.SERVER_ACTION,
                      hasNext: false,
                      displayValue: va.displayName!,
                      canAccess: true,
                      node: {} as ITreeNode,
                      change: false
                    });
                  }
                });
                resModel.urlActionList!.forEach((va) => {
                  const pva = this.permissions.find(
                    (_p) => _p.value === va.name && _p.model === va.model && _p.module === va.module!
                  );
                  if (!pva) {
                    this.permissions.push({
                      value: va.name,
                      model: va.model,
                      module: va.module!,
                      nodeType: NodeType.URL_ACTION,
                      hasNext: false,
                      displayValue: va.displayName!,
                      canAccess: true,
                      node: {} as ITreeNode,
                      change: false
                    });
                  }
                });
              }
            }
          }
        })
    );
    const lastedMenus = await this.queryAllMenus();
    const menus: Menu[] = lastedMenus
      .filter((m) => {
        const node = this.permissions.find((p) => p.value === m.name && p.module === m.module);
        const currentModule = this.permissions.find((p) => p.nodeType === NodeType.MODULE && p.value === m.module);
        if (node && node.canAccess) {
          return currentModule!.canAccess;
        }
        return currentModule && currentModule.canAccess;
      })
      .filter((m) => {
        const node = this.permissions.find(
          (p) => p.value === m.name && p.module === m.module && p.nodeType === NodeType.MENU
        );
        return !(node && !node.canAccess);
      });
    this.permissions
      .filter((p) => p.nodeType === NodeType.MENU && p.canAccess)
      .forEach((p) => {
        if (!menus.find((m) => m.module === p.module && m.name === p.value)) {
          menus.push({ module: p.module, name: p.value });
        }
      });
    const modules = this.permissions
      .filter((p) => p.nodeType === NodeType.MODULE)
      .filter((p) => p.canAccess)
      .filter((p) => {
        return !!(
          this.checkedKeys.checked.find((c) => c === p.node.key) ||
          this.checkedKeys.halfChecked.find((c) => c === p.node.key)
        );
      });
    const ap = this.permissions
      .filter((p) => p.canAccess)
      .filter(
        (p) =>
          p.nodeType === NodeType.VIEW_ACTION ||
          p.nodeType === NodeType.SERVER_ACTION ||
          p.nodeType === NodeType.URL_ACTION
      )
      .filter((p) => {
        return !!this.checkedKeys.checked.find((c) => c === p.node.key);
      });

    return {
      menus,
      modules,
      actionPermissions: ap.map(
        (p) =>
          ({
            name: `页面配置#${this.formData.name}#${p.value}#${p.model}#${p.nodeType}`,
            permissionType: 'ACTION',
            model: p.model,
            permRun: true,
            action: p.value,
            permissionDataSource: 'CUSTOM',
            permissionMateDataType: p.nodeType,
            active: true,
            menuName: p.node.parentValue
          } as IPermission)
      )
    };
  }

  protected async mountedProcess(): Promise<void> {
    await this.fetchData();
  }

  protected mounted() {
    this.mountedCallChaining?.hook(this.path, async () => {
      await this.mountedProcess();
    });
  }

  protected unmounted() {
    this.mountedCallChaining?.unhook(this.path);
  }
}
