import { RuntimeO2MField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormLayout } from '@oinone/kunlun-vue-ui-common';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.OneToMany
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
        return;
      }
    } else {
      super.initSubviewData();
      return;
    }
    view.filter = condition.toString();
    this.isDataSourceProvider = false;
  }

  @Widget.Reactive()
  public get isLink() {
    return false;
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    return FormLayout.VERTICAL.toString();
  }

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }

  @Widget.Reactive()
  public get noBorderBottom() {
    return true;
  }

  @Widget.Reactive()
  public get noShadow() {
    return true;
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
