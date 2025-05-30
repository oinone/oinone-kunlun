import { SPI } from '@kunlun/spi';
import { http } from '@kunlun/service';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';

import Component from './DefaultTreePermission.vue';

const genActionTree = (node) => {
  let children = [];

  if (node.nodes) {
    children = node.nodes.map((n) => genActionTree(n));
  }

  return {
    ...node,
    key: node.uniqueId,
    uniqueId: node.uniqueId,
    title: `${node.displayValue}    ${node.value}`,
    children,
    nodes: []
  };
};

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'default-tree-permission' }))
export class DefaultTreePermissionWidget extends FormFieldWidget {
  public initialize(props): this {
    super.initialize(props);
    this.setComponent(Component);
    return this;
  }

  @Widget.Reactive()
  protected treeData = [];

  @Widget.Reactive()
  protected get groupType() {
    return this.getDsl().groupType || 'RUNTIME';
  }

  @Widget.Watch('formData.id', { immediate: true, deep: true })
  protected fetchNodeByRole(id) {
    if (id) {
      this.fetchTreeData();
    }
  }

  public async fetchTreeData() {
    const body = `{
      interactionPermissionNodeQuery {
        fetchNodeByRole(parameter: {
          roleId: ${this.formData.id}
          groupType: ${this.groupType}
        }) {
          nodesJson
        }
      }
    }`;

    const rst = (await http.query(this.model.moduleName, body)) as any;

    const { nodesJson } = rst.data.interactionPermissionNodeQuery.fetchNodeByRole;
    const data = nodesJson ? JSON.parse(nodesJson) : [];
    this.treeData = data.map((a) => genActionTree(a));
  }
}
