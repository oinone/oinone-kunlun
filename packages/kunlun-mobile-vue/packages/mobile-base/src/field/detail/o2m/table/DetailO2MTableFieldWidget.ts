import { RuntimeO2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { SPI } from '@oinone/kunlun-spi';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { BaseFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';
import { Widget } from '@oinone/kunlun-vue-widget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.OneToMany
  })
)
export class DetailO2MTableFieldWidget extends FormSubviewListFieldWidget<RuntimeO2MField> {
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
    const { formData, field } = this;
    let condition: Condition | undefined;
    if (RelationQueryHelper.isNeedQuery(field, ViewMode.Lookup)) {
      condition = RelationQueryHelper.generatorO2MCondition(field, formData);
    }
    if (!condition) {
      super.initSubviewData();
      return;
    }
    view.filter = condition.toString();
    this.isDataSourceProvider = false;
  }

  @Widget.Reactive()
  public get noShadow() {
    return true;
  }
}
