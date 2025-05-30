import { RedirectTargetEnum } from '@kunlun/engine';
import { ModelFieldType, ViewActionTarget, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import GalleryHyperlinks from './GalleryHyperlinks.vue';
import { FormHyperlinksFieldWidget } from '../../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.String,
    widget: 'Hyperlinks'
  })
)
export class GalleryHyperlinksFieldWidget extends FormHyperlinksFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryHyperlinks);
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

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
