import { MultiTabsRuntimeManifestMergedConfigManager, MultiTabsRouter } from '../view';
import { DefaultSingleStackRouter } from './DefaultSingleStackRouter';
import { BackRouter, ForwardRouter } from './typing';

export function getBackRouter(): { router: BackRouter; force: boolean } {
  if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled()) {
    return { router: MultiTabsRouter.useRouter(), force: true };
  }
  return { router: DefaultSingleStackRouter.INSTANCE, force: false };
}

export function getForwardRouter(): { router: ForwardRouter; force: boolean } {
  if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled()) {
    return { router: MultiTabsRouter.useRouter(), force: true };
  }
  return { router: DefaultSingleStackRouter.INSTANCE, force: false };
}
