import { OioTreeNode } from '@kunlun/vue-ui-common';
import { TreeData } from './tree';

export interface CardCascaderItemData extends TreeData {
  expandedKeys?: string[];
  selectedKeys?: string[];
  searchValue?: string;
  parentNode?: OioTreeNode<CardCascaderItemData>;
}
