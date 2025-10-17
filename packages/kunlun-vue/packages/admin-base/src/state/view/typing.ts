import { ViewType } from '@oinone/kunlun-meta';

export interface OioViewState extends Record<string, unknown> {
  readonly handle: string;
  fullscreen: boolean;
  viewType?: ViewType;
}

export interface OioActionBarState extends Record<string, unknown> {
  handle: string;
  actions: string[];
}

export interface OioTableViewState extends OioViewState {
  searchView?: string;
  actionBar?: OioActionBarState;
  table?: string;
  fields?: string[];
}

export interface OioSearchViewState extends OioViewState {
  fields?: string[];
}

export interface OioFormViewState extends OioViewState {
  draftCode?: string;
  actionBar?: OioActionBarState;
  form?: string;
  fields?: string[];
}

export type OioDetailViewState = OioFormViewState;

export interface OioGalleryState extends OioViewState {
  searchView?: string;
  actionBar?: OioActionBarState;
  gallery?: string;
  fields?: string[];
}
