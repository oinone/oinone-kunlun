import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringInputFieldWidget } from '../../../../field';
import AppUiHomepage from './AppUiHomepage.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: 'GoToUiHomePage',
    multi: false
  })
)
export class AppUiHomepageWidget extends FormStringInputFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(AppUiHomepage);
    return this;
  }

  @Widget.Reactive()
  public get currentRecord() {
    return this.formData;
  }
}
