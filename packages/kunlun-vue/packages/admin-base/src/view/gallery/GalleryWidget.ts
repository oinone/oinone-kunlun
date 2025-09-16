import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { getCurrentThemeSize } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import {
  DEFAULT_CARD_GUTTERS,
  DEFAULT_GUTTERS,
  DEFAULT_VERTICAL_GUTTERS,
  LayoutHelper
} from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isEmpty, isNil, isString } from 'lodash-es';
import { BaseElementListViewWidget, BaseElementWidget } from '../../basic';
import { GALLERY_WIDGET } from '../../typing';
import DefaultGallery from './DefaultGallery.vue';

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

  @Widget.Method()
  public get viewControlChildren(): DslDefinition[] {
    const originalChildren = super.viewControlChildren;

    const children = [
      {
        dslNodeType: DslDefinitionType.ELEMENT,
        widget: 'UserPrefer',
        subPath: 'user-prefer',
        modalTitle: '字段设置',
        widgets: []
      }
    ] as DslDefinition[];

    if (this.switchCols) {
      children.unshift({
        dslNodeType: DslDefinitionType.ELEMENT,
        widget: 'CardColControl',
        subPath: 'card-col-control',
        widgets: []
      });
    }

    return [...originalChildren, ...children];
  }

  @Widget.Reactive()
  public cardCols?: number;

  @Widget.Provide()
  @Widget.Method()
  public setCardCols(cols: number) {
    this.cardCols = cols;
  }

  /**
   * 卡片数量切换
   */
  @Widget.Reactive()
  public get switchCols() {
    return !!this.getDsl().switchCols;
  }

  @Widget.Provide()
  @Widget.Reactive()
  public get cols() {
    if (typeof this.cardCols === 'number' && this.cardCols > 0) {
      return this.cardCols;
    }

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
