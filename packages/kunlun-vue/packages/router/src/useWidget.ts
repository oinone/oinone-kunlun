import { genToken, VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import { inject, provide } from 'vue';

export interface Widgets {
  [namespace: string]: VueWidget;
}

const ROOT_WIDGET_TOKEN = genToken<VueWidget>('root widget token');

const setRootWidget = (token: string): VueWidget => {
  const rootWidget = Widget.select(token) as VueWidget;
  provide(ROOT_WIDGET_TOKEN, rootWidget);
  return rootWidget;
};

const getRootWidget = (): VueWidget | undefined => {
  return inject(ROOT_WIDGET_TOKEN);
};

const registerWidgets = (widgets: Widgets): void => {
  const rootWidget = getRootWidget();
  if (!rootWidget) {
    throw new Error(`Need a root widget in Match tag`);
  }

  (rootWidget as unknown as { children: Widget[] }).children.forEach((c) => c.dispose());

  Object.entries(widgets).forEach(([k, w]) => {
    if (k === 'default') {
      rootWidget.createWidget(w);
    }
    rootWidget.createWidget(w, k);
    rootWidget.forceUpdate();
  });
};

export const useWidgetService = (): {
  setRootWidget: typeof setRootWidget;
  getRootWidget: typeof getRootWidget;
  registerWidgets: typeof registerWidgets;
} => {
  return {
    setRootWidget,
    getRootWidget,
    registerWidgets
  };
};
