import { PamirsCompany } from '@oinone/kunlun-engine';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { createVNode, VNode } from 'vue';
import createLogo from './logo';

export default function render(data: SelectItem<PamirsCompany>): string | VNode | VNode[] {
  return createVNode('div', { class: 'oio-company-select-option oio-company-select-option-style1' }, [
    createLogo(data),
    createVNode('div', { class: 'oio-company-select-option-label' }, data.label)
  ]);
}
