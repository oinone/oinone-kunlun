import { ModelDefaultActionName } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { getExportWorkBook, notification } from '@kunlun/vue-ui-mobile-vant';
import { createEasyImportTask, getEasyImportTemplate } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { ValidatorStatus } from '../../../typing';
import { ActionWidget } from '../../component';
import ImportCom from './ImportActionWidget.vue';
import { translateValueByKey } from '@kunlun/engine';

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
  protected file: { id?: string } = {};

  @Widget.Reactive()
  protected validation1: { status: ValidatorStatus; help: string } = {
    status: ValidatorStatus.Success,
    help: ''
  };

  @Widget.Reactive()
  protected validation2: { status: ValidatorStatus; help: string } = {
    status: ValidatorStatus.Success,
    help: ''
  };

  protected firstOpen = true;

  @Widget.Reactive()
  protected visible = false;

  @Widget.Reactive()
  protected selectValue = '';

  @Widget.Reactive()
  protected workbookList: any[] = [];

  @Widget.Reactive()
  protected handleSelectChange(val) {
    this.selectValue = val;
  }

  public clickAction() {
    this.change(true);
  }

  @Widget.Method()
  protected async downloadTemplate() {
    if (!this.selectValue) {
      this.validation1.status = ValidatorStatus.Error;
      this.validation1.help = this.translate('kunlun.import.tips');
      return;
    }

    const urlObj: any = await getEasyImportTemplate(this.selectValue);
    window.open(urlObj.redirectUri);
  }

  @Widget.Method()
  protected async createImportTask() {
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
        this.refreshCallChaining?.call();
        notification.success(this.translate('kunlun.common.success'));
        this.change(false);
        // await this.reloadPage();
      } else if (forceRefreshWhenError) {
        this.refreshCallChaining?.call();
        this.change(false);
      }
    } catch (e) {
      if (forceRefreshWhenError) {
        this.refreshCallChaining?.call();
        this.change(false);
      }
    } finally {
      this.loading = false;
    }
  }

  @Widget.Method()
  protected getImportFile(files) {
    if (!files || !files.length) {
      return;
    }
    const fileObj = files!.length > 1 ? files[files!.length - 1] : files[0];
    this.file = fileObj;
  }

  @Widget.Method()
  protected remove(file) {
    this.file = {};
  }

  @Widget.Method()
  protected async change(val) {
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

  protected async queryWorkbookList() {
    const model = this.model.model;
    if (model) {
      this.workbookList = (await getExportWorkBook(model, false)) as any[];
    }
  }
}
