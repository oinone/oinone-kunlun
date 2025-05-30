import { RuntimeViewAction, ViewActionQueryParameter } from '@kunlun/engine';

export type MetadataMainViewBeforeRender = (
  action: RuntimeViewAction,
  oldPage: ViewActionQueryParameter | undefined,
  newPage: ViewActionQueryParameter
) => Promise<void>;

export enum MetadataMainViewLifecycleEventKeys {
  beforeRender = 'beforeRender'

  // maskRenderBefore = 'maskRenderBefore',
  // maskRenderAfter = 'maskRenderAfter',

  // mainViewRenderBefore = 'mainViewRenderBefore',
  // mainViewRenderAfter = 'mainViewRenderAfter'
}
