import { cloneVNode, Slot, VNode, VNodeProps } from 'vue';
import { getFirstValidNode } from '../../../util/vnode/util';
import { DEFAULT_SLOT_NAME } from './constant';

export default function renderTrigger(slots: Record<string, Slot>, props: Record<string, unknown> & VNodeProps): VNode {
  const trigger = getFirstValidNode(slots.trigger(), 1);
  if (!trigger) {
    throw new Error(`${DEFAULT_SLOT_NAME} Slot must be provided`);
  }
  return cloneVNode(trigger, props, true);
}
