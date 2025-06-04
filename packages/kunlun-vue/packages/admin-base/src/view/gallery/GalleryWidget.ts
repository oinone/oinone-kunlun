import { DslDefinitionType } from '@oinone/kunlun-dsl';
import { ViewType } from '@oinone/kunlun-meta';
import { NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { getCurrentThemeSize } from '@oinone/kunlun-engine';
import { DEFAULT_GUTTERS, LayoutHelper, DEFAULT_VERTICAL_GUTTERS, DEFAULT_CARD_GUTTERS } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isEmpty, isNil, isString } from 'lodash-es';
import { BaseElementListViewWidget, BaseElementWidget } from '../../basic';
import DefaultGallery from './DefaultGallery.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'gallery'
  })
)
export class GalleryWidget extends BaseElementListViewWidget {
  /**
   * 默认间距
   */
  @Widget.Reactive()
  private get defaultGutter() {
    const size = getCurrentThemeSize();

    switch (size) {
      case 'large':
        return DEFAULT_GUTTERS;
      case 'medium':
        return DEFAULT_VERTICAL_GUTTERS;
      default:
        return DEFAULT_CARD_GUTTERS;
    }
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultGallery);
    return this;
  }

  @Widget.Reactive()
  public get cols() {
    let cols = NumberHelper.toNumber(this.getDsl().cols);
    if (isNil(cols)) {
      cols = 4;
    }
    return cols;
  }

  @Widget.Reactive()
  protected get gutter(): number[] {
    const { gutter } = this.getDsl();
    if (!isEmpty(gutter)) {
      if (isString(gutter)) {
        return LayoutHelper.convertGutter(gutter, this.defaultGutter);
      }
      return gutter;
    }
    return this.defaultGutter;
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
