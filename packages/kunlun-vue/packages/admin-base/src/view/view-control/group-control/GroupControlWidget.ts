import { GroupingField, isAllowGrouping } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import type { SortableGroupOption } from '../../../components';
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
  @Widget.Inject('groupList')
  protected parentGroupList: GroupingField[] | undefined;

  @Widget.Reactive()
  protected groupList: GroupingFieldOption[] | undefined;

  @Widget.Reactive()
  protected options: SortableGroupOption[] = [];

  /**
   * 修改分组
   * @see {@link BaseTableWidget#onGroupChange}
   */
  @Widget.Method()
  @Widget.Inject()
  protected onGroupChange!: (groupList: GroupingField[]) => void;

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
