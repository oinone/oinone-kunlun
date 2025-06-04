import { ActiveRecord, RuntimeM2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';
import { Widget } from '@oinone/kunlun-vue-widget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.ManyToMany
  })
)
export class DetailM2MTableFieldWidget extends FormSubviewListFieldWidget<RuntimeM2MField> {
  protected async refreshValueProcess() {
    if (this.isDataSourceProvider) {
      await super.refreshValueProcess();
    }
  }

  protected initSubviewData(): ReturnPromise<void> {
    const view = this.runtimeSubviewContext?.view;
    if (!view) {
      super.initSubviewData();
      return;
    }
    const { formData, model, field } = this;
    let queryData: ActiveRecord | undefined;
    if (RelationQueryHelper.isNeedQuery(field, ViewMode.Lookup)) {
      queryData = RelationQueryHelper.generatorM2MQueryData(model, field, formData);
    }
    if (!queryData) {
      super.initSubviewData();
      return;
    }
    view.initialValue = [queryData];
    this.isDataSourceProvider = false;
  }

  @Widget.Reactive()
  public get noShadow() {
    return true;
  }
}
