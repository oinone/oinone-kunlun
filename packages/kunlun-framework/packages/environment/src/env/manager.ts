import { Manager, ObjectUtils } from '@oinone/kunlun-shared';
import { CONTENT_NULL_SELECTOR } from './constant';
import { getContentHTMLElement } from './method';
import { RuntimeEnvironment, VisibleArea } from './typing';
import { createVisibleArea } from './utils';

const runtimeEnvironmentMethods: Record<string, Function> = {
  getContentHTMLElement
};

class InternalRuntimeEnvironmentManager extends Manager<RuntimeEnvironment> {
  public constructor() {
    super();
  }

  protected generator(handle): RuntimeEnvironment {
    const newEnv = {
      contentSelector: CONTENT_NULL_SELECTOR,
      mcx: 0,
      mcy: 0,
      st: 0,
      sl: 0,
      visibleArea: new Map<string, VisibleArea>(),
      clickVisibleArea: [] as VisibleArea[]
    } as RuntimeEnvironment;
    const readonlyKeys: string[] = ['contentVisibleArea', 'visibleArea'];
    for (const [method, fn] of Object.entries(runtimeEnvironmentMethods)) {
      readonlyKeys.push(method);
      newEnv[method] = fn.bind(newEnv);
    }
    newEnv.contentVisibleArea = createVisibleArea(handle, () => newEnv.getContentHTMLElement());
    return ObjectUtils.readonly(newEnv, readonlyKeys);
  }
}

export class RuntimeEnvironmentManager {
  private static manager = new InternalRuntimeEnvironmentManager();

  private static ROOT_HANDLE = '__ROOT_HANDLE__';

  private static currentHandle: string = RuntimeEnvironmentManager.ROOT_HANDLE;

  static {
    RuntimeEnvironmentManager.manager.createOrReplace(RuntimeEnvironmentManager.ROOT_HANDLE);
  }

  public static getGlobalEnvironment(): RuntimeEnvironment {
    return RuntimeEnvironmentManager.manager.get(RuntimeEnvironmentManager.ROOT_HANDLE)!;
  }

  public static getCurrentEnvironment(): RuntimeEnvironment {
    const handle = RuntimeEnvironmentManager.currentHandle;
    const environment = RuntimeEnvironmentManager.manager.get(handle);
    if (!environment) {
      throw new Error(`Invalid current environment. handle: ${handle}`);
    }
    return environment;
  }

  public static get(handle: string) {
    return RuntimeEnvironmentManager.manager.get(handle);
  }

  public static createOrReplace(handle: string, parent?: RuntimeEnvironment) {
    return RuntimeEnvironmentManager.manager.createOrReplace(handle, parent);
  }

  public static delete(handle: string, deep = true) {
    RuntimeEnvironmentManager.manager.delete(handle, deep);
  }

  public static select(handle: string) {
    const environment = RuntimeEnvironmentManager.manager.get(handle);
    if (!environment) {
      throw new Error(`Invalid environment. ${handle}`);
    }
    this.currentHandle = handle;
  }
}

export function useGlobalEnv() {
  return RuntimeEnvironmentManager.getGlobalEnvironment();
}

export function useEnv() {
  return RuntimeEnvironmentManager.getCurrentEnvironment();
}
