import { ActiveRecordsOperator } from '@kunlun/engine';
import { deepClone, ModelDefaultActionName } from '@kunlun/meta';
import { CallChaining } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { TableRowEditMode } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_CopyOne }))
export class TableCopyOneAction extends ActionWidget {
  protected async clickAction() {
    const { activeRecords } = this;
    const newActiveRecords = activeRecords?.map((item) => {
      const result = deepClone(item);
      Reflect.deleteProperty(result, '__draftId');
      Reflect.deleteProperty(result, '__parentDraftId');
      Reflect.deleteProperty(result, '__hasChildren');
      Reflect.deleteProperty(result, '__lastUpdateFromLocal');
      Reflect.deleteProperty(result, '__updateTimestamp');
      Reflect.deleteProperty(result, '_X_ROW_KEY');
      return result;
    });
    const newRecord = ActiveRecordsOperator.repairRecordsNullable(newActiveRecords);
    if (!newRecord) {
      return;
    }
    this.createDataSourceByEntity(newRecord);
    this.editRowCallChaining?.call(TableRowEditMode.COPY, {
      record: newRecord[0],
      action: this.action
    });
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected editRowCallChaining: CallChaining | undefined;
}
