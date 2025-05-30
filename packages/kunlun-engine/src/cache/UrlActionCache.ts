import { queryUrlActionByModelAndName } from '@kunlun/service';
import { RuntimeUrlAction } from '../runtime-metadata';
import { MemoryAsyncCache } from './cache';
import { ClearCache } from './CacheClear';

interface UrlActionKey {
  model: string;
  name: string;
}

class UrlActionInternalCache extends MemoryAsyncCache<UrlActionKey, RuntimeUrlAction> {
  public static INSTANCE = new UrlActionInternalCache();

  public async fetchValue(key: UrlActionKey): Promise<RuntimeUrlAction | undefined> {
    const { model, name } = key;
    const action = await queryUrlActionByModelAndName(model, name);
    return (action as RuntimeUrlAction) || undefined;
  }
}

export class UrlActionCache {
  /**
   * 通过模型编码和名称获取action
   * @param model 模型编码
   * @param name 名称
   * @param force 强制查询
   * @return 运行时action
   */
  public static async get(model: string, name: string, force = false): Promise<RuntimeUrlAction | undefined> {
    const key: UrlActionKey = { model, name };
    if (force) {
      return UrlActionInternalCache.INSTANCE.fetchValue(key);
    }
    return UrlActionInternalCache.INSTANCE.get(key);
  }
}

ClearCache.register(() => {
  UrlActionInternalCache.INSTANCE.clear();
});
