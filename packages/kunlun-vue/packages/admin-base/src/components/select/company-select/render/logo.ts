import { PamirsCompany } from '@oinone/kunlun-engine';
import { OioSelectItem, StringHelper } from '@oinone/kunlun-shared';
import { createVNode, VNode } from 'vue';

export default function render(data: OioSelectItem<PamirsCompany>): VNode {
  const { logoUrl } = data.data;
  const classNames = ['oio-company-select-option-logo'];
  if (logoUrl) {
    classNames.push('oio-company-select-option-logo-img');
    return createVNode('div', { class: classNames }, [createVNode('img', { src: logoUrl })]);
  }
  classNames.push('oio-company-select-option-logo-label');
  let first = data.label.trim().charAt(0);
  if (StringHelper.isLetter(first.charCodeAt(0))) {
    first = first.toUpperCase();
  }
  return createVNode('div', { class: classNames }, [createVNode('span', {}, first)]);
}
