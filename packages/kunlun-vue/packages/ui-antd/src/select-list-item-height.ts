import { Select } from 'ant-design-vue';

/**
 * 默认尺寸下拉选项的最小高度，单位 px。
 * ant-design-vue 选项样式的 minHeight 取主题 controlHeight，默认是 32。
 * 虚拟列表在量到真实行高之前按 listItemHeight 估算滚动位置，库默认 24，选项一多可视区域就会落到节点外面。
 */
export const SELECT_LIST_ITEM_HEIGHT = 32;

type PropWithDefault = {
  default?: number;
};

/**
 * 把未传入 listItemHeight 的 ASelect 默认行高改成选项真实高度。
 * 只改组件 props 上的 default。调用方显式传入 listItemHeight 时仍用传入值。
 * 分页里的 MiniSelect 用的是另一份 props，读不到这里的默认值。
 */
export function ensureSelectListItemHeight(): void {
  const props = (Select as { props?: Record<string, PropWithDefault> }).props;
  const listItemHeight = props?.listItemHeight;
  if (!listItemHeight || !Object.prototype.hasOwnProperty.call(listItemHeight, 'default')) {
    return;
  }
  listItemHeight.default = SELECT_LIST_ITEM_HEIGHT;
}
