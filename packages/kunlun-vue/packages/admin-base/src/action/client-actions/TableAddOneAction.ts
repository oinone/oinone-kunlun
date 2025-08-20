import { ActiveRecordsOperator } from '@oinone/kunlun-engine';
import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { CallChaining } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { TableRowEditMode } from '../../typing';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_AddOne }))
export class TableAddOneAction extends ActionWidget {
  protected async clickAction() {
    const newRecord = ActiveRecordsOperator.repairRecordsNullable({});
    if (!newRecord) {
      return;
    }
    this.createDataSourceByEntity(newRecord);
    this.editRowCallChaining?.call(TableRowEditMode.CREATE, {
      record: newRecord[0],
      action: this.action
    });
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected editRowCallChaining: CallChaining | undefined;
}
