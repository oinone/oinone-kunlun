import { RedirectTargetEnum } from '@kunlun/engine';
import { ModelFieldType, ViewActionTarget, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import DetailHyperlinks from './DetailHyperlinks.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: 'Hyperlinks'
  })
)
export class DetailStringHyperlinksFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DetailHyperlinks);
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

export const DetailHyperlinksFieldWidget = DetailStringHyperlinksFieldWidget;
