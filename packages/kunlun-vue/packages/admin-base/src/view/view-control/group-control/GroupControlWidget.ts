import { ModelCache, RuntimeRelationField } from '@oinone/kunlun-engine';
import { IGroup } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import { SortableGroupOption } from '../../../components';
import DefaultGroupControl from './DefaultGroupControl.vue';

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
  protected parentGroupList;

  @Widget.Reactive()
  protected groupList: (IGroup & { title: string })[] = [];

  @Widget.Reactive()
  protected options: SortableGroupOption[] = [];

  /**
   * 修改分组
   * @see {@link BaseTableWidget#onGroupChange}
   */
  @Widget.Method()
  @Widget.Inject()
  protected onGroupChange!: (groupList: IGroup[]) => void;

  @Widget.Method()
  protected onOpen() {
    this.groupList = this.getGroupList();
  }

  protected getGroupList() {
    return this.parentGroupList?.map((sort) => {
      const { sortField } = sort;
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

  protected async mounted() {
    const model = this.rootRuntimeContextNullable?.model.model;
    if (!model) {
      return;
    }
    const modelDefinition = await ModelCache.get(model);
    if (!this.rootRuntimeContextNullable?.model.model) {
      return;
    }
    const options: SortableGroupOption[] = [];
    const { modelFields: dslFields } = this.model;
    for (const modelField of modelDefinition?.modelFields || []) {
      const { data, store } = modelField;
      if (store || (modelField as RuntimeRelationField).relationStore) {
        let dslField = dslFields.find((d) => d.data === data);
        if (!dslField) {
          dslField = modelField;
        }
        options.push({
          data: dslField.data,
          name: dslField.name,
          label: dslField.label || dslField.displayName || dslField.data
        });
      }
    }
    this.options = options;
  }
}
