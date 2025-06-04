import { MetadataRuntimeFragment, MetadataRuntimeFragmentName, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';
import { http } from '@oinone/kunlun-service';
import gql from 'graphql-tag';
import { RuntimeFunctionDefinition } from '../runtime-metadata';
import { MemoryAsyncCache } from './cache';
import { ClearCache } from './CacheClear';

type FunCacheKey = { namespace: string; fun: string };

enum FunctionModelActionName {
  queryOne = 'queryOne',
  load = 'load'
}

/**
 * 校验 base.Function模型中是否存在 load 方法
 */
export class CheckFuncLoadExists {
  static existing = false;

  private static executed = false;

  static async checkMethod() {
    if (this.executed) {
      return;
    }
    const rst = await fetchFunctionByName('base.Function', 'load');
    this.existing = !!(rst && rst.name);
    this.executed = true;
  }
}

abstract class AbstractFunctionCache<K = string> extends MemoryAsyncCache<K, RuntimeFunctionDefinition> {
  public async setOfNullable(key: K, value: RuntimeFunctionDefinition | undefined) {
    const finalKey = this.cacheKeyFormat(this.keyGenerator(key));
    const cacheValue = await this.getCache(finalKey);
    if (cacheValue == null) {
      value = await this.unsafeSetCache(finalKey, value);
    }
    return value;
  }
}

class FunctionFunCache extends AbstractFunctionCache<FunCacheKey> {
  public static INSTANCE = new FunctionFunCache();

  public fetchValue(key: FunCacheKey): Promise<RuntimeFunctionDefinition | undefined> {
    return fetchFunction(key.namespace, key.fun);
  }

  protected keyGenerator(key: FunCacheKey): string {
    return `${key.namespace}#${key.fun}`;
  }
}

type NameCacheKey = { namespace: string; name: string };

class FunctionNameCache extends AbstractFunctionCache<NameCacheKey> {
  public static INSTANCE = new FunctionNameCache();

  public fetchValue(key: NameCacheKey): Promise<RuntimeFunctionDefinition | undefined> {
    return fetchFunctionByName(key.namespace, key.name);
  }

  protected keyGenerator(key: NameCacheKey): string {
    return `${key.namespace}#${key.name}`;
  }
}

export class FunctionCache {
  /**
   * 通过函数技术名称获取函数
   * @param namespace 命名空间
   * @param fun 技术名称
   */
  public static async get(namespace: string, fun: string): Promise<RuntimeFunctionDefinition | undefined> {
    if (!namespace) {
      console.error('function namespace is required.');
      return undefined;
    }
    if (!fun) {
      console.error('function fun is required.');
      return undefined;
    }

    await CheckFuncLoadExists.checkMethod();
    const target = await FunctionFunCache.INSTANCE.get({
      namespace,
      fun
    });
    if (target && target.name) {
      FunctionNameCache.INSTANCE.setOfNullable(
        {
          namespace: target.namespace,
          name: target.name
        },
        target
      );
    }
    return target;
  }

  /**
   * 通过函数名称获取函数（此方式不安全，请尽可能使用{@link FunctionCache.get}方式）
   * @param namespace 命名空间
   * @param name 名称
   */
  public static async getByName(namespace: string, name: string): Promise<RuntimeFunctionDefinition | undefined> {
    if (!namespace) {
      console.error('function namespace is required.');
      return undefined;
    }
    if (!name) {
      console.error('function name is required.');
      return undefined;
    }
    await CheckFuncLoadExists.checkMethod();

    const target = await FunctionNameCache.INSTANCE.get({
      namespace,
      name
    });
    if (target && target.fun) {
      FunctionFunCache.INSTANCE.setOfNullable(
        {
          namespace: target.namespace,
          fun: target.fun
        },
        target
      );
    }
    return target;
  }
}

async function fetchFunction(namespace: string, fun: string): Promise<RuntimeFunctionDefinition | undefined> {
  const modelActionName = CheckFuncLoadExists.existing
    ? FunctionModelActionName.load
    : FunctionModelActionName.queryOne;
  const body = gql`
    query {
      functionQuery {
        ${modelActionName}(query: { namespace: "${namespace}", fun: "${fun}" }) {
          ${MetadataRuntimeFragmentName.Function}
        }
      }
    }
    ${MetadataRuntimeFragment.Function}
  `;
  try {
    const result = await http.query<RuntimeFunctionDefinition>(SYSTEM_MODULE_NAME.BASE, body);
    const functionDefinition = result.data.functionQuery[modelActionName];
    if (!functionDefinition.name) {
      return undefined;
    }
    return functionDefinition;
  } catch (e) {
    return undefined;
  }
}

async function fetchFunctionByName(namespace: string, name: string): Promise<RuntimeFunctionDefinition | undefined> {
  const modelActionName = CheckFuncLoadExists.existing
    ? FunctionModelActionName.load
    : FunctionModelActionName.queryOne;
  const body = gql`
    query {
      functionQuery {
        ${modelActionName}(query: { namespace: "${namespace}", name: "${name}" }) {
          ${MetadataRuntimeFragmentName.Function}
        }
      }
    }
    ${MetadataRuntimeFragment.Function}
  `;
  try {
    const result = await http.query<RuntimeFunctionDefinition>(SYSTEM_MODULE_NAME.BASE, body);
    const functionDefinition = result.data.functionQuery[modelActionName];
    if (!functionDefinition.fun) {
      return undefined;
    }
    return functionDefinition;
  } catch (e) {
    return undefined;
  }
}

ClearCache.register(() => {
  FunctionFunCache.INSTANCE.clear();
  FunctionNameCache.INSTANCE.clear();
});
