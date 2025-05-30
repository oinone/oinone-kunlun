import { IModel, ViewType } from '@kunlun/meta';
import { getModel, ISort, queryModuleByName } from '@kunlun/service';
import { StateStream } from '@kunlun/state';
import { ClearCache } from '../cache';

interface CurrentContext {
  module: string;
  model: IModel;
}

export type Page = {
  viewType: ViewType;
  model: string;
  currentPage?: string;
  size?: string;
  id?: string;
  ids?: string;
  module: string;
  sorterField?: string;
  direction?: string;
  language: string;
  sort?: ISort;
  current?: string;
  pageSize?: string;
  sortField?: string;
  actionId?: string;
  action?: string;

  /**
   * structureViewCondition 属性是JSON string格式
   *
   * {
   *  queryType: QueryType;
   *  value: Record<string, any>;
   *  loadApi: string;
   * }
   */
  structureViewCondition?: string;
};

const currentState$ = new StateStream<CurrentContext>({});
const moduleMap = new Map();
const modelMap = new Map();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initCurrentContext = async (moduleName: string, modelModel: string) => {
  await Promise.all([loadCurrentModule(moduleName)]);
};

const loadCurrentModel = async (modelModel: string) => {
  // TODO: cache
  const model = await getModel(modelModel);

  currentState$.setValue('model', modelModel);
  modelMap.set(modelModel, model);
};

const loadCurrentModule = async (moduleName: string, force?: boolean) => {
  let module = moduleMap.get(moduleName);
  if (force || !module) {
    currentState$.setValue('module', undefined);
    module = await queryModuleByName(moduleName);
    moduleMap.set(moduleName, module);
  }

  currentState$.setValue('module', moduleName);

  return module;
};

ClearCache.register(() => {
  moduleMap.clear();
  modelMap.clear();
});

export const useCurrentContextService = () => ({
  getCurrentContext: () => currentState$,
  initCurrentContext,
  loadCurrentModel,
  loadCurrentModule,
  modelMap,
  moduleMap
});
