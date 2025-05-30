import { ActiveRecord, resolveDynamicDomain } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultParagraph from './DefaultParagraph.vue';
import { CSSStyle } from '@kunlun/shared';

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
  @Widget.Reactive()
  protected get formData(): ActiveRecord | undefined {
    return this.activeRecords?.[0] || {};
  }

  public initialize(props) {
    super.initialize(props);
    this.colStyle = props.colStyle as CSSStyle;
    this.setComponent(DefaultParagraph);
    return this;
  }

  @Widget.Reactive()
  protected get content() {
    let { content } = this.getDsl();
    if (content) {
      content = decodeURI(content);
      content = resolveDynamicDomain(
        content,
        this.formData,
        this.rootData?.[0] || {},
        this.openerActiveRecords?.[0] || {}
      );
    }
    return content || '';
  }

  @Widget.Reactive()
  protected get borderMode() {
    return this.getDsl().borderMode;
  }

  @Widget.Reactive()
  protected colStyle: CSSStyle | null = null;
}
