import { IDslNode } from '@oinone/kunlun-meta';
import { ViewWidget } from '@oinone/kunlun-vue-widget';

type Align = 'left' | 'center' | 'right';

enum TagLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

const ignoreAttr = ['widgetInstance', 'children'];

const ignorePatchProps = ['replaceTag', 'replaceProps', 'replaceWidget'];

interface TagAttrs extends IDslNode {
  widget?: string;
  height?: string;
  width?: string;
  align?: Align | string;
  layout?: TagLayout;
  flex?: number;
  wrap?: boolean;
  overflow?: string;
  replaceTag?: boolean; // 是否要替换标签「如果为true，就重新渲染当前对应的widget」
  replaceProps?: boolean; // 是否要替换属性「如果为true，就动态修改属性」
  replaceWidget?: boolean; // 是否要替换widget如果为true，就重新渲染当前对应的widget」
}

interface IResolveWidget extends TagAttrs {
  widgetInstance: ViewWidget; // SPI中注册的widget
  children: IResolveWidget[]; // 子节点
  childrenIndex?: number; // 如果当前是子节点，那么childrenIndex代表是当前下标
}

export { TagLayout, ignoreAttr, ignorePatchProps, TagAttrs, IResolveWidget };
