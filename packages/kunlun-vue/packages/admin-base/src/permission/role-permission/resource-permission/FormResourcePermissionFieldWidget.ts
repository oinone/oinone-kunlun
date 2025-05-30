import { ActiveRecord, MemoryListSearchCache, SubmitHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { TreeNode, uniqueKeyGenerator } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { OioTreeNode } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormM2MTreeFieldWidget } from '../../../field';
import { TreeData, TreeNodeMetadata } from '../../../typing';
import {
  ActionPermissionNode,
  AnyPermissionNode,
  AuthResourcePermissionItem,
  HomepagePermissionNode,
  isActionPermissionNode,
  isHomepagePermissionNode,
  isMenuPermissionNode,
  isModulePermissionNode,
  MenuPermissionNode,
  ModulePermissionNode,
  PermissionNode
} from '../../types';

type TreeNodeSearchFilter = (node: OioTreeNode<TreeData>, keywords: string) => boolean;

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'resource-permission'
  })
)
export class FormResourcePermissionFieldWidget extends FormM2MTreeFieldWidget {
  protected initCheckedKeysCache: MemoryListSearchCache<string, string> | undefined;

  protected generatorDefaultTreeDefinition(props): TreeNodeMetadata | undefined {
    return {
      key: uniqueKeyGenerator(),
      model: this.field.references
    };
  }

  @Widget.Reactive()
  protected get checkStrictly() {
    return true;
  }

  @Widget.Method()
  protected async onChecked(node: OioTreeNode<TreeData>, selected: boolean): Promise<void> {
    let currentSelectedValue = this.getCurrentSelectedValue();
    let isChange = false;
    const { key } = node;
    const initSelected = !!this.initCheckedKeysCache?.get(key);
    if (selected !== initSelected) {
      if (!currentSelectedValue.some((v) => v.key === key)) {
        currentSelectedValue = [...currentSelectedValue, node];
        isChange = true;
      }
    } else {
      const ubs = currentSelectedValue.length;
      currentSelectedValue = currentSelectedValue.filter((v) => v.key !== key);
      if (ubs !== currentSelectedValue.length) {
        isChange = true;
      }
    }
    if (isChange) {
      this.selectedValue = currentSelectedValue;
      this.$onSelectedChange(currentSelectedValue);
    }
  }

  @Widget.Method()
  protected nodeCheckedAll(node: OioTreeNode<TreeData>) {
    return true;
  }

  @Widget.Method()
  public onNodeCheckedAll(node: OioTreeNode<TreeData>, selected: boolean) {
    let currentSelectedValue = this.getCurrentSelectedValue();
    const targetSelectedValues = this.collectionSelectedAllNodes(node);
    let isChange = false;
    const targetCheckedKeys: string[] = [];
    for (const targetSelectedValue of targetSelectedValues) {
      const { key } = targetSelectedValue;
      const initSelected = !!this.initCheckedKeysCache?.get(key);
      if (selected !== initSelected) {
        if (!currentSelectedValue.some((v) => v.key === key)) {
          currentSelectedValue = [...currentSelectedValue, targetSelectedValue];
          isChange = true;
        }
      } else {
        const ubs = currentSelectedValue.length;
        currentSelectedValue = currentSelectedValue.filter((v) => v.key !== key);
        if (ubs !== currentSelectedValue.length) {
          isChange = true;
        }
      }
      targetCheckedKeys.push(key);
    }
    if (isChange) {
      let currentCheckedKeys = this.checkedKeys;
      if (!currentCheckedKeys) {
        currentCheckedKeys = [];
      }
      if (selected) {
        currentCheckedKeys = [...currentCheckedKeys, ...targetCheckedKeys];
      } else {
        const targetCheckedKeysSet = new Set(targetCheckedKeys);
        currentCheckedKeys = currentCheckedKeys.filter((v) => !targetCheckedKeysSet.has(v));
      }
      this.onUpdateCheckedKeys(currentCheckedKeys);
      this.selectedValue = currentSelectedValue;
      this.$onSelectedChange(currentSelectedValue);
    }
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    const updateValue =
      value?.map((v) => ({
        ...v,
        canAccess: !v.canAccess
      })) || [];
    return SubmitHandler.DEFAULT(field, itemName, submitValue, updateValue);
  }

  protected async reloadBackfillDataByValue(): Promise<void> {
    const { rootNode, formData } = this;
    if (!rootNode || rootNode.loaded) {
      return;
    }
    this.enableLoadData = false;
    const { nodesJson } = formData;
    if (!nodesJson) {
      return;
    }
    rootNode.loaded = true;
    this.checkedKeys = [];
    const permissionNodes = JSON.parse(nodesJson as string) as AnyPermissionNode[];
    let nodes: OioTreeNode<TreeData>[] = [];
    if (permissionNodes.length) {
      nodes = this.resolvePermissionNodes(permissionNodes);
    }
    for (const node of nodes) {
      node.setParent!(rootNode);
    }
    this.initCheckedKeysCache = new MemoryListSearchCache<string, string>([...this.checkedKeys], (v) => v);
  }

  @Widget.Method()
  protected onSearch(keywords: string) {
    const { rootNode } = this;
    if (!rootNode?.loaded) {
      return;
    }
    if (!keywords) {
      this.searchRootNode = undefined;
      return;
    }
    const newRootNode = this.generatorRootNode({
      key: uniqueKeyGenerator(),
      model: this.field.references
    });
    newRootNode.loaded = true;
    const { expandedKeys, nodes } = this.generatorSearchRootNodes(newRootNode, rootNode.children || [], keywords);
    newRootNode.children = nodes;
    this.searchRootNode = newRootNode;
    this.onUpdateExpandedKeys(expandedKeys);
  }

  protected generatorSearchRootNodes(
    parentNode: OioTreeNode<TreeData>,
    nodes: OioTreeNode<TreeData>[],
    keywords: string,
    filter?: TreeNodeSearchFilter
  ): { expandedKeys: string[]; nodes: OioTreeNode<TreeData>[] } {
    const expandedKeys: string[] = [];
    return {
      expandedKeys,
      nodes: this.generatorSearchRootNodes0(
        expandedKeys,
        parentNode,
        nodes,
        keywords,
        filter || this.defaultSearchRootNodesFilter
      )
    };
  }

  protected defaultSearchRootNodesFilter(node: OioTreeNode<TreeData>, keywords: string): boolean {
    const { label } = node.value;
    if (!label) {
      return false;
    }
    return label.includes(keywords);
  }

  protected generatorSearchRootNodes0(
    expandedKeys: string[],
    parentNode: OioTreeNode<TreeData>,
    nodes: OioTreeNode<TreeData>[],
    keywords: string,
    filter: TreeNodeSearchFilter
  ): OioTreeNode<TreeData>[] {
    const targetNodes: OioTreeNode<TreeData>[] = [];
    for (const node of nodes) {
      const { key, children } = node;
      const cloneNode: OioTreeNode<TreeData> = {
        ...node,
        parent: parentNode,
        setParent: node.setParent,
        isLeaf: true,
        children: []
      };
      let targetChildren: OioTreeNode<TreeData>[] | undefined;
      if (children.length) {
        targetChildren = this.generatorSearchRootNodes0(expandedKeys, cloneNode, children, keywords, filter);
      }
      if (filter(cloneNode, keywords)) {
        cloneNode.isLeaf = !children.length;
        cloneNode.children = children;
        targetNodes.push(cloneNode);
      } else if (targetChildren?.length) {
        cloneNode.isLeaf = false;
        cloneNode.children = targetChildren;
        targetNodes.push(cloneNode);
        expandedKeys.push(key);
      }
    }
    return targetNodes;
  }

  protected resolvePermissionNodes(
    permissionNodes: AnyPermissionNode[],
    parent?: OioTreeNode<TreeData>
  ): OioTreeNode<TreeData>[] {
    const nodes: OioTreeNode<TreeData>[] = [];
    for (const permissionNode of permissionNodes) {
      let node: OioTreeNode<TreeData> | undefined;
      if (isModulePermissionNode(permissionNode)) {
        node = this.resolveModulePermissionNode(permissionNode, parent);
      } else if (isHomepagePermissionNode(permissionNode)) {
        node = this.resolveHomepagePermissionNode(permissionNode, parent);
      } else if (isMenuPermissionNode(permissionNode)) {
        node = this.resolveMenuPermissionNode(permissionNode, parent);
      } else if (isActionPermissionNode(permissionNode)) {
        node = this.resolveActionPermissionNode(permissionNode, parent);
      } else {
        node = this.resolvePermissionNode(permissionNode, parent);
      }
      if (node) {
        nodes.push(node);
        const { nodes: children } = permissionNode;
        if (children?.length) {
          this.resolvePermissionNodes(children, node);
        }
      }
    }
    return nodes;
  }

  protected resolveModulePermissionNode(
    node: ModulePermissionNode,
    parent?: OioTreeNode<TreeData>
  ): OioTreeNode<TreeData> | undefined {
    return this.resolvePermissionNode(node, parent);
  }

  protected resolveHomepagePermissionNode(
    node: HomepagePermissionNode,
    parent?: OioTreeNode<TreeData>
  ): OioTreeNode<TreeData> | undefined {
    return this.resolvePermissionNode(node, parent);
  }

  protected resolveMenuPermissionNode(
    node: MenuPermissionNode,
    parent?: OioTreeNode<TreeData>
  ): OioTreeNode<TreeData> | undefined {
    return this.resolvePermissionNode(node, parent);
  }

  protected resolveActionPermissionNode(
    node: ActionPermissionNode,
    parent?: OioTreeNode<TreeData>
  ): OioTreeNode<TreeData> | undefined {
    const treeNode = this.resolvePermissionNode(node, parent);
    if (treeNode) {
      const { displayValue, action } = node;
      treeNode.title = `${displayValue} - ${action}`;
    }
    return treeNode;
  }

  protected resolvePermissionNode(
    node: PermissionNode,
    parent?: OioTreeNode<TreeData>
  ): OioTreeNode<TreeData> | undefined {
    const { path, displayValue, hasNext } = node;
    const data = this.generatorResourcePermissionItem(node);
    const treeNode = this.generatorTreeNode(
      path || node.id,
      {
        label: displayValue,
        metadata: this.treeDefinition!,
        isLeaf: !hasNext,
        data: data as ActiveRecord
      },
      parent
    );
    this.resolveCheckedKeys(treeNode, node);
    return treeNode;
  }

  protected generatorResourcePermissionItem(node: PermissionNode): AuthResourcePermissionItem {
    const { path, nodeType, resourceId, canAccess, canManagement, canDesign } = node;
    return {
      resourceId,
      subtype: nodeType,
      path,
      canAccess,
      canManagement,
      canDesign
    };
  }

  protected resolveCheckedKeys(treeNode: OioTreeNode<TreeData>, node: PermissionNode) {
    const { path, canAccess, canAllot } = node;
    if (canAccess) {
      this.checkedKeys?.push(path);
    }
    const disabled = !canAllot;
    treeNode.disabled = disabled;
    treeNode.selectable = disabled;
  }

  protected generatorTreeNode(key: string, value: TreeData, parent?: OioTreeNode<TreeData>): OioTreeNode<TreeData> {
    const node = TreeNode.newInstance(
      key,
      value,
      parent as unknown as TreeNode<TreeData>
    ) as unknown as OioTreeNode<TreeData>;
    node.title = value.label;
    node.loaded = true;
    node.isLeaf = !!value.isLeaf;
    return node;
  }
}
