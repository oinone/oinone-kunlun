import { RedirectTargetEnum } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringHyperlinksFieldWidget } from '../../../form';
import GalleryHyperlinks from './GalleryHyperlinks.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.String,
    widget: 'Hyperlinks'
  })
)
export class GalleryStringHyperlinksFieldWidget extends FormStringHyperlinksFieldWidget {
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
}

/**
 * @deprecated please using GalleryStringHyperlinksFieldWidget
 */
export const GalleryHyperlinksFieldWidget = GalleryStringHyperlinksFieldWidget;
