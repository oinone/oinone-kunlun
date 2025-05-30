import { StableSlotProp } from '@kunlun/vue-ui-common';
import { Slots, VNode } from 'vue';
import { VueWidget } from '../basic';

export function renderWidgets(widgets: VueWidget[], ctx: Record<string, unknown>, slots?: Slots) {
  let vNodes: VNode | VNode[] | undefined;
  const { length } = widgets;
  for (let i = length - 1; i >= 0; i--) {
    const widget = widgets[i];
    if (vNodes) {
      const finalVNodes = Array.isArray(vNodes) ? vNodes : [vNodes];
      vNodes = widget.render(ctx, { default: () => finalVNodes, ...StableSlotProp });
    } else {
      vNodes = widget.render(ctx, {
        ...slots,
        ...StableSlotProp
      });
    }
  }
  return vNodes;
}
