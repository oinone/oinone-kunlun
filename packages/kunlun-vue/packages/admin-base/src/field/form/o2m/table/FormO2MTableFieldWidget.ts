import { RuntimeO2MField, SubmitRelationHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';
import { TABLE_WIDGET } from '../../../../typing';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.OneToMany,
    widget: TABLE_WIDGET
  })
)
export class FormO2MTableFieldWidget extends FormSubviewListFieldWidget<RuntimeO2MField> {
  protected async refreshValueProcess() {
    if (this.isDataSourceProvider) {
      await super.refreshValueProcess();
      this.submitCache?.reload();
      this.subviewSubmitCache?.reload();
    }
  }

  protected initSubviewData(): ReturnPromise<void> {
    const view = this.runtimeSubviewContext.view;
    if (!view) {
      super.initSubviewData();
      return;
    }
    const { formData, field, viewMode, submitType, relationUpdateType } = this;
    let condition: Condition | undefined;
    if (RelationQueryHelper.isNeedQuery(field, viewMode, submitType, relationUpdateType)) {
      condition = RelationQueryHelper.generatorO2MCondition(field, formData);
      if (!condition) {
        this.isDataSourceProvider = false;
        this.reloadDataSource([]);
        return;
      }
    } else {
      super.initSubviewData();
      return;
    }
    if (!this.isDataSourceProvider) {
      this.reloadDataSource(undefined);
    }
    view.filter = condition.toString();
    this.isDataSourceProvider = false;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, subviewSubmitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.O2M(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      subviewSubmitCache || submitCache,
      submitType,
      relationUpdateType
    );
  }
}
