import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { OioTreeNode } from '@kunlun/vue-ui-common';
import { BaseElementWidget } from '../../basic';
import { CardCascaderItemData } from '../../typing';
import { AbstractCardCascaderElementWidget } from './AbstractCardCascaderElementWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: ['card-cascader', 'cardCascader', 'CardCascader']
  })
)
export class TableSearchCardCascaderWidget extends AbstractCardCascaderElementWidget {
  protected async onNodeSelected(node: OioTreeNode<CardCascaderItemData>) {
    await this.onClickLoadData(node);
  }

  protected async onNodeUnselected(node: OioTreeNode<CardCascaderItemData>) {
    await this.onUnselected();
  }

  protected async onClearSearch() {
    await this.onUnselected();
  }

  public async onClickLoadData(node: OioTreeNode<CardCascaderItemData>) {
    const { rootNodes } = this;
    const childMetadata = node.value.metadata?.child;
    if (!rootNodes) {
      return;
    }
    if (childMetadata) {
      await this.fetchNodeData(node, childMetadata);
    }
    this.showContent = await this.onSelectedForSearch(node);
  }

  protected async refreshProcess() {
    await this.resetRootNode();
    await this.onUnselected();
  }
}
