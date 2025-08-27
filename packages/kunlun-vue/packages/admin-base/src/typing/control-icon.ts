export enum TableLineHeightEnum {
  DEFAULT = 'DEFAULT',
  AUTO = 'AUTO',
  SMALL = 'SMALL',
  MIDDLE = 'MIDDLE',
  LARGE = 'LARGE'
}

export enum TableLineHeightMap {
  DEFAULT = 0,
  AUTO = 0,
  SMALL = 40,
  MIDDLE = 48,
  LARGE = 56
}

export const menuItems = [
  { icon: 'oinone-biaotoushezhi', label: '左右移动单元格', keyCode: 'Tab', shift: true },
  { icon: 'oinone-biaotoushezhi', label: '上下移动单元格', keyCode: 'Enter', shift: true, ctrl: true },
  { icon: 'oinone-biaotouzhankai', label: '展开或收起下拉选项框', keyCode: 'Enter', shift: false },
  { icon: 'oinone-biaotouzhankai', label: '选中选项', keyCode: 'Enter', shift: false, ctrl: false },
  { icon: 'oinone-biaotouzhankai', label: '取消编辑', keyCode: 'Escape', shift: false }
];
