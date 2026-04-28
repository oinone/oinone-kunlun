import type { ActiveRecord, RuntimeM2MField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewMode, ViewType } from '@oinone/kunlun-meta';
import type { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';
import { TABLE_WIDGET } from '../../../../typing';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.ManyToMany,
    widget: ['table', TABLE_WIDGET]
  })
)
export class DetailM2MTableFieldWidget extends FormSubviewListFieldWidget<RuntimeM2MField> {
  protected async refreshValueProcess() {
    if (this.isDataSourceProvider) {
      await super.refreshValueProcess();
    }
  }

  protected initSubviewData(): ReturnPromise<void> {
    if (this.disabledRelationQuery) {
      super.initSubviewData();
      return;
    }
    const view = this.runtimeSubviewContext.view;
    if (!view) {
      super.initSubviewData();
      return;
    }
    const { formData, model, field } = this;
    let queryData: ActiveRecord | undefined;
    if (RelationQueryHelper.isNeedQuery(field, ViewMode.Lookup)) {
      queryData = RelationQueryHelper.generatorM2MQueryData(model, field, formData);
      if (!queryData) {
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
    view.initialValue = [queryData];
    this.isDataSourceProvider = false;
  }
}
