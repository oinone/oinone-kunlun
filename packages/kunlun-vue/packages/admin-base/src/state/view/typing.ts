export interface OioViewState {
  handle: string;
  fullscreen: boolean;
}

export interface OioActionBarState {
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
