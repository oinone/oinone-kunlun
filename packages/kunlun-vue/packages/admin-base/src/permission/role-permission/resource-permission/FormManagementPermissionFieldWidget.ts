import { SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { FormFieldWidget } from '../../../basic';
import { TreeData } from '../../../typing';
import {
  AnyPermissionNode,
  isActionPermissionNode,
  isHomepagePermissionNode,
  isMenuPermissionNode,
  isModulePermissionNode,
  PermissionNode,
  ResourcePermissionSubtypeEnum
} from '../../types';
import { FormResourcePermissionFieldWidget } from './FormResourcePermissionFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'management-permission'
  })
)
export class FormManagementPermissionFieldWidget extends FormResourcePermissionFieldWidget {
  protected resolvePermissionNodes(
    permissionNodes: AnyPermissionNode[],
    parent?: OioTreeNode<TreeData>,
    isSkipAction?: boolean
  ): OioTreeNode<TreeData>[] {
    const nodes: OioTreeNode<TreeData>[] = [];
    for (const permissionNode of permissionNodes) {
      let node: OioTreeNode<TreeData> | undefined;
      let isSkipNextAction = false;
      if (isModulePermissionNode(permissionNode)) {
        node = this.resolveModulePermissionNode(permissionNode, parent);
        isSkipNextAction = true;
      } else if (isHomepagePermissionNode(permissionNode)) {
        node = this.resolveHomepagePermissionNode(permissionNode, parent);
        isSkipNextAction = true;
      } else if (isMenuPermissionNode(permissionNode)) {
        node = this.resolveMenuPermissionNode(permissionNode, parent);
        isSkipNextAction = true;
      } else if (isActionPermissionNode(permissionNode)) {
        if (isSkipAction) {
          if (parent) {
            parent.isLeaf = true;
          }
        } else {
          node = this.resolveActionPermissionNode(permissionNode, parent);
          if (permissionNode.nodeType === ResourcePermissionSubtypeEnum.VIEW_ACTION) {
            isSkipNextAction = true;
          }
        }
      } else {
        node = this.resolvePermissionNode(permissionNode, parent);
      }
      if (node) {
        nodes.push(node);
        const { nodes: children } = permissionNode;
        if (children?.length) {
          this.resolvePermissionNodes(children, node, isSkipNextAction);
        }
      }
    }
    return nodes;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    const updateValue =
      value?.map((v) => ({
        ...v,
        canManagement: !v.canManagement
      })) || [];
    return SubmitHandler.DEFAULT(field, itemName, submitValue, updateValue);
  }

  protected resolveCheckedKeys(treeNode: OioTreeNode<TreeData>, node: PermissionNode) {
    const { path, canManagement, canAllot } = node;
    if (canManagement) {
      this.checkedKeys?.push(path);
    }
    const disabled = !canAllot;
    treeNode.disabled = disabled;
    treeNode.selectable = disabled;
  }
}
