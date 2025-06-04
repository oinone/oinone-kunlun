import { DEFAULT_TAB_TITLE, TabHTMLNode } from '@oinone/kunlun-vue-ui-common';
import { createVNode, Ref, unref, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';

export function useTabBar(title: string | Ref<string>, help?: string | Ref<string>): VNode {
  const titleValue = unref(title) || DEFAULT_TAB_TITLE;
  const vnodes = [
    createVNode(
      'span',
      { class: 'oio-tab-title', title: titleValue },
      titleValue
    )
  ]
  const helpValue = unref(help) || '';
  if (helpValue && helpValue !== '') {
    vnodes.push(
      createVNode(
        ATooltip,
        { placement: 'top', overlayStyle: { maxWidth: '260px' } as CSSStyleDeclaration },
        {
          title: () => {
            return [createVNode('span', {}, helpValue)];
          },
          default: () => {
            return [createVNode(QuestionCircleOutlined, { class: 'oio-question-icon', style: { marginLeft: '5px' } as CSSStyleDeclaration })];
          }
        }
      )
    );
  }
  return createVNode(
    'div',
    {
      class: 'oio-tab-bar'
    },
    vnodes
  );
}

const INVISIBLE_CLASS_NAME = `${DEFAULT_PREFIX}-tab-bar-invisible`;

export function onTabInvisibleChange(nodes: TabHTMLNode[], index: number, invisible: boolean | undefined) {
  const currentTabHTMLNode = nodes[index];
  if (!currentTabHTMLNode || index !== currentTabHTMLNode.index) {
    return;
  }
  onTabInvisible(currentTabHTMLNode.el, invisible);
}

export function onTabInvisible(el: HTMLElement, invisible: boolean | undefined) {
  if (invisible) {
    addInvisibleClassName(el);
  } else {
    removeInvisibleClassName(el);
  }
}

function addInvisibleClassName(el: HTMLElement) {
  const { classList } = el;
  if (!classList.contains(INVISIBLE_CLASS_NAME)) {
    classList.add(INVISIBLE_CLASS_NAME);
  }
}

function removeInvisibleClassName(el: HTMLElement) {
  el.classList.remove(INVISIBLE_CLASS_NAME);
}
