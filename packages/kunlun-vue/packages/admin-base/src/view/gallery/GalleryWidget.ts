import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { GalleryConfigManager, getCurrentThemeSize } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, NumberHelper, Optional } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import {
  DEFAULT_CARD_GUTTERS,
  DEFAULT_GUTTERS,
  DEFAULT_VERTICAL_GUTTERS,
  LayoutHelper
} from '@oinone/kunlun-vue-ui-common';
import { OioGalleryViewState, Widget } from '@oinone/kunlun-vue-widget';
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
  protected get galleryConfig() {
    return GalleryConfigManager.getConfig();
  }

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
  @Widget.Provide()
  protected get sortable() {
    return super.sortable;
  }

  protected get defaultSortable() {
    const { sortable } = this.galleryConfig;
    if (sortable == null) {
      return true;
    }
    return sortable;
  }

  @Widget.Reactive()
  protected get switchLineHeight() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().switchLineHeight)).orElse(
      this.defaultSwitchLineHeight
    );
  }

  protected get defaultSwitchLineHeight() {
    const { switchLineHeight } = this.galleryConfig;
    if (switchLineHeight == null) {
      return true;
    }
    return switchLineHeight;
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
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().switchCols)).orElse(this.defaultSwitchCols);
  }

  protected get defaultSwitchCols() {
    const { switchCols } = this.galleryConfig;
    if (switchCols == null) {
      return true;
    }
    return switchCols;
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

  /**
   * 视图控制组，包含所有子组件
   */
  @Widget.Reactive()
  protected get viewControlWidget(): DslDefinition | undefined {
    if (!this.viewControlChildren.length) {
      return undefined;
    }
    return {
      dslNodeType: DslDefinitionType.ELEMENT,
      widget: 'ViewControl',
      widgets: this.viewControlChildren
    };
  }

  @Widget.Reactive()
  protected get viewControlChildren(): DslDefinition[] {
    const controls: { enabled: boolean; widget: string; props?: Record<string, unknown> }[] = [
      {
        enabled: this.sortable,
        widget: 'SortControl'
      },
      {
        enabled: this.switchLineHeight,
        widget: 'LineHeightControl'
      },
      {
        enabled: this.enabledFullScreen,
        widget: 'FullScreenControl'
      },
      {
        enabled: this.switchCols,
        widget: 'CardColControl',
        props: {
          subPath: 'card-col-control'
        }
      },
      {
        enabled: true,
        widget: 'UserPrefer',
        props: {
          subPath: 'user-prefer',
          modalTitle: '字段设置'
        }
      }
    ];
    return controls
      .filter(({ enabled }) => enabled)
      .map(({ widget, props }) => ({
        dslNodeType: DslDefinitionType.ELEMENT,
        ...props,
        widget,
        widgets: []
      }));
  }

  protected get defaultEnabledFullScreen() {
    const { enabledFullScreen } = this.galleryConfig;
    if (enabledFullScreen == null) {
      return true;
    }
    return enabledFullScreen;
  }

  protected childrenInvisibleProcess(): boolean {
    return false;
  }

  protected $$initViewState(state: OioGalleryViewState): void {
    super.$$initViewState(state);
    state.gallery = this.currentHandle;
  }
}
