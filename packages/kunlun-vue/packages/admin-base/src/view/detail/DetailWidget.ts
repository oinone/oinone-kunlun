import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { OioDetailViewState } from '@oinone/kunlun-vue-widget';
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
  protected viewState: OioDetailViewState | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultDetail);
    return this;
  }

  protected $$initViewState(state: OioDetailViewState): void {
    super.$$initViewState(state);
    if (!state.detail) {
      state.detail = this.currentHandle;
    }
  }
}
