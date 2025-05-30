import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { OioTreeNode } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../basic';
import { TreeData } from '../../typing';
import { AbstractTreeElementWidget } from './AbstractTreeElementWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Tree,
    widget: 'tree'
  })
)
export class TreeWidget extends AbstractTreeElementWidget {
  @Widget.Reactive()
  protected showContent = true;

  protected async onNodeSelected(node: OioTreeNode<TreeData>) {
    await this.onSelectedForQuery(node);
  }

  protected async onNodeUnselected(node: OioTreeNode<TreeData>) {
    await this.onUnselected();
  }

  protected async onClearSearch() {
    await this.onUnselected();
  }

  protected async onUnselected() {
    const currentValue = [];
    this.reloadDataSource(currentValue);
    this.reloadActiveRecords(currentValue);
  }

  protected $$mounted() {
    super.$$mounted();
    const currentValue = [];
    this.reloadDataSource(currentValue);
  }
}
