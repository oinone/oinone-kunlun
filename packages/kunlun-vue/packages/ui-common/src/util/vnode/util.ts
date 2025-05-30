import { Comment, Fragment, getCurrentInstance, isVNode, Text, VNode, VNodeChild, VNodeTypes } from 'vue';

type Children = VNodeTypes[] | VNodeTypes;

const TEMPLATE = 'template';

export const SCOPE = 'VNode';

export const isFragment = (node: unknown): node is VNode => isVNode(node) && node.type === Fragment;

export const isText = (node: VNodeChild) => (node as VNode).type === Text;

export const isComment = (node: VNodeChild) => (node as VNode).type === Comment;

export const isTemplate = (node: VNodeChild) => (node as VNode).type === TEMPLATE;

function getChildren(node: VNode, depth: number): undefined | VNode {
  if (isComment(node)) {
    return;
  }
  if (isFragment(node) || isTemplate(node)) {
    return depth > 0 ? getFirstValidNode(node.children as VNodeChild, depth - 1) : undefined;
  }
  return node;
}

export const getFirstValidNode = (nodes: VNodeChild, maxDepth = 3): ReturnType<typeof getChildren> => {
  if (Array.isArray(nodes)) {
    return getChildren(nodes[0] as VNode, maxDepth);
  }
  return getChildren(nodes as VNode, maxDepth);
};

export function getVNodeKey(): string | undefined {
  const instance = getCurrentInstance();
  if (!instance) {
    console.warn('Invalid VNode instance.');
    return undefined;
  }
  const key = typeof instance.vnode.key === 'symbol' ? String(instance.vnode.key) : instance.vnode.key;
  if (key == null) {
    return undefined;
  }
  return `${key}`;
}
