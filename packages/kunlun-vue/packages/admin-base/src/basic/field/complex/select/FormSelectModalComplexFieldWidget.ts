import { toInteger } from 'lodash-es';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActiveRecords, Pagination, RuntimeRelationField } from '@oinone/kunlun-engine';
import { buildSelectSearchCondition } from '@oinone/kunlun-vue-admin-layout';
import { SelectModal } from '../../../../components/';
import { FormSelectTableComplexFieldWidget } from './FormSelectTableComplexFieldWidget';

export abstract class FormSelectModalComplexFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField
> extends FormSelectTableComplexFieldWidget<Value, Field> {
  public initialize(props: any) {
    super.initialize(props);
    this.setComponent(SelectModal);
    return this;
  }

  protected isFirstFillOptions = true;

  @Widget.Reactive()
  protected get pagination(): Pagination {
    return {
      pageSize: this.pageSize,
      total: this.total,
      current: this.currentPage
    };
  }

  @Widget.Method()
  protected async onPaginationChange(page: number, pageSize: number) {
    this.currentPage = page;
    this.pageSize = pageSize;

    const iQueryPageResult = await this.loadOptions({
      condition: buildSelectSearchCondition(this.referencesModel, this.queryFieldName, this.searchValue, this.domain),
      currentPage: this.currentPage
    });
    if (iQueryPageResult) {
      this.totalPages = toInteger(iQueryPageResult.totalPages);
      await this.fillOptions(iQueryPageResult.content, false);
    }
  }

  protected async fillOptionsForMulti(dataList: Record<string, unknown>[]) {
    if (this.isFirstFillOptions) {
      this.isFirstFillOptions = false;
      super.fillOptionsForMulti(dataList);
      return;
    }
    this.dataList = dataList;
    this.options = this.handleSelectOption(this.dataList, this.referencesModel);
  }

  protected async fillOptionsForSingle(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    if (this.isFirstFillOptions) {
      this.isFirstFillOptions = false;
      super.fillOptionsForSingle(dataList, insetDefaultValue);
      return;
    }

    this.dataList = dataList;
    this.options = this.handleSelectOption(this.dataList, this.referencesModel);
  }
}
