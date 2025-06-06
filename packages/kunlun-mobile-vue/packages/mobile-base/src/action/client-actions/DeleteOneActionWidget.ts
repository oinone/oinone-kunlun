import { ActionContextType, ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_DeleteOne }))
export class DeleteOneActionWidget extends ActionWidget {
  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('删除');
  }

  public initialize(props) {
    super.initialize(props);
    const { action } = this;
    if (action) {
      action.contextType = action.contextType || ActionContextType.SingleAndBatch;
    }
    return this;
  }

  @Widget.Reactive()
  protected get isAsync(): boolean {
    return false;
  }

  protected async clickAction() {
    if (this.activeRecords) {
      this.deleteDataSourceByEntity(this.activeRecords);
      this.reloadActiveRecords([]);
      this.flushDataSource();
    }
  }
}
