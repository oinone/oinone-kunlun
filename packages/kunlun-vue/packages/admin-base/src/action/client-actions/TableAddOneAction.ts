import { ActiveRecordsOperator } from '@kunlun/engine';
import { ModelDefaultActionName } from '@kunlun/meta';
import { CallChaining } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
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
