import { DslDefinitionWidget, DslRender } from '@kunlun/vue-widget';
import { SetupContext, Slot, VNode } from 'vue';
import { useWidgetTag, UseWidgetTagContext } from '../mixin';
import { InternalWidget } from '../resolve';
import { useTabWidgetTag } from './useTabWidgetTag';

export function useTabsWidgetTag(props: UseWidgetTagContext, context: SetupContext) {
  const tabRenders: Slot[] = [];
  const tabsWidgetResult = useWidgetTag(props, context, {
    getWidgetTag(): InternalWidget {
      return InternalWidget.Tabs;
    },
    getCurrentSlots() {
      return {
        default: (...args) => {
          let children: VNode[] = [];
          tabRenders.forEach((tabRender) => {
            children = [...children, ...tabRender(...args)];
          });
          return children;
        }
      };
    }
  });
  const tabsWidgetInstance = tabsWidgetResult.widget.value as DslDefinitionWidget;
  if (!tabsWidgetInstance) {
    return tabsWidgetResult;
  }
  const defaultSlot =
    (
      DslRender.fetchVNodeSlots(props.dslDefinition) || (Object.keys(context.slots).length ? context.slots : undefined)
    )?.default?.() || [];
  defaultSlot.forEach((vnode) => {
    const tabVNode = useTabWidgetTag(tabsWidgetInstance, vnode);
    if (tabVNode) {
      if (Array.isArray(tabVNode)) {
        tabVNode.forEach((v) => tabRenders.push(v));
      } else {
        tabRenders.push(tabVNode);
      }
    } else {
      console.error('tab node create error', vnode);
    }
  });
  return tabsWidgetResult;
}
