import { ActiveRecords } from '@oinone/kunlun-engine';
import { TableWidget, TableWidgetProps } from '../../../../view';

export class InlineTableWidget<Props extends TableWidgetProps = TableWidgetProps> extends TableWidget<Props> {
  public reloadDataSource(records: ActiveRecords | undefined) {
    this.setCurrentDataSource(records);
  }

  public reloadActiveRecords(records: ActiveRecords | undefined) {
    this.setCurrentActiveRecords(records);
  }
}
