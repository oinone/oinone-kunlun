import { ModelCache, RuntimeRelationField } from '@oinone/kunlun-engine';
import { ISort } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import { SortableGroupOption } from '../../../components';
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
  @Widget.Inject('sortList')
  protected parentSortList;

  @Widget.Reactive()
  protected sortList: (ISort & { title: string })[] = [];

  @Widget.Reactive()
  protected options: SortableGroupOption[] = [];

  /**
   * 修改排序
   *  @see {@link BaseElementListViewWidget}
   */
  @Widget.Method()
  @Widget.Inject()
  protected onSortChange!: (sortList: ISort[] | undefined) => void;

  @Widget.Method()
  protected onOpen() {
    this.sortList = this.getSortList();
  }

  /**
   * 排序字段列表
   */
  protected getSortList() {
    return this.parentSortList?.map((sort) => {
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
    const modelDefinition = await ModelCache.get(this.model.model);
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
