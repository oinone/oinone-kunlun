import { ViewType } from '@oinone/kunlun-meta';
import { CallChaining } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseObjectView, BaseView, FormValidateResult } from '../../basic';

@SPI.ClassFactory(BaseView.Token({ type: ViewType.Form }))
export class FormView extends BaseObjectView {
  @Widget.Reactive()
  @Widget.Provide()
  protected formValidateCallChaining: CallChaining<FormValidateResult[]> | undefined;

  protected $$beforeMount() {
    super.$$beforeMount();
    this.formValidateCallChaining = new CallChaining();
  }
}
