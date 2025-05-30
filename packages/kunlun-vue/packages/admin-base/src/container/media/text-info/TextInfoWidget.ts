import { SPI } from '@kunlun/spi';
import { FormLayout } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultTextInfo from './DefaultTextInfo.vue';
import { TextInfoJustifyContent, TextInfoMediaType, TextInfoTemplateType } from './typing';

/**
 * 与字段无关的media组件-TextInfo 文本信息
 */
@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'textInfo' }))
export class TextInfoWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultTextInfo);
    return this;
  }

  @Widget.Reactive()
  protected get mediaType() {
    return this.getDsl().mediaType || TextInfoMediaType.PICTURE_TEXT;
  }

  @Widget.Reactive()
  protected get templateType() {
    return this.getDsl().templateType || TextInfoTemplateType.PIC_HIGHLIGHT;
  }

  @Widget.Reactive()
  protected valueJustifyContent: string = TextInfoJustifyContent.CENTER;

  @Widget.Reactive()
  protected labelJustifyContent: string = TextInfoJustifyContent.CENTER;

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent || TextInfoTemplateType.CENTER;
  }

  @Widget.Reactive()
  protected get layout() {
    return this.getDsl().layout || FormLayout.horizontal;
  }

  @Widget.Reactive()
  protected get fieldWidget() {
    return this.getDsl().widgets[0];
  }

  @Widget.Reactive()
  protected get fieldInvisible() {
    return this.fieldWidget?.invisible;
  }

  @Widget.Reactive()
  protected get picIconWidget() {
    return this.getDsl().widgets[1];
  }

  @Widget.Reactive()
  protected get label() {
    return this.fieldWidget?.label;
  }

  @Widget.Reactive()
  protected get labelFontSize() {
    const labelFontSize = this.fieldWidget?.labelFontSize;
    if (labelFontSize) {
      return `${labelFontSize}px`;
    }
    return 'var(--oio-font-size)';
  }
}
