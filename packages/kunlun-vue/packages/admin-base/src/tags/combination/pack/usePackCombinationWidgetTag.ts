import { DslDefinitionWidget, DslRender } from '@oinone/kunlun-vue-widget';
import { SetupContext, Slot, VNode } from 'vue';
import { useWidgetTag, UseWidgetTagContext } from '../../mixin';
import { InternalWidget } from '../../resolve';
import { usePackCombinationItemWidgetTag } from './usePackCombinationItemWidgetTag';

export function usePackCombinationWidgetTag(props: UseWidgetTagContext, context: SetupContext) {
  const itemRenders: Slot[] = [];
  const combinationWidgetResult = useWidgetTag(props, context, {
    getWidgetTag(): InternalWidget {
      return InternalWidget.PackCombination;
    },
    getCurrentSlots() {
      return {
        default: (...args) => {
          let children: VNode[] = [];
          itemRenders.forEach((tabRender) => {
            children = [...children, ...tabRender(...args)];
          });
          return children;
        }
      };
    }
  });
  const combinationWidgetInstance = combinationWidgetResult.widget.value as DslDefinitionWidget;
  if (!combinationWidgetInstance) {
    return combinationWidgetResult;
  }
  const defaultSlot =
    (
      DslRender.fetchVNodeSlots(props.dslDefinition) || (Object.keys(context.slots).length ? context.slots : undefined)
    )?.default?.() || [];
  defaultSlot.forEach((vnode) => {
    const itemVNode = usePackCombinationItemWidgetTag(combinationWidgetInstance, vnode);
    if (itemVNode) {
      if (Array.isArray(itemVNode)) {
        itemVNode.forEach((v) => itemRenders.push(v));
      } else {
        itemRenders.push(itemVNode);
      }
    } else {
      console.error('Pack combination item node create error', vnode);
    }
  });
  return combinationWidgetResult;
}

/**
 * @deprecated please using {@link usePackCombinationWidgetTag}
 */
export const useTabsWidgetTag = usePackCombinationWidgetTag;
