import { isAllowSortable } from '@oinone/kunlun-engine';
import { ISort } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { isTableViewState, Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import type { SortableGroupOption } from '../../../components';
import type { TableWidget } from '../../table';
import DefaultSortControl from './DefaultSortControl.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'SortControl'
  })
)
export class SortControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultSortControl);
    return this;
  }

  /**
   * 排序数据
   *  @see {@link BaseElementListViewWidget}
   */
  @Widget.Reactive()
  protected get parentSortList(): ISort[] | undefined {
    const { viewState } = this;
    if (!viewState) {
      return undefined;
    }
    if (isTableViewState(viewState) && viewState.table) {
      return Widget.select<TableWidget>(viewState.table)?.getOperator<TableWidget>()?.sortList;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected sortList: (ISort & { title: string })[] = [];

  @Widget.Reactive()
  protected options: SortableGroupOption[] = [];

  /**
   * 修改排序
   *  @see {@link BaseElementListViewWidget}
   */
  @Widget.Method()
  protected get onSortChange(): (sortList: ISort[]) => void {
    const { viewState } = this;
    if (!viewState) {
      return () => {};
    }
    if (isTableViewState(viewState) && viewState.table) {
      return Widget.select<TableWidget>(viewState.table)?.getOperator<TableWidget>()?.onSortChange || (() => {});
    }
    return () => {};
  }

  @Widget.Method()
  protected onOpen() {
    this.sortList = this.getSortList();
  }

  /**
   * 排序字段列表
   */
  protected getSortList(): (ISort & { title: string })[] {
    return (
      this.parentSortList?.map((sort) => {
        const { sortField } = sort;
        const field = this.fieldOptions.find((v) => v.data === sortField);
        return {
          ...sort,
          title: field?.label
        };
      }) || []
    );
  }

  @Widget.Reactive()
  protected get fieldOptions(): SortableGroupOption[] {
    return this.options;
  }

  protected mounted() {
    const model = this.rootRuntimeContextNullable?.model.model;
    if (!model) {
      return;
    }
    const options: SortableGroupOption[] = [];
    const { modelFields } = this.model;
    for (const modelField of modelFields || []) {
      const { invisible } = modelField;
      if (invisible === true) {
        continue;
      }
      if (isAllowSortable(modelField)) {
        options.push({
          data: modelField.data,
          name: modelField.name,
          label: modelField.label || modelField.displayName || modelField.data
        });
      }
    }
    this.options = options;
  }
}
