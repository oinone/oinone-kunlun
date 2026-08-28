import { translateValueByKey } from '@oinone/kunlun-engine';
import { ActionContextType, ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { TableDeleteEvent, type TableEventCallChaining, TableEventType } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_DeleteOne }))
export class DeleteOneActionWidget extends ActionWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected tableEventCallChaining: TableEventCallChaining | undefined;

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
    const event: TableDeleteEvent = {
      type: TableEventType.delete,
      activeRecords: this.activeRecords,
      action: this.action
    };
    this.tableEventCallChaining?.call(event);
  }
}
