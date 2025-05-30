import { RuntimeModule } from '../../runtime-metadata';
import { RuntimeContext } from '../runtime-context';

export function resolveModule(runtimeContext: RuntimeContext) {
  const { module, moduleName } = runtimeContext.view;
  let runtimeModule: RuntimeModule | undefined;
  if (moduleName) {
    runtimeModule = {
      name: moduleName
    };
  }
  if (runtimeModule && module) {
    runtimeModule.module = module;
  }
  if (runtimeModule) {
    runtimeContext.module = runtimeModule;
  }
}
