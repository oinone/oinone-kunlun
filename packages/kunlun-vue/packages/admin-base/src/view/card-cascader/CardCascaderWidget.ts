import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { BaseElementWidget } from '../../basic';
import { CardCascaderItemData } from '../../typing';
import { AbstractCardCascaderElementWidget } from './AbstractCardCascaderElementWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Tree,
    widget: ['card-cascader', 'cardCascader', 'CardCascader']
  })
)
export class CardCascaderWidget extends AbstractCardCascaderElementWidget {
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
    const metadata = node.value.metadata;
    const childMetadata = metadata?.child;
    if (childMetadata) {
      await this.fetchNodeData(node, childMetadata);
    }
    if (metadata?.model === this.model.model) {
      this.showContent = await this.onSelectedForQuery(node);
    }
  }

  protected async onUnselected() {
    this.showContent = false;
  }

  protected $$mounted() {
    super.$$mounted();
    const currentValue = [];
    this.reloadDataSource(currentValue);
  }
}
