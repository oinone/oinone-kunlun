export enum TableLineHeightType {
  default = 'default',
  small = 'small',
  middle = 'middle',
  large = 'large',
  auto = 'auto'
}

export enum TableLineHeightMap {
  small = 32,
  middle = 48,
  large = 64
}

export const menuItems = [
  { icon: 'oinone-biaotoushezhi', label: '左右移动单元格', keyCode: 'Tab', shift: true },
  { icon: 'oinone-biaotoushezhi', label: '上下移动单元格', keyCode: 'Enter', shift: true, ctrl: true },
  { icon: 'oinone-biaotouzhankai', label: '展开或收起下拉选项框', keyCode: 'Enter', shift: false },
  { icon: 'oinone-biaotouzhankai', label: '选中选项', keyCode: 'Enter', shift: false, ctrl: false },
  { icon: 'oinone-biaotouzhankai', label: '取消编辑', keyCode: 'Escape', shift: false },
];
