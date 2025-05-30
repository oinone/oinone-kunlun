import {
  cloneVNode,
  SetupContext,
  VNodeProps,
  isVNode,
  VNode,
  RendererNode,
  RendererElement,
  ConcreteComponent,
  toRefs,
  Fragment,
  computed,
  ref,
  watch
} from 'vue';
import { UrlSegment, matchPath, Matched, _useMatched } from '@kunlun/router';

import { RouteProps, ROUTE_COMPONENT_NAME } from './Route';
import { REDIRECT_COMPONENT_NAME } from './Redirect';
import { useSegmentGroup } from './helpers/useSegmentGroup';
import { useWidgetService } from './useWidget';

export interface MatchProps {
  namespace?: string;
  rootToken?: string;
}

const MATCH_COMPONENTS = [ROUTE_COMPONENT_NAME, REDIRECT_COMPONENT_NAME];

const unwrapFragment = (
  children: VNode<RendererNode, RendererElement, RouteProps>[]
): VNode<RendererNode, RendererElement, RouteProps>[] => {
  return children.reduce(
    (prev, child) => [...prev, ...(child.type === Fragment ? unwrapFragment(child.children as any) : [child])],
    [] as any
  );
};

const MatchImpl = {
  name: 'Match',
  props: {
    namespace: String,
    rootToken: String
  },
  setup(props: MatchProps, { slots }: SetupContext) {
    const { rootToken } = props;
    const { namespace } = toRefs(props);
    const { currentSegmentGroup } = useSegmentGroup(namespace?.value);
    const { matched, setMatched } = _useMatched();

    // widgets
    let nodeCodeRef: any;
    if (rootToken) {
      const { setRootWidget } = useWidgetService();
      const rootWidget = setRootWidget(rootToken);
      nodeCodeRef = rootWidget.getNodeCodeRef();
    }

    const computedMatched = computed(() => {
      if (!slots.default) {
        return null;
      }

      let segments: UrlSegment[] = [];
      if (currentSegmentGroup.value) {
        segments = currentSegmentGroup.value.segments;
      }

      let element!: VNode;
      let currentMatched: Matched = null as any;
      const children = unwrapFragment(slots.default() as VNode<RendererNode, RendererElement, RouteProps>[]);
      children.forEach((child) => {
        if (currentMatched || !isVNode(child)) {
          return;
        }
        const comp = child.type as ConcreteComponent;
        const { name } = comp;
        if (!MATCH_COMPONENTS.includes(name as string)) {
          return;
        }

        // 这样能匹配到 redirect
        element = child;

        const { path: childPath } = child.props!;

        currentMatched = childPath ? matchPath(segments, { path: childPath })! : matched;
      });

      if (!currentMatched) {
        return null;
      }

      setMatched(currentMatched);

      return { currentMatched, element };
    });

    const cacheMatched: any = ref(null);

    watch(
      [computedMatched],
      ([cm], [prevCm]) => {
        if (cacheMatched.value && cm?.currentMatched.path === prevCm?.currentMatched.path) {
          return;
        }
        cacheMatched.value = cm;
      },
      { immediate: true }
    );

    return () => {
      if (!cacheMatched.value || !nodeCodeRef.value) {
        return;
      }

      // TODO: 不使用 key 來觸发 vnode 更新
      return cloneVNode(cacheMatched.value!.element, {
        key: cacheMatched.value!.element! as any,
        computedMatched: cacheMatched.value!.currentMatched
      });
    };
  }
};

export const Match = (MatchImpl as any) as {
  new (): {
    $props: VNodeProps & MatchProps;
  };
};
