import { ViewType } from '@oinone/kunlun-meta';

export interface OioViewState extends Record<string, unknown> {
  readonly handle: string;
  fullscreen: boolean;
  viewType?: ViewType;

  actionBarState?: OioActionBarState;

  defineActionBarStateProperty(rowIndex?: number): void;

  pushField(handle: string): void;

  popField(handle: string): void;

  pushAction(handle: string): void;

  popAction(handle: string): void;
}

export interface OioActionBarState extends Record<string, unknown> {
  handle: string;
  actions: string[];
}

export interface OioTableViewState extends OioViewState {
  viewType: ViewType.Table;
  searchView?: string;
  actionBar?: OioActionBarState;
  rowActions?: OioActionBarState[];
  table?: string;
  fields?: string[];
}

export interface OioSearchViewState extends OioViewState {
  viewType: ViewType.Search;
  search?: string;
  fields?: string[];
}

export interface OioFormViewState extends OioViewState {
  viewType: ViewType.Form;
  draftCode?: string;
  actionBar?: OioActionBarState;
  form?: string;
  fields?: string[];
}

export interface OioDetailViewState extends OioViewState {
  viewType: ViewType.Detail;
  actionBar?: OioActionBarState;
  detail?: string;
  fields?: string[];
}

export interface OioGalleryViewState extends OioViewState {
  viewType: ViewType.Gallery;
  searchView?: string;
  actionBar?: OioActionBarState;
  rowActions?: OioActionBarState[];
  gallery?: string;
  fields?: string[];
}

export interface OioTreeViewState extends OioViewState {
  viewType: ViewType.Tree;
  searchView?: string;
  actionBar?: OioActionBarState;
  tree?: string;
  fields?: string[];
}

export type OioAnyViewState =
  | OioTableViewState
  | OioSearchViewState
  | OioFormViewState
  | OioDetailViewState
  | OioGalleryViewState
  | OioTreeViewState
  | OioViewState;

export type OioListViewState = OioTableViewState | OioGalleryViewState;

export type OioObjectViewState = OioFormViewState | OioDetailViewState;

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
  return state.viewType === ViewType.Form || state.viewType === ViewType.Detail;
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
