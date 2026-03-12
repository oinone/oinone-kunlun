import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { isDetailViewState, type OioAnyViewState, Widget } from '@oinone/kunlun-vue-widget';
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

  @Widget.Reactive()
  protected get disabledRelationQuery() {
    return BooleanHelper.toBoolean(this.getDsl().disabledRelationQuery);
  }

  protected $$initViewState(state: OioAnyViewState): void {
    if (isDetailViewState(state) && !state.detail) {
      state.detail = this.currentHandle;
      if (this.inline) {
        state.disabledRelationQuery = this.disabledRelationQuery;
      } else if (this.globalState) {
        this.globalState.disabledRelationQuery = this.disabledRelationQuery;
      }
    }
  }
}
