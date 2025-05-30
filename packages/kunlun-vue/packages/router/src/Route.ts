import { _useMatched, Matched, matchPath } from '@kunlun/router';
import { ViewWidget } from '@kunlun/vue-widget';
import { SetupContext, toRefs, VNodeProps } from 'vue';
import { BaseRouterWidget } from './basic';
import { useSegmentGroup } from './helpers/useSegmentGroup';
import { useWidgetService, Widgets } from './useWidget';

export interface RouteProps {
  path: string;
  slotName: string;
  namespace?: string;
  computedMatched?: Matched;
  widgets?: Widgets;
  widget?: string;
}

export const ROUTE_COMPONENT_NAME = 'Route';

const RouteImpl = {
  name: ROUTE_COMPONENT_NAME,
  inheritAttrs: false,
  props: {
    path: String,
    slotName: {
      type: String,
      required: true
    },
    namespace: String,
    computedMatched: Object,
    widgets: Object,
    widget: String
  },
  setup(props: RouteProps, { slots }: SetupContext) {
    const { widget, widgets } = props;
    const { path, namespace, computedMatched } = toRefs(props);
    const { currentSegmentGroup } = useSegmentGroup(namespace?.value);
    const { matched, setMatched } = _useMatched();
    const { registerWidgets } = useWidgetService();
    let widgetClass = {};
    if (widget) {
      const constructor = BaseRouterWidget.Selector({ widget }) || ViewWidget.Selector({ widget });
      if (constructor && props.slotName) {
        widgetClass = { [props.slotName]: constructor };
      } else {
        throw new Error(`路由${path}对应的页面:${widget}匹配异常`);
      }
      registerWidgets(widgetClass);
    }
    if (widgets) {
      registerWidgets(widgets);
    }
    return () => {
      if (!slots.default || !currentSegmentGroup.value) {
        if (!currentSegmentGroup.value && slots.default) {
          return slots.default();
        }
        return null;
      }

      let currentMatched: Matched | null;
      const children = slots.default();

      if (computedMatched?.value) {
        currentMatched = computedMatched.value;
      } else {
        // 有配置路由 path 則去匹配 matched 結構，沒有配置路由 path 則使用上下文的 matched 結構
        currentMatched = path.value ? matchPath(currentSegmentGroup.value?.segments, { path: path.value }) : matched;
      }

      if (currentMatched) {
        setMatched(currentMatched);
      }

      return currentMatched ? children : null;
    };
  }
};

export const Route = RouteImpl as any as {
  new (): {
    $props: VNodeProps & RouteProps;
  };
};
