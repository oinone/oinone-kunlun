import { translateValueByKey } from '@kunlun/engine';
import { ModelDefaultActionName } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { SPI } from '@kunlun/spi';
import { createEasyExportTask, getExportWorkBook, OioNotification } from '@kunlun/vue-ui-antd';
import { Widget } from '@kunlun/vue-widget';
import { ValidatorStatus } from '../../../typing';
import { ActionWidget } from '../../component';
import ImportCom from './ExportActionWidget.vue';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_GotoListExportDialog
  })
)
export class ExportActionWidget extends ActionWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ImportCom);
    return this;
  }

  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('导出');
  }

  private file: { id?: string } = {};

  @Widget.Reactive()
  private validation1: { status: ValidatorStatus; help: string } = {
    status: ValidatorStatus.Success,
    help: ''
  };

  @Widget.Reactive()
  private validation2: { status: ValidatorStatus; help: string } = {
    status: ValidatorStatus.Success,
    help: ''
  };

  private firstOpen = true;

  @Widget.Reactive()
  private visible = false;

  @Widget.Reactive()
  private selectValue = '';

  @Widget.Reactive()
  private workbookList: any[] = [];

  @Widget.Reactive()
  private handleSelectChange(val) {
    this.selectValue = val;
  }

  public clickAction() {
    this.change(true);
  }

  @Widget.Method()
  private async createExportTask() {
    if (!this.selectValue) {
      this.validation1.status = ValidatorStatus.Error;
      this.validation1.help = this.translate('kunlun.export.tips');
      return;
    }
    let condition: Condition | string | undefined;
    const activeRecords = this.activeRecords;
    if (activeRecords && activeRecords.length) {
      condition = `id =in= (${activeRecords.map((a) => a.id).join(',')})`;
    } else {
      condition = this.getSearchRsqlAndQueryParams().condition;
    }

    const data = await createEasyExportTask(this.selectValue, condition);
    if (data.id) {
      OioNotification.success(this.translate('kunlun.common.success'));
      this.change(false);
    } else {
      OioNotification.error(this.translate('kunlun.common.error'));
    }
  }

  @Widget.Method()
  private async change(val) {
    if (this.firstOpen && val) {
      this.firstOpen = false;
      this.queryWorkbookList();
    }
    this.visible = val;
  }

  private async queryWorkbookList() {
    const model = this.model.model;
    if (model) {
      this.workbookList = (await getExportWorkBook(model, true)) as any[];
    }
  }
}
