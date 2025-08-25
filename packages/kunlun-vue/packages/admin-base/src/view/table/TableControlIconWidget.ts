import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ISort } from '@oinone/kunlun-service';
import { BaseElementWidget } from '../../basic';
import TableControlIcon from './TableControlIcon.vue';
import { TableLineHeightType } from '../../typing';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: ['controlIcon', 'control-icon', 'ControlIcon']
  })
)
export class TableControlIconWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(TableControlIcon);
    console.log(this.rootRuntimeContext);
    return this;
  }

  @Widget.Reactive()
  @Widget.Inject('sortList')
  protected parentSortList: ISort[] | undefined;

  @Widget.Inject()
  @Widget.Method('onSortChange')
  protected onSortChange!: (sortList: ISort[]) => void;

  @Widget.Reactive()
  @Widget.Inject('lineHeightType')
  protected lineHeightType: TableLineHeightType | undefined;

  @Widget.Reactive()
  @Widget.Inject('setLineHeightType')
  protected onLineHeightTypeChange!: (value: TableLineHeightType) => void;

  @Widget.Reactive()
  @Widget.Inject('fullScreen')
  protected fullScreen!: boolean;

  @Widget.Method()
  @Widget.Inject('switchFullScreen')
  protected switchFullScreen!: () => void;

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
