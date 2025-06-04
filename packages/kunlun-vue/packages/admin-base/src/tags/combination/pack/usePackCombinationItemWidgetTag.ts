import { ViewType } from '@oinone/kunlun-meta';
import { DslDefinitionWidget, DslDefinitionWidgetProps, DslRender } from '@oinone/kunlun-vue-widget';
import { Slot, Slots, VNode } from 'vue';
import { BasePackOptions, BasePackWidget } from '../../../basic';
import { ActiveLayoutEffectOpt } from '../../context';

const DEFAULT_PACK_COMBINATION_WIDGET = 'tabs';

const DEFAULT_PACK_COMBINATION_ITEM_WIDGET = 'tab';

export function usePackCombinationItemWidgetTag(
  parentWidgetInstance: DslDefinitionWidget,
  vnode: VNode
): Slot | undefined {
  const { props } = vnode;
  if (!props) {
    return undefined;
  }
  const itemProps = {
    ...props,
    metadataHandle: parentWidgetInstance.getMetadataHandle(),
    rootHandle: parentWidgetInstance.getRootHandle(),
    parentHandle: parentWidgetInstance.getCurrentHandle()
  } as DslDefinitionWidgetProps;
  if (itemProps.automatic == null) {
    itemProps.automatic = true;
  }
  const parentProps = parentWidgetInstance.getAllConfig();
  let itemPropWidget = itemProps.widget || DEFAULT_PACK_COMBINATION_ITEM_WIDGET;
  if ((parentProps.widget as string)?.toLowerCase?.() === DEFAULT_PACK_COMBINATION_WIDGET) {
    if (itemPropWidget !== DEFAULT_PACK_COMBINATION_ITEM_WIDGET) {
      itemPropWidget = DEFAULT_PACK_COMBINATION_ITEM_WIDGET;
    }
  }

  const opt = ActiveLayoutEffectOpt.getOption();

  const options: BasePackOptions = {
    viewType: parentProps.viewType as ViewType,
    widget: itemPropWidget as string,
    inline: parentProps.inline as boolean,
    model: opt?.model,
    viewName: opt?.viewName
  };
  const constructor = BasePackWidget.Selector(options);
  if (!constructor) {
    console.error('Invalid pack combination item widget', options);
    return undefined;
  }
  const itemWidget = parentWidgetInstance.createWidget(constructor, undefined, itemProps);
  return (ctx) => {
    let itemVNodes = (vnode.children as Slots)?.default?.();
    if (!itemVNodes) {
      const { dslDefinition } = props;
      if (dslDefinition) {
        itemVNodes = DslRender.fetchVNodeSlots(dslDefinition)?.default?.();
      }
    }
    if (!itemVNodes) {
      itemVNodes = [];
    }
    const res = itemWidget.render(ctx, { default: () => itemVNodes! });
    return Array.isArray(res) ? res : [res];
  };
}

/**
 * @deprecated please using {@link usePackCombinationItemWidgetTag}
 */
export const useTabWidgetTag = usePackCombinationItemWidgetTag;
