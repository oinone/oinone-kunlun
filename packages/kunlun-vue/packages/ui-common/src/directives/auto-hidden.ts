import { BooleanHelper, CastHelper, CSSStyle, NumberHelper } from '@oinone/kunlun-shared';
import { ObjectDirective } from '@vue/runtime-core';
import { isObject } from 'lodash-es';
import { nextTick } from 'vue';
import { DEFAULT_PREFIX } from '../theme';
import { StyleHelper } from '../util';

type BooleanString = 'true' | 'false';

const expandClassName = `${DEFAULT_PREFIX}-auto-hidden-toolbar`;

const foldClassName = `${DEFAULT_PREFIX}-auto-hidden-fold`;

const iconName = 'oinone-menu-caidanxiala';

interface AutoHiddenDataset {
  expanded?: BooleanString;
  isFold?: BooleanString;
}

interface AutoHiddenToolbarDataset {
  isAutoHiddenToolbar?: BooleanString;
}

function createAutoHiddenToolbar(el: HTMLElement, height: number): void {
  let toolbar = findAutoHiddenToolbar(el);
  let expandButton: HTMLElement;
  if (toolbar) {
    expandButton = toolbar.children?.[0] as HTMLElement;
  } else {
    toolbar = document.createElement('div');
    const dataset = toolbar.dataset as AutoHiddenToolbarDataset;
    dataset.isAutoHiddenToolbar = 'true';

    expandButton = document.createElement('a');
    expandButton.onclick = (e) => onClick(e, el, height);
    toolbar.append(expandButton);

    const label = document.createElement('span');
    expandButton.append(label);

    const icon = document.createElement('span');
    icon.classList.add(`${DEFAULT_PREFIX}-icon`, `${DEFAULT_PREFIX}-icon-${iconName}`);
    icon.innerHTML = `<svg class="${DEFAULT_PREFIX}-iconfont ${iconName}" role="img" aria-label="pushpin">
    <use xlink:href="#${iconName}" aria-hidden="true" />
</svg>`;
    expandButton.append(icon);

    el.append(toolbar);
  }
  if (!toolbar.classList.contains(expandClassName)) {
    toolbar.classList.add(expandClassName);
  }
  toolbar.classList.remove(foldClassName);
  if (expandButton) {
    const label = expandButton.children?.[0] as HTMLElement;
    if (label) {
      label.innerText = '展开';
    }
    const icon = expandButton.children?.[1] as HTMLElement;
    if (icon) {
      icon.style.transform = CastHelper.cast(null);
    }
  }
}

function removeAutoHiddenToolbar(el: HTMLElement, isFold = false): void {
  const toolbar = findAutoHiddenToolbar(el);
  if (toolbar) {
    if (isFold) {
      if (!toolbar.classList.contains(foldClassName)) {
        toolbar.classList.add(foldClassName);
      }
      const expandButton = toolbar.children?.[0] as HTMLElement;
      if (expandButton) {
        const label = expandButton.children?.[0] as HTMLElement;
        if (label) {
          label.innerText = '收起';
        }
        const icon = expandButton.children?.[1] as HTMLElement;
        if (icon) {
          icon.style.transform = 'rotate(180deg)';
        }
      }
    } else {
      toolbar.remove();
    }
  }
}

function findAutoHiddenToolbar(el: HTMLElement): HTMLElement | undefined {
  const lastChild = el.lastElementChild as HTMLElement;
  if (lastChild) {
    const dataset = lastChild.dataset as AutoHiddenToolbarDataset;
    if (dataset && dataset.isAutoHiddenToolbar === 'true') {
      return lastChild;
    }
  }
}

function onClick(e: MouseEvent, el: HTMLElement, height: number) {
  e.stopPropagation();
  e.preventDefault();
  autoHidden(el, height);
}

function autoHidden(el: HTMLElement, options: number | AutoHiddenOptions) {
  let height: number;
  let isFold: boolean | undefined;
  if (isObject(options)) {
    height = NumberHelper.toNumber(options.height) || 0;
    isFold = options.isFold;
  } else {
    height = NumberHelper.toNumber(options) || 0;
  }
  const rectHeight = el.getBoundingClientRect?.().height;
  const dataset = el.dataset as AutoHiddenDataset;
  const style = el.style as CSSStyle;
  const datasetExpanded = dataset.expanded;
  const expanded = BooleanHelper.toBoolean(datasetExpanded) || false;
  if (expanded) {
    // 展开 -> 收起
    style.height = CastHelper.cast(StyleHelper.px(height));
    style.position = 'relative';
    style.overflow = 'hidden';
    dataset.expanded = 'false';
    createAutoHiddenToolbar(el, height);
  } else if (datasetExpanded) {
    // 收起 -> 展开
    style.height = CastHelper.cast(null);
    style.position = CastHelper.cast(null);
    style.overflow = CastHelper.cast(null);
    dataset.expanded = 'true';
    removeAutoHiddenToolbar(el, BooleanHelper.toBoolean(dataset.isFold));
  } else if (rectHeight && height && rectHeight > height) {
    // 初始化
    style.height = CastHelper.cast(StyleHelper.px(height));
    style.position = 'relative';
    style.overflow = 'hidden';
    dataset.expanded = 'false';
    if (isFold) {
      dataset.isFold = `${isFold}`;
    }
    createAutoHiddenToolbar(el, height);
  }
}

export interface AutoHiddenOptions {
  height: number;
  isFold?: boolean;
}

export const vAutoHidden: ObjectDirective<HTMLElement, number | AutoHiddenOptions> = {
  mounted: (el: HTMLElement, options) => {
    nextTick(() => {
      setTimeout(() => {
        autoHidden(el, options.value || 0);
      }, 300);
    });
  },
  updated: (el: HTMLElement, options) => {
    autoHidden(el, options.value || 0);
  }
};
