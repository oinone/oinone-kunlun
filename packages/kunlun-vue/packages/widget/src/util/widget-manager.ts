import { CastHelper } from '@kunlun/shared';
import { VueWidget, Widget } from '../basic';

export function newVueWidget(): VueWidget {
  return new VueWidget();
}

export function getWidget(handler: string): VueWidget | undefined {
  return CastHelper.cast(Widget.select(handler));
}

export function getWidgetNotNull(handle: string): VueWidget {
  return getWidget(handle) || newVueWidget();
}
