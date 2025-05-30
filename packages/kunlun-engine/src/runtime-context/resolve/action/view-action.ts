import { ActionDslDefinition } from '@kunlun/dsl';
import { RuntimeViewAction } from '../../../runtime-metadata';
import { RuntimeContext } from '../../runtime-context';
import { convertFunction, DslFunction } from './resolve-function';

export function convertViewAction(runtimeContext: RuntimeContext, dsl: ActionDslDefinition, action: RuntimeViewAction) {
  action.title = dsl.title;
  action.target = dsl.target?.toUpperCase?.();
  action.domain = dsl.domain;
  action.filter = dsl.filter;
  action.module = dsl.module;
  action.moduleName = dsl.moduleName;
  action.resModel = dsl.resModel;
  action.resModelName = dsl.resModelName;
  action.resModule = dsl.resModule;
  action.resModuleName = dsl.resModuleName;
  action.resViewLayout = dsl.resViewLayout;
  action.resViewName = dsl.resViewName;
  action.resViewType = dsl.viewType;
  action.resView = dsl.resView;
  action.theme = dsl.theme;
  action.load = dsl.load;
  const dslFunction = dsl.loadFunction as DslFunction;
  if (dslFunction) {
    action.loadFunctionDefinition = convertFunction(action.model, dslFunction);
  }
}
