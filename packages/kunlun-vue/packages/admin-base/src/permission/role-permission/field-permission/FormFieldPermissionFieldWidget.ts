import { ActiveRecord, SubmitHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormM2MTableFieldWidget } from '../../../field';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany,
    widget: 'field-permission'
  })
)
export class FormFieldPermissionFieldWidget extends FormM2MTableFieldWidget {
  protected updateValues: Map<string, ActiveRecord> = new Map<string, ActiveRecord>();

  protected async refreshValueProcess() {
    if (this.isDataSourceProvider) {
      await this.initSubviewData();
      this.submitUpdateValues();
      this.submitCache?.reload();
      this.subviewSubmitCache?.reload();
      this.refreshCallChaining?.syncCall();
    }
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName } = this;
    this.submitUpdateValues();
    return SubmitHandler.DEFAULT(
      field,
      itemName,
      submitValue,
      Array.from(this.updateValues.values()).map((v) => ({
        model: v.model,
        field: v.field,
        permRead: v.permRead,
        permWrite: v.permWrite
      }))
    );
  }

  protected submitUpdateValues() {
    const lastUpdateRecords = this.submitCache?.getOperatorResult().updateRecords;
    if (!lastUpdateRecords?.length) {
      return;
    }
    for (const lastUpdateRecord of lastUpdateRecords) {
      const { model, field } = lastUpdateRecord;
      this.updateValues.set(`${model}#${field}`, lastUpdateRecord);
    }
  }

  protected initSubviewData(): ReturnPromise<void> {
    let currentValues = this.value;
    if (currentValues == null) {
      currentValues = [];
    }
    for (const currentValue of currentValues) {
      const { model, field } = currentValue;
      const lastUpdateRecord = this.updateValues.get(`${model}#${field}`);
      if (lastUpdateRecord) {
        currentValue.permRead = lastUpdateRecord.permRead;
        currentValue.permWrite = lastUpdateRecord.permWrite;
      }
    }
    this.reloadDataSource(currentValues);
  }
}
