import { ModelDefaultActionName } from '@kunlun/meta';
import { translateValueByKey } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { getExportWorkBook, OioNotification } from '@kunlun/vue-ui-antd';
import { createEasyImportTask, getEasyImportTemplate } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { ValidatorStatus } from '../../../typing';
import { ActionWidget } from '../../component';
import ImportCom from './ImportActionWidget.vue';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_GotoListImportDialog }))
export class ImportActionWidget extends ActionWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ImportCom);
    return this;
  }

  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('导入');
  }

  @Widget.Reactive()
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
  private async downloadTemplate() {
    if (!this.selectValue) {
      this.validation1.status = ValidatorStatus.Error;
      this.validation1.help = this.translate('kunlun.import.tips');
      return;
    }

    const urlObj: any = await getEasyImportTemplate(this.selectValue);
    window.open(urlObj.redirectUri);
  }

  @Widget.Method()
  private async createImportTask() {
    if (!this.selectValue) {
      this.validation1.status = ValidatorStatus.Error;
      this.validation1.help = this.translate('kunlun.import.tips');
      return;
    }

    this.validation1.status = ValidatorStatus.Success;
    this.validation1.help = '';

    if (!this.file.id && Object.keys(this.file).length === 0) {
      this.validation2.status = ValidatorStatus.Error;
      this.validation2.help = this.translate('kunlun.import.uploadField');
      return;
    }
    const { forceRefreshWhenError = false } = this.getDsl();
    this.loading = true;
    try {
      const result = await createEasyImportTask(this.selectValue, this.file);
      if (result) {
        this.loading = false;
        // Notification.success((this as any).$t('kunlun.importFields.successfullyImported') as string);
        this.refreshCallChaining?.syncCall();
        OioNotification.success(this.translate('kunlun.common.success'));
        this.change(false);
        // await this.reloadPage();
      } else if (forceRefreshWhenError) {
        this.refreshCallChaining?.syncCall();
        this.change(false);
      }
    } catch (e) {
      if (forceRefreshWhenError) {
        this.refreshCallChaining?.syncCall();
        this.change(false);
      }
    } finally {
      this.loading = false;
    }
  }

  @Widget.Method()
  private getImportFile(files) {
    if (!files || !files.length) {
      return;
    }
    const fileObj = files!.length > 1 ? files[files!.length - 1] : files[0];
    this.file = fileObj;
  }

  @Widget.Method()
  private remove(file) {
    this.file = {};
  }

  @Widget.Method()
  private async change(val) {
    this.validation1 = {
      status: ValidatorStatus.Success,
      help: ''
    };
    this.validation2 = { status: ValidatorStatus.Success, help: '' };
    this.selectValue = '';
    this.file = {};

    if (this.firstOpen && val) {
      this.firstOpen = false;
      this.queryWorkbookList();
    }

    this.visible = val;
  }

  private async queryWorkbookList() {
    const model = this.model.model;
    if (model) {
      this.workbookList = (await getExportWorkBook(model, false)) as any[];
    }
  }
}
