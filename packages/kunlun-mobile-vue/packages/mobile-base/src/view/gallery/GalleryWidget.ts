import { DslDefinitionType } from '@kunlun/dsl';
import { ViewType } from '@kunlun/meta';
import { NumberHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { DEFAULT_GUTTERS, StandardGutterType } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget, BaseElementListViewWidget } from '../../basic';
import DefaultGallery from './DefaultGallery.vue';
import { GALLERY_WIDGET } from '../../typing';
import { findWidget } from '../../util';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: ['gallery', GALLERY_WIDGET]
  })
)
export class GalleryWidget extends BaseElementListViewWidget {
  /**
   * 默认间距
   */
  public defaultGutter: StandardGutterType = DEFAULT_GUTTERS;

  public initialize(props) {
    if (props.template) {
      const { showFieldsMaxLength = 0 } = props.template || {};
      let galleryWidget = findWidget(props.template, DslDefinitionType.ELEMENT, 'card', 'card');
      if (!galleryWidget) {
        galleryWidget = findWidget(props.template, DslDefinitionType.PACK, 'card', 'card');
      }
      if (galleryWidget) {
        const contentWidget = findWidget(galleryWidget, DslDefinitionType.TEMPLATE, 'content');
        if (contentWidget && contentWidget.widgets) {
          const widgets = contentWidget.widgets.filter((a) => a.invisible === undefined || a.invisible === false);
          if (showFieldsMaxLength > 0 && widgets.length > showFieldsMaxLength) {
            contentWidget.widgets = widgets.slice(0, showFieldsMaxLength);
          }
        }
      }
    }
    super.initialize(props);
    this.setComponent(DefaultGallery);
    return this;
  }

  @Widget.Reactive()
  protected get cols() {
    return 1;
    // let cols = NumberHelper.toNumber(this.getDsl().cols);
    // if (isNil(cols)) {
    //   cols = 4;
    // }
    // return cols;
  }

  @Widget.Reactive()
  protected get gutter(): number[] {
    return [0, 0];
    // const { gutter } = this.getDsl();
    // if (!isEmpty(gutter)) {
    //   if (isString(gutter)) {
    //     return LayoutHelper.convertGutter(gutter, this.defaultGutter);
    //   }
    //   return gutter;
    // }
    // return this.defaultGutter;
  }

  @Widget.Reactive()
  protected get itemWidth() {
    let cardDslDefinition = this.getDsl().widgets?.[0];
    if (cardDslDefinition?.dslNodeType === DslDefinitionType.SLOT) {
      cardDslDefinition = cardDslDefinition.widgets?.[0];
    }
    return NumberHelper.toNumber(cardDslDefinition?.width);
  }

  @Widget.Reactive()
  protected get itemMinWidth() {
    let cardDslDefinition = this.getDsl().widgets?.[0];
    if (cardDslDefinition?.dslNodeType === DslDefinitionType.SLOT) {
      cardDslDefinition = cardDslDefinition.widgets?.[0];
    }
    return NumberHelper.toNumber(cardDslDefinition?.minWidth);
  }

  @Widget.Reactive()
  protected get itemMaxWidth() {
    let cardDslDefinition = this.getDsl().widgets?.[0];
    if (cardDslDefinition?.dslNodeType === DslDefinitionType.SLOT) {
      cardDslDefinition = cardDslDefinition.widgets?.[0];
    }
    return NumberHelper.toNumber(cardDslDefinition?.maxWidth);
  }

  protected childrenInvisibleProcess(): boolean {
    return false;
  }
}
