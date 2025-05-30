import { SPI } from '@kunlun/spi';
import { DEFAULT_CARD_CONTAINERS_GUTTERS, DEFAULT_CONTAINERS_GUTTERS, StandardGutterType } from '@kunlun/vue-ui-common';
import { isAllInvisible, Widget } from '@kunlun/vue-widget';
import { isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import { DefaultContainerWidget } from './DefaultContainerWidget';
import { DefaultRowWidget } from './DefaultRowWidget';

function fetchContainerChildren(widgets: Widget[], level = 3): Widget[] {
  const children: Widget[] = [];
  for (const widget of widgets) {
    if (widget instanceof DefaultContainerWidget) {
      widget.getChildren().forEach((child) => children.push(child));
    } else if (level >= 1) {
      fetchContainerChildren(widget.getChildren(), level - 1).forEach((child) => children.push(child));
    }
  }
  return children;
}

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'containers' }))
export class DefaultContainersWidget extends DefaultRowWidget {
  public get defaultGutter(): StandardGutterType {
    if (this.customDefaultGutter) {
      return this.customDefaultGutter;
    }
    if (this.isCard) {
      return DEFAULT_CARD_CONTAINERS_GUTTERS;
    }
    return DEFAULT_CONTAINERS_GUTTERS;
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }

  protected childrenInvisibleProcess(): boolean {
    return isAllInvisible(fetchContainerChildren(this.getChildren()));
  }
}
