import { RuntimeViewAction, ViewActionQueryParameter } from '@oinone/kunlun-engine';
import { NonBlockingEventManager } from '@oinone/kunlun-shared';
import { MetadataMainViewBeforeRender, MetadataMainViewLifecycleEventKeys } from './typing';

class MetadataMainViewLifecycleManager extends NonBlockingEventManager<typeof MetadataMainViewLifecycleEventKeys> {
  public onBeforeRender(fn: MetadataMainViewBeforeRender) {
    this.on('beforeRender', fn);
  }

  // public onMaskRenderBefore(fn: MetadataMainViewHook) {
  //   this.on('maskRenderBefore', fn);
  // }
  //
  // public onMaskRenderAfter(fn: MetadataMainViewHook) {
  //   this.on('maskRenderAfter', fn);
  // }

  // public onMainViewRenderBefore(fn: MetadataMainViewHook) {
  //   this.on('mainViewRenderBefore', fn);
  // }
  //
  // public onMainViewRenderAfter(fn: MetadataMainViewHook) {
  //   this.on('mainViewRenderAfter', fn);
  // }

  public notifyBeforeRender(
    action: RuntimeViewAction,
    oldPage: ViewActionQueryParameter | undefined,
    newPage: ViewActionQueryParameter
  ) {
    return this.notifyHandler('beforeRender', action, oldPage, newPage);
  }
}

export const MetadataMainViewLifecycle = new MetadataMainViewLifecycleManager();
