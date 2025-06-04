import { ActiveRecord, RuntimeM2MField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormLayout } from '@oinone/kunlun-vue-ui-common';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToMany
  })
)
export class FormM2MTableFieldWidget extends FormSubviewListFieldWidget<RuntimeM2MField> {
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
    const { formData, model, field, viewMode, submitType, relationUpdateType } = this;
    let queryData: ActiveRecord | undefined;
    if (RelationQueryHelper.isNeedQuery(field, viewMode, submitType, relationUpdateType)) {
      queryData = RelationQueryHelper.generatorM2MQueryData(model, field, formData);
      if (!queryData) {
        this.isDataSourceProvider = false;
        return;
      }
    } else {
      super.initSubviewData();
      return;
    }
    view.initialValue = [queryData];
    this.isDataSourceProvider = false;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, subviewSubmitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2M(
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

  protected $$mounted() {
    super.$$mounted();
    this.dataSource = [];
  }
}
