import { RedirectTargetEnum } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import DefaultHyperlinks from './DefaultHyperlinks.vue';
import { FormStringFieldSingleWidget } from '../FormStringFieldSingleWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form],
    ttype: ModelFieldType.String,
    widget: 'Hyperlinks'
  })
)
export class FormHyperlinksFieldWidget extends FormStringFieldSingleWidget {
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
