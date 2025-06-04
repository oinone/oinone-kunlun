import { DEFAULT_TAB_TITLE } from '@oinone/kunlun-vue-ui-common';
import { createVNode, Ref, unref, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export function useTabBar(title: string | Ref<string>, invisible: boolean): VNode {
  const titleValue = unref(title) || DEFAULT_TAB_TITLE;
  return createVNode(
    'div',
    {
      class: [`${DEFAULT_PREFIX}-tab-bar`, invisible && `${DEFAULT_PREFIX}-tab-bar-invisible`]
    },
    [createVNode('span', { class: `${DEFAULT_PREFIX}-tab-title`, title: titleValue }, titleValue)]
  );
}
