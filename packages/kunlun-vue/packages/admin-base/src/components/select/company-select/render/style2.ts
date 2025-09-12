import { PamirsCompany, StaffSize } from '@oinone/kunlun-engine';
import { OioDivider, Optional } from '@oinone/kunlun-vue-ui-antd';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { createVNode, VNode } from 'vue';
import createLogo from './logo';

export default function render(data: SelectItem<PamirsCompany>): string | VNode | VNode[] {
  const optionInfos: VNode[] = [];
  const pushOptionInfo = (optionInfo: VNode): void => {
    if (optionInfos.length) {
      optionInfos.push(createVNode(OioDivider, { type: 'vertical' }));
    }
    optionInfos.push(optionInfo);
  };
  Optional.ofNullable(data.data.responsiblePerson?.name)
    .map((v) => createVNode('div', { class: 'oio-company-select-option-legal-person' }, v))
    .ifPresent(pushOptionInfo);
  Optional.ofNullable(data.data.staffSize)
    .map((v) => StaffSize[v])
    .map((v) => createVNode('div', { class: 'oio-company-select-option-staff-size' }, v))
    .ifPresent(pushOptionInfo);
  Optional.ofNullable(data.data.licenseRegisterTime)
    .map((v) => createVNode('div', { class: 'oio-company-select-license-register-time' }, v))
    .ifPresent(pushOptionInfo);
  const wrapperNodes: VNode[] = [createVNode('div', { class: 'oio-company-select-option-label' }, data.label)];
  if (optionInfos.length) {
    wrapperNodes.push(createVNode('div', { class: 'oio-company-select-option-info' }, optionInfos));
  }
  return createVNode('div', { class: 'oio-company-select-option oio-company-select-option-style2' }, [
    createLogo(data),
    createVNode('div', { class: 'oio-company-select-option-wrapper' }, wrapperNodes)
  ]);
}
