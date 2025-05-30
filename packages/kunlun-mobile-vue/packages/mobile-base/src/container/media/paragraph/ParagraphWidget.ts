import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultParagraph from './DefaultParagraph.vue';

export enum ParagraphBorderMode {
  Solid = 'SOLID',
  None = 'NONE',
  Dashed = 'DASHED'
}

/**
 * 与字段无关的media组件-段落
 */
@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'paragraph' }))
export class ParagraphWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultParagraph);
    return this;
  }

  @Widget.Reactive()
  protected get content() {
    return this.getDsl().content;
  }

  @Widget.Reactive()
  protected get borderMode() {
    return this.getDsl().borderMode;
  }
}
