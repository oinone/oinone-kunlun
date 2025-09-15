import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseElementWidget, BaseFormWidget } from '../../basic';
import { DETAIL_WIDGET } from '../../typing';
import DefaultDetail from './DefaultDetail.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Detail,
    widget: ['detail', DETAIL_WIDGET]
  })
)
export class DetailWidget extends BaseFormWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultDetail);
    return this;
  }
}
