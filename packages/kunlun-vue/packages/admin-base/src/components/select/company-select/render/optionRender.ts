import { PamirsCompany } from '@oinone/kunlun-engine';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { createVNode, VNode } from 'vue';
import styleRender1 from './style1';
import styleRender2 from './style2';

export type CompanySelectOptionRender = (data: SelectItem<PamirsCompany>) => string | VNode | VNode[];

export interface CompanySelectOption {
  key: string;
  label: string;
}

const options = new Map<string, CompanySelectOption>();
const renders = new Map<string, CompanySelectOptionRender>();

export function registerCompanySelectOptionRender(option: CompanySelectOption, render: CompanySelectOptionRender) {
  options.set(option.key, option);
  renders.set(option.key, render);
}

export function selectorCompanySelectOptionRender(bizStyle: string | null | undefined): CompanySelectOptionRender {
  if (bizStyle) {
    return renders.get(bizStyle) || defaultRender;
  }
  return defaultRender;
}

export function getCompanySelectOptions(): CompanySelectOption[] {
  return Array.from(options.values());
}

function defaultRender(data: SelectItem<PamirsCompany>) {
  return createVNode('div', { class: 'oio-company-select-option-label' }, data.label);
}

registerCompanySelectOptionRender(
  {
    key: 'style1',
    label: '精简样式'
  },
  styleRender1
);
registerCompanySelectOptionRender(
  {
    key: 'style2',
    label: '详细样式'
  },
  styleRender2
);
