import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioDetailViewState, Widget } from '@oinone/kunlun-vue-widget';
import { BaseObjectView, BaseView } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Detail }))
export class DetailView extends BaseObjectView {
  @Widget.Reactive()
  protected get disabledRelationQuery() {
    return BooleanHelper.toBoolean(this.getDsl().disabledRelationQuery);
  }

  protected $$created() {
    super.$$created();
    this.viewState!.fields = [];
    if (this.inline) {
      (this.viewState as OioDetailViewState)!.disabledRelationQuery = this.disabledRelationQuery;
    } else if (this.globalState) {
      this.globalState.disabledRelationQuery = this.disabledRelationQuery;
    }
  }
}
