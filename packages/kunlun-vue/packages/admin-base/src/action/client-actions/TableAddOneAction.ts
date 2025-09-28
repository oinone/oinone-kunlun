import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { TableAddEvent, TableEventCallChaining, TableEventType } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_AddOne }))
export class TableAddOneAction extends ActionWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected tableEventCallChaining: TableEventCallChaining | undefined;

  protected async clickAction() {
    const event: TableAddEvent = {
      type: TableEventType.add,
      insertTo: 0,
      action: this.action
    };
    this.tableEventCallChaining?.call(event);
  }
}
