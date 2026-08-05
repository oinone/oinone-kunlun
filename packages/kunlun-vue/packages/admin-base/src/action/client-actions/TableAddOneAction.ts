import { translateValueByKey } from '@oinone/kunlun-engine';
import { ActionContextType, ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { type TableAddEvent, type TableEventCallChaining, TableEventType } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_AddOne }))
export class TableAddOneAction extends ActionWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected tableEventCallChaining: TableEventCallChaining | undefined;

  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('添加');
  }

  public initialize(props) {
    super.initialize(props);
    const { action } = this;
    if (action) {
      action.contextType = action.contextType || ActionContextType.Single;
    }
    return this;
  }

  protected async clickAction() {
    const event: TableAddEvent = {
      type: TableEventType.add,
      insertTo: 0,
      action: this.action
    };
    this.tableEventCallChaining?.call(event);
  }
}
