import { IView } from '@oinone/kunlun-meta';
import { queryViewDslByModelAndName, queryViewDslByModelAndTemplate } from '@oinone/kunlun-service';
import { RuntimeView } from '../runtime-metadata';
import { MemoryAsyncCache } from './cache';
import { ClearCache } from './CacheClear';
import { toRecord } from './helper';

interface ViewCacheKey {
  model: string;
  name: string;
  template?: string;
}

class ViewInternalCache extends MemoryAsyncCache<ViewCacheKey, RuntimeView> {
  public static INSTANCE = new ViewInternalCache();

  public async fetchValue(key: ViewCacheKey): Promise<RuntimeView | undefined> {
    let view: IView | undefined;
    const { model, name, template } = key;
    if (template) {
      view = await queryViewDslByModelAndTemplate(model, template);
    } else {
      view = await queryViewDslByModelAndName(model, name);
    }
    if (view) {
      if (!view.name) {
        view.name = name;
      }
      return viewConvertRuntime(view);
    }
    return undefined;
  }

  protected keyGenerator(key: ViewCacheKey): string {
    return `${key.model}#${key.name}`;
  }
}

export class ViewCache {
  /**
   * 通过模型编码和名称获取视图
   * @param model 模型编码
   * @param name 名称
   * @param force 强制查询
   * @return 运行时视图
   */
  public static async get(model: string, name: string, force = false): Promise<RuntimeView | undefined> {
    const key: ViewCacheKey = { model, name };
    if (force) {
      return ViewInternalCache.INSTANCE.fetchValue(key);
    }
    return ViewInternalCache.INSTANCE.get(key);
  }

  /**
   * 通过模型编码、自定义名称和模板获取编译后的视图（此视图非完整视图，仅用于自定义渲染使用）
   * @param model 模型编码
   * @param name 名称（用作缓存key）
   * @param template 视图模板
   * @param force 强制查询
   * @return 运行时视图
   */
  public static async compile(
    model: string,
    name: string,
    template: string,
    force = false
  ): Promise<RuntimeView | undefined> {
    const key: ViewCacheKey = { model, name, template };
    if (force) {
      return ViewInternalCache.INSTANCE.fetchValue(key);
    }
    return ViewInternalCache.INSTANCE.get(key);
  }
}

function viewConvertRuntime(view: IView): RuntimeView {
  const { model, name, type, id, title, template, extension, modelDefinition, baseLayoutDefinition } = view;
  const runtimeView: RuntimeView = {
    id,
    model,
    modelName: modelDefinition?.name || '',
    moduleName: modelDefinition?.moduleName || '',
    module: modelDefinition?.module || '',
    name,
    title,
    type,
    dsl: template,
    extension: toRecord(extension)
  };
  if (baseLayoutDefinition) {
    const { name: layoutName, template: layoutTemplate } = baseLayoutDefinition;
    runtimeView.layoutName = layoutName;
    runtimeView.layout = layoutTemplate;
  }
  return runtimeView;
}

ClearCache.register(() => {
  ViewInternalCache.INSTANCE.clear();
});
