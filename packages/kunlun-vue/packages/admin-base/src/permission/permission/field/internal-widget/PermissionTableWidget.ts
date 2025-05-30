import { ActiveRecord, ActiveRecords } from '@kunlun/engine';
import { Condition } from '@kunlun/request';
import { TableWidgetProps } from '../../../../view';
import { InlineTableWidget } from './InlineTableWidget';

export type CheckedChangeHandler = (data: ActiveRecord[]) => void;

export interface PermissionTableHandler {
  onCheckedChangeHandler?: CheckedChangeHandler;
}

export interface PermissionTableWidgetProps extends TableWidgetProps {
  onCheckedChangeHandler: CheckedChangeHandler;
}

export class PermissionTableWidget extends InlineTableWidget<PermissionTableWidgetProps> {
  private handler: PermissionTableHandler = {};

  public initialize(props: PermissionTableWidgetProps) {
    super.initialize(props);
    this.handler.onCheckedChangeHandler = props.onCheckedChangeHandler;
    return this;
  }

  public tableRefreshProcess(condition?: Condition) {}

  public onCheckedChange(data: ActiveRecords) {
    super.onCheckedChange(data);
    this.handler.onCheckedChangeHandler?.(this.activeRecords || []);
  }

  public onCheckedAllChange(selected: boolean, data: ActiveRecord[]) {
    super.onCheckedAllChange(selected, data);
    this.handler.onCheckedChangeHandler?.(this.activeRecords || []);
  }
}
