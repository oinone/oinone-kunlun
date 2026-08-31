import { ViewType } from '@oinone/kunlun-meta';
import { ButtonBizStyle, ButtonType } from '@oinone/kunlun-vue-ui-common';

type StateEntity = {
  readonly handle: string;

  [key: string]: any;
};

export interface RenderPosition {
  handle: string;
  slotName?: string;
  rowIndex?: number; // fixme @zbh 20251205 rowIndex 无法准确设置，暂不可用
}

export interface OioGlobalState {
  fullscreen: boolean;
  disabledRelationQuery?: boolean;

  mainViewHandle?: string;

  getMainViewState(): OioAnyViewState | undefined;
}

export interface OioViewState extends StateEntity {
  /**
   * Vue生命周期时可能有值，用于获取渲染参数处理属性多态的问题
   */
  __position: RenderPosition[];

  parent?: OioViewState;
  fullscreen: boolean;
  viewType?: ViewType;
  popupScene?: string;

  createActionBarState(options: { handle: string } & Partial<Omit<OioActionBarState, 'handle'>>): OioActionBarState;

  /**
   * 此获取方法仅能用在Vue生命周期，否则无法准确获取真实的ActionBar状态变量
   */
  getActionBarState(rowIndex?: number): OioActionBarState | undefined;

  pushField(handle: string, rowIndex?: number): void;

  popField(handle: string, rowIndex?: number): void;

  pushAction(handle: string, rowIndex?: number): void;

  popAction(handle: string, rowIndex?: number): void;
}

export interface OioActionBarState extends StateEntity {
  inline?: boolean;
  actions: string[];
  visibleActions: string[];
  bizStyle?: string;

  getActionBarBizStyle?(actionHandle: string): { type: ButtonType; bizStyle: ButtonBizStyle } | undefined;
}

export interface OioTableViewState extends OioViewState {
  searchView?: string;
  actionBar?: OioActionBarState;
  actionBars?: Record<string, OioActionBarState>;
  inlineActionBars?: OioActionBarState[];
  table?: string;
  fields?: string[];
  fieldWidgets?: Record<string, string>;
}

export interface OioSearchViewState extends OioViewState {
  search?: string;
  fields?: string[];
  fieldWidgets?: Record<string, string>;
}

export interface OioFormViewState extends OioViewState {
  draftCode?: string;
  actionBar?: OioActionBarState;
  actionBars?: Record<string, OioActionBarState>;
  form?: string;
  fields?: string[];
  fieldWidgets?: Record<string, string>;
}

export interface OioDetailViewState extends OioViewState {
  actionBar?: OioActionBarState;
  actionBars?: Record<string, OioActionBarState>;
  detail?: string;
  disabledRelationQuery?: boolean;
  fields?: string[];
  fieldWidgets?: Record<string, string>;
}

export interface OioCardState extends StateEntity {
  titleProps?: Record<string, unknown>;
  contentProps?: Record<string, unknown>;

  fields?: string[];
  fieldWidgets?: Record<string, string>;
}

export interface OioGalleryViewState extends OioViewState {
  searchView?: string;
  actionBar?: OioActionBarState;
  inlineActionBars?: OioActionBarState[];
  gallery?: string;
  cards?: OioCardState[];
}

export interface OioTreeViewState extends OioViewState {
  searchView?: string;
  actionBar?: OioActionBarState;
  tree?: string;
  fields?: string[];
  fieldWidgets?: Record<string, string>;
}

export type OioAnyViewState =
  | OioTableViewState
  | OioSearchViewState
  | OioFormViewState
  | OioDetailViewState
  | OioGalleryViewState
  | OioTreeViewState;

export type OioListViewState = OioTableViewState | OioGalleryViewState;

export type OioObjectViewState = OioFormViewState | OioDetailViewState | OioSearchViewState;

export function isTableViewState(state: OioAnyViewState): state is OioTableViewState {
  return state.viewType === ViewType.Table;
}

export function isSearchViewState(state: OioAnyViewState): state is OioSearchViewState {
  return state.viewType === ViewType.Search;
}

export function isFormViewState(state: OioAnyViewState): state is OioFormViewState {
  return state.viewType === ViewType.Form;
}

export function isDetailViewState(state: OioAnyViewState): state is OioDetailViewState {
  return state.viewType === ViewType.Detail;
}

export function isGalleryViewState(state: OioAnyViewState): state is OioGalleryViewState {
  return state.viewType === ViewType.Gallery;
}

export function isTreeViewState(state: OioAnyViewState): state is OioTreeViewState {
  return state.viewType === ViewType.Tree;
}

export function isListViewState(state: OioAnyViewState): state is OioListViewState {
  return state.viewType === ViewType.Table || state.viewType === ViewType.Gallery;
}

export function isObjectViewState(state: OioAnyViewState): state is OioObjectViewState {
  return state.viewType === ViewType.Form || state.viewType === ViewType.Detail || state.viewType === ViewType.Search;
}

export function hasFieldsViewState(
  state: OioAnyViewState
): state is OioTableViewState | OioFormViewState | OioDetailViewState {
  const { viewType } = state;
  return !!viewType && (viewType === ViewType.Table || viewType === ViewType.Form || viewType === ViewType.Detail);
}

export function hasActionBarViewState(
  state: OioAnyViewState
): state is OioTableViewState | OioFormViewState | OioDetailViewState | OioGalleryViewState | OioTreeViewState {
  const { viewType } = state;
  return !!viewType && viewType !== ViewType.Search;
}

export function hasRowActionBarViewState(state: OioAnyViewState): state is OioTableViewState | OioGalleryViewState {
  const { viewType } = state;
  return !!viewType && (viewType === ViewType.Table || viewType === ViewType.Gallery);
}
