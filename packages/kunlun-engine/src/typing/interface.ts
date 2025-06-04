import { DslDefinition } from '@oinone/kunlun-dsl';
import { Entity, EntityId, IDslNode, IModel, IModelField, IView, ViewType } from '@oinone/kunlun-meta';
import { ISort } from '@oinone/kunlun-service';
import { WidgetProps } from '../view/widget/typing';

export type Align = 'left' | 'right' | 'center';
export type Overflow = 'hidden' | 'scroll' | 'auto';

export enum TagName {
  View = 'VIEW',
  Block = 'BLOCK',
  Grid = 'GRID',
  Step = 'STEP',
  Group = 'GROUP',
  Pack = 'PACK',
  DataV = 'DATA-V',
  Media = 'MEDIA',
  Field = 'FIELD',
  Filter = 'FILTER',
  Mask = 'MASK',
  Header = 'HEADER',
  Widget = 'WIDGET',
  Container = 'CONTAINER',
  Sidebar = 'SIDEBAR',
  Content = 'CONTENT',
  Placeholder = 'PLACEHOLDER',
  Template = 'TEMPLATE'
}

export enum Layout {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export interface ILayoutWidgetProps extends DslProps {
  widget: string;
  height: string;
  width: string;
  align: Align;
  layout: Layout;
  flexWrap: string;
  flexDirection: string;
  alignContent: string;
  flex: string;
  wrap: boolean;
  overflow: Overflow;
}

export interface IGridWidgetProps {
  span: number;
  rowIndex: string | number;
  columnIndex: string | number;

  [key: string]: unknown;
}

export const ColSpanEnum = {
  FULL: 1,
  HALF: 1 / 2,
  THIRD: 1 / 3,
  TWO_THIRDS: 2 / 3,
  QUARTER: 1 / 4,
  THREE_QUARTERS: 3 / 4
};

export const PaginationChangeSubSymbol = Symbol('PaginationChangeSubSymbol');

export interface EntityBody extends Entity {
  [key: string]: any;
}

export type IObjectValue = EntityBody;
export type IListValue = EntityBody[];

export type IdValue = EntityId;
export type BooleanValue = boolean;
export type IntegerValue = string;
export type LongValue = string;
export type FloatValue = string;
export type CurrencyValue = string;
export type StringValue = string;
export type TextValue = string;
export type HTMLValue = string;
export type DateValue = string;
export type EnumValue = SimpleValue;
export type MultiEnumValue = SimpleValue;
export type O2OValue = IObjectValue;
export type O2MValue = IListValue;
export type M2OValue = IObjectValue;
export type M2MValue = IListValue;

export type SimpleValue =
  | IdValue
  | BooleanValue
  | IntegerValue
  | LongValue
  | FloatValue
  | StringValue
  | TextValue
  | HTMLValue
  | DateValue
  | CurrencyValue;

export type ComplexValue = IObjectValue | IListValue;

export type DataValue = SimpleValue | ComplexValue;

export interface IBaseVMProps<P = any> {
  parent?: P;
}

export interface IBaseIViewProps extends IListProps, IObjectProps {
  view: IView;
  model: IModel;
}

export interface IViewProps extends DslProps, IBaseVMProps {
  isRootWidget?: boolean; // 是不是根节点
  isRootView?: boolean; // 是不是视图，默认是true
  isDialogView?: boolean; // 是不是弹窗视图
  view?: IView; // 视图数据
  model?: IModel; // 模型
}

export interface IListProps extends IViewProps {
  isFetchData?: boolean; // 是否需要在挂载后调用fetchData
  fetchListDataHook?: (params: PaginationChange) => void; // 切换分页、排序的时候会触发, 如果是嵌入视图，可以不需要该参数
}

export interface IBaseListProps extends IListProps {
  view: IView;
  model: IModel;
}

export interface IBaseObjectProps extends IObjectProps {
  view: IView;
  model: IModel;
}

export interface IObjectProps extends IViewProps {
  dslNode: IDslNode;
  isFetchData?: boolean; // 是否需要在挂载后调用fetchData
  onRowsChange?: (data: IObjectValue[]) => void; // Object视图中的action需要的数据
}

export interface DslProps extends WidgetProps {
  dslNode: IDslNode;
  metadataHandle?: string;
  rootHandle?: string;
  template?: DslDefinition;
  slotName?: string;
  widgetInline?: boolean;
  subPath?: string;
  subIndex?: string | number;

  __index?: number;

  [key: string]: any;
}

export interface FieldProps extends DslProps {
  field: IModelField; // 当前字段
  viewType: ViewType; // 视图类型
  path: string; // 路径
  fromTable?: boolean; // 是不是table中行内编辑的字段
}

export interface Pagination {
  /**
   * 请求属性
   */
  current: number;
  pageSize: number;
  /**
   * 响应属性
   */
  total: number; // fixme @zbh 20220630 应允许为空
  totalPageSize?: number;
}

// 页面视图类型，是挂在还是被销毁了
export type PageViewState = 'unmount' | 'mount';

export type PaginationChange = { current: number; pageSize: number; sort?: ISort };
