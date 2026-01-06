import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { type TableCopyEvent, type TableEventCallChaining, TableEventType } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_CopyOne }))
export class TableCopyOneAction extends ActionWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected tableEventCallChaining: TableEventCallChaining | undefined;

  protected async clickAction() {
    const event: TableCopyEvent = {
      type: TableEventType.copy,
      clone: true,
      activeRecords: this.activeRecords,
      copyTo: 0,
      action: this.action
    };
    this.tableEventCallChaining?.call(event);
  }
}
