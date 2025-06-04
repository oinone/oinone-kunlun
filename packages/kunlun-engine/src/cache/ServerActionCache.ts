import { queryServerActionByModelAndName } from '@oinone/kunlun-service';
import { RuntimeServerAction } from '../runtime-metadata';
import { MemoryAsyncCache } from './cache';
import { ClearCache } from './CacheClear';

interface ServerActionKey {
  model: string;
  name: string;
}

class ServerActionInternalCache extends MemoryAsyncCache<ServerActionKey, RuntimeServerAction> {
  public static INSTANCE = new ServerActionInternalCache();

  public async fetchValue(key: ServerActionKey): Promise<RuntimeServerAction | undefined> {
    const { model, name } = key;
    const action = await queryServerActionByModelAndName(model, name);
    return (action as RuntimeServerAction) || undefined;
  }
}

export class ServerActionCache {
  /**
   * 通过模型编码和名称获取action
   * @param model 模型编码
   * @param name 名称
   * @param force 强制查询
   * @return 运行时action
   */
  public static async get(model: string, name: string, force = false): Promise<RuntimeServerAction | undefined> {
    const key: ServerActionKey = { model, name };
    if (force) {
      return ServerActionInternalCache.INSTANCE.fetchValue(key);
    }
    return ServerActionInternalCache.INSTANCE.get(key);
  }
}

ClearCache.register(() => {
  ServerActionInternalCache.INSTANCE.clear();
});
