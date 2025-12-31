import { PamirsCompany } from '@oinone/kunlun-engine';
import { OioSelectItem } from '@oinone/kunlun-shared';
import { createVNode, VNode } from 'vue';
import createLogo from './logo';

export default function render(data: OioSelectItem<PamirsCompany>): string | VNode | VNode[] {
  return createVNode('div', { class: 'oio-company-select-option oio-company-select-option-style1' }, [
    createLogo(data),
    createVNode('div', { class: 'oio-company-select-option-label' }, data.label)
  ]);
}
