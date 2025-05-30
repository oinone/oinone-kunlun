import { ILayoutWidgetProps, Layout } from '@kunlun/engine';
import { BooleanHelper, StringHelper } from '@kunlun/shared';
import { FlexDirection } from '@kunlun/vue-ui-common';
import { DslNodeWidget, Widget } from '@kunlun/vue-widget';

export abstract class LayoutWidget extends DslNodeWidget<ILayoutWidgetProps> {
  public widget = '';

  @Widget.Reactive()
  protected class: string[] = [];

  @Widget.Reactive()
  protected style: CSSStyleDeclaration = {} as CSSStyleDeclaration;

  public initialize(props) {
    super.initialize(props);

    const { widget = '' } = props as ILayoutWidgetProps;

    this.widget = widget;
    this.renderStyle(props);

    return this;
  }

  public renderStyle(props: ILayoutWidgetProps) {
    const {
      class: classNames,
      height = '',
      width = '',
      flexDirection = '',
      alignContent = '',
      flexWrap = '',
      align = 'left',
      layout,
      flex,
      wrap,
      overflow
    } = props as ILayoutWidgetProps;

    if (classNames) {
      this.class = StringHelper.append([], classNames);
    }

    if (height) {
      this.style.height = height;
    }

    if (width) {
      this.style.width = width;
    }

    if (align) {
      this.style.textAlign = align;
    }

    if (flex) {
      this.style.flex = flex;
    }

    if (flexDirection) {
      this.style.flexDirection = flexDirection;
    }

    if (flexWrap) {
      this.style.flexWrap = flexWrap;
    }

    if (alignContent) {
      this.style.alignContent = alignContent;
    }

    if (wrap != null) {
      if (BooleanHelper.toBoolean(wrap)) {
        this.style.flexWrap = 'wrap';
      } else {
        this.style.flexWrap = 'nowrap';
      }
    }

    if (overflow) {
      this.style.overflow = overflow;
    }

    if (layout) {
      if (layout === Layout.Horizontal) {
        this.style.flexDirection = FlexDirection.Row;
      } else if (layout === Layout.Vertical) {
        this.style.flexDirection = FlexDirection.Column;
      }
    }
  }
}
