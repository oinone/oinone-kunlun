import { RuntimeO2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';

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
    const view = this.runtimeSubviewContext.view;
    if (!view) {
      super.initSubviewData();
      return;
    }
    const { formData, field } = this;
    let condition: Condition | undefined;
    if (RelationQueryHelper.isNeedQuery(field, ViewMode.Lookup)) {
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
}
