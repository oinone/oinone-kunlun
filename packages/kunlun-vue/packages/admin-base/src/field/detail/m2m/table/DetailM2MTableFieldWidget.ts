import { ActiveRecord, RuntimeM2MField } from '@kunlun/engine';
import { ModelFieldType, ViewMode, ViewType } from '@kunlun/meta';
import { ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget, FormSubviewListFieldWidget, RelationQueryHelper } from '../../../../basic';

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
