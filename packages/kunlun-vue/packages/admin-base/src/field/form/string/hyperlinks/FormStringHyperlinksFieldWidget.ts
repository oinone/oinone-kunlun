import { RedirectTargetEnum } from '@kunlun/engine';
import { ModelFieldType, ViewActionTarget, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringInputFieldWidget } from '../input';
import DefaultHyperlinks from './DefaultHyperlinks.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: 'Hyperlinks'
  })
)
export class FormStringHyperlinksFieldWidget extends FormStringInputFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultHyperlinks);
    return this;
  }

  @Widget.Reactive()
  public get text() {
    return this.getDsl().text;
  }

  @Widget.Reactive()
  public get target() {
    const { target } = this.getDsl();
    if (target) {
      switch (target as ViewActionTarget) {
        case ViewActionTarget.Router:
          return RedirectTargetEnum.SELF;
        case ViewActionTarget.OpenWindow:
          return RedirectTargetEnum.BLANK;
        default:
          return RedirectTargetEnum.BLANK;
      }
    }
    return RedirectTargetEnum.BLANK;
  }
}

/**
 * @deprecated please using FormStringHyperlinksFieldWidget
 */
export const FormHyperlinksFieldWidget = FormStringHyperlinksFieldWidget;
