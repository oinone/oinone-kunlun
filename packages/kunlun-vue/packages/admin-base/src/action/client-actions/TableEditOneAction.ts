import { ActiveRecordExtendKeys } from '@oinone/kunlun-engine';
import { deepClone, ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { VXE_TABLE_X_ID } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { TableEditEvent, TableEventCallChaining, TableEventType } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_EditOne }))
export class TableEditOneAction extends ActionWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected tableEventCallChaining: TableEventCallChaining | undefined;

  protected async clickAction() {
    const event: TableEditEvent = {
      type: TableEventType.edit,
      activeRecords:
        this.activeRecords?.map((item) => {
          const result = deepClone(item);
          Object.values(ActiveRecordExtendKeys).forEach((val) => {
            Reflect.deleteProperty(result, val);
          });
          Reflect.deleteProperty(result, VXE_TABLE_X_ID);
          return result;
        }) || [],
      action: this.action
    };
    this.tableEventCallChaining?.call(event);
  }
}
