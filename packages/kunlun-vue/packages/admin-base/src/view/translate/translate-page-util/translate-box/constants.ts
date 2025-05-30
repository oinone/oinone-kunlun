import { TranslateManageItem } from '../typings';

export const translateAddText = {
  modalTitle: '添加翻译项',
  leftTitle: '选择要添加的翻译项',
  leftSelectPlhd: '输入包含的源术语匹配待添加项',
  leftList: '添加项列表',
  leftEmpty: '当前不存在待添加翻译项',
  rightEmpty: '当前未选择添加翻译项'
};
export const translateUpdateText = {
  modalTitle: '更改翻译项',
  leftTitle: '选择要修改的翻译项',
  leftSelectPlhd: '输入包含的翻译值匹配待修改项',
  leftList: '修改项列表',
  leftEmpty: '当前不存在待修改翻译项',
  rightEmpty: '当前未选择翻译修改项'
};

// 为了解决rollup内部的bug而兼容一个初始值过来
export const defaultCurrentTranslate: TranslateManageItem = {
  id: '-1',
  lang: { name: 'string', code: 'string' },
  module: 'string',
  moduleDefinition: {
    displayName: 'string',
    module: 'string',
    id: 'string'
  },
  origin: 'string',
  target: 'string',
  resLang: { name: 'string', code: 'string' },
  scope: 'string',
  state: false
};
