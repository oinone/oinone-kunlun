import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
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

  /**
   * 修改排序
   *  @see {@link BaseElementListViewWidget}
   */
  @Widget.Method()
  @Widget.Inject()
  protected onSortChange!: (sortList) => void;

  /**
   * 排序字段列表
   */
  @Widget.Reactive()
  protected get sortList() {
    const { modelFields } = this.model;
    return this.parentSortList?.map((sort) => {
      const field = modelFields.find((field) => field.name === sort.sortField);
      return {
        ...sort,
        title: field?.label
      };
    });
  }

  @Widget.Reactive()
  protected get allFields() {
    return this.model.modelFields;
  }
}
