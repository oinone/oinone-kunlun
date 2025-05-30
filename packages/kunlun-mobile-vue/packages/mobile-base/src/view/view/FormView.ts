import { ViewType } from '@kunlun/meta';
import { CallChaining } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
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
