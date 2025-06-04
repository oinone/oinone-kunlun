import { IModule } from '@oinone/kunlun-meta';
import { queryModuleByName } from '@oinone/kunlun-service';
import { MemoryAsyncCache } from './cache';
import { ClearCache } from './CacheClear';

class ModuleInternalCache extends MemoryAsyncCache<string, IModule> {
  public static INSTANCE = new ModuleInternalCache();

  public async fetchValue(key: string): Promise<IModule | undefined> {
    const module = await queryModuleByName(key);
    if (!module?.module) {
      return undefined;
    }
    return module;
  }
}

export class ModuleCache {
  public static get(moduleName: string, force = false) {
    const key = moduleName;
    if (force) {
      return ModuleInternalCache.INSTANCE.fetchValue(key);
    }
    return ModuleInternalCache.INSTANCE.get(key);
  }
}

ClearCache.register(() => {
  ModuleInternalCache.INSTANCE.clear();
});
