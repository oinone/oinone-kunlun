import { DslDefinitionWidget, DslDefinitionWidgetProps, DslRender } from '@oinone/kunlun-vue-widget';
import { Slot, Slots, VNode } from 'vue';
import { DefaultTabWidget } from '../../container';

export function useTabWidgetTag(tabsWidgetInstance: DslDefinitionWidget, vnode: VNode): Slot | undefined {
  const { props } = vnode;
  if (!props) {
    return undefined;
  }
  const tabProps = {
    ...props,
    metadataHandle: tabsWidgetInstance.getMetadataHandle(),
    rootHandle: tabsWidgetInstance.getRootHandle(),
    parentHandle: tabsWidgetInstance.getCurrentHandle()
  } as DslDefinitionWidgetProps;
  if (tabProps.automatic == null) {
    tabProps.automatic = true;
  }
  // const tabsProps = tabsWidgetInstance.getAllConfig();
  // const options: BasePackOptions = {
  //   viewType: tabsProps.viewType as ViewType,
  //   widget: tabProps.widget as string,
  //   inline: tabsProps.inline as boolean
  // };
  // const constructor = BasePackWidget.Selector(options);
  // if (!constructor) {
  //   console.error('Invalid pack tab widget', options);
  //   return undefined;
  // }
  const tabWidget = tabsWidgetInstance.createWidget(new DefaultTabWidget(), undefined, tabProps);
  return (ctx) => {
    let tabChildrenVNodes = (vnode.children as Slots)?.default?.();
    if (!tabChildrenVNodes) {
      const { dslDefinition } = props;
      if (dslDefinition) {
        tabChildrenVNodes = DslRender.fetchVNodeSlots(dslDefinition)?.default?.();
      }
    }
    if (!tabChildrenVNodes) {
      tabChildrenVNodes = [];
    }
    const res = tabWidget.render(ctx, { default: () => tabChildrenVNodes! });
    return Array.isArray(res) ? res : [res];
  };
}
