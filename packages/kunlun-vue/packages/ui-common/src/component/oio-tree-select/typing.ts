import { VNode } from 'vue';
import { TreeSelectNode } from './model';

export enum TreeSelectCheckedStrategy {
  SHOW_ALL = 'SHOW_ALL',
  SHOW_CHILD = 'SHOW_CHILD',
  SHOW_PARENT = 'SHOW_PARENT'
}

export interface TreeSelectTagRenderContext<T = unknown> {
  label: string;
  value: string;
  disabled: boolean;
  closable: boolean;
  onClose: (event: PointerEvent) => void;
  data: TreeSelectNode<T>;
}

export interface TreeSelectNodeChangeEvent<T = unknown> {
  targetValue: string;
  checked: boolean;
  origin: T;
}

export interface SimpleTreeSelected {
  label: string;
  value: string | number;
  disabled: boolean;
}

export type TreeSelectDisplayRenderFunction = (values: {
  labels: string[];
  selectedOptions: TreeSelectNode[];
}) => string;

export type TreeSelectTagRenderFunction = (context: TreeSelectTagRenderContext) => VNode | VNode[];
