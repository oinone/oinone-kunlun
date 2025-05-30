import { Optional } from '@kunlun/shared';
import { Component, VNode } from 'vue';

export type HTMLElementEntity = HTMLElement & Record<string, unknown>;

export function fetchOioDraggableComponent(sendEvent) {
  return Optional.ofNullable(sendEvent.relatedContext)
    .map((v) => v.component)
    .map((v) => v.$parent)
    .orElse(undefined);
}

export function getUnderlyingPotencialDraggableComponent(htmElement: HTMLElementEntity): Component {
  return htmElement.__draggable_component__ as Component;
}

export function isTransition(name: string) {
  return ['transition-group', 'TransitionGroup'].includes(name);
}

const skipVNodeTypes = ['Symbol(Fragment)'];

export function skipVNode(vns: VNode) {
  if (skipVNodeTypes.includes(vns.type.toString())) {
    return vns.children;
  }
  return vns;
}
