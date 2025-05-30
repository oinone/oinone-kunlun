import { TreeNode } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import { TreeData } from '../../../typing';
import { ActionBarWidget, ActionBarWidgetProps } from './ActionBarWidget';

export interface TreeNodeActionsWidgetProps<V extends TreeData = TreeData> extends ActionBarWidgetProps {
  node: TreeNode<V>;
}

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'TreeNodeActions', inline: true }))
export class TreeNodeActionsWidget<V extends TreeData = TreeData> extends ActionBarWidget<
  TreeNodeActionsWidgetProps<V>
> {
  @Widget.Reactive()
  protected node: TreeNode<V> | undefined;

  public initialize(props: TreeNodeActionsWidgetProps<V>) {
    super.initialize(props);
    const { node } = props;
    this.node = node;
    if (node) {
      this.subPath = node.key;
      this.setCurrentActiveRecords(node.value?.data);
    } else {
      this.setCurrentActiveRecords([{}]);
    }
    return this;
  }
}
