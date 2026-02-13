import { GroupingField, isAllowGrouping } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { isTableViewState, Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import type { SortableGroupOption } from '../../../components';
import type { TableWidget } from '../../table';
import DefaultGroupControl from './DefaultGroupControl.vue';

type GroupingFieldOption = GroupingField & { title?: string };

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'GroupControl'
  })
)
export class GroupControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultGroupControl);
    return this;
  }

  /**
   * 分组数据
   * @see {@link BaseTableWidget#groupList}
   */
  @Widget.Reactive()
  protected get parentGroupList(): GroupingField[] | undefined {
    const { viewState } = this;
    if (!viewState) {
      return undefined;
    }
    if (isTableViewState(viewState) && viewState.table) {
      return Widget.select<TableWidget>(viewState.table)?.getOperator<TableWidget>()?.groupList;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected groupList: GroupingFieldOption[] | undefined;

  @Widget.Reactive()
  protected options: SortableGroupOption[] = [];

  /**
   * 修改分组
   * @see {@link BaseTableWidget#onGroupChange}
   */
  @Widget.Reactive()
  protected get onGroupChange(): (groupList: GroupingField[]) => void {
    const { viewState } = this;
    if (!viewState) {
      return () => {};
    }
    if (isTableViewState(viewState) && viewState.table) {
      return Widget.select<TableWidget>(viewState.table)?.getOperator<TableWidget>()?.onGroupChange || (() => {});
    }
    return () => {};
  }

  @Widget.Method()
  protected onOpen() {
    this.groupList = this.getGroupList();
  }

  protected getGroupList(): GroupingFieldOption[] | undefined {
    return this.parentGroupList?.map((sort) => {
      const { field: sortField } = sort;
      const field = this.fieldOptions.find((v) => v.data === sortField);
      return {
        ...sort,
        title: field?.label
      };
    });
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
      if (isAllowGrouping(modelField)) {
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
