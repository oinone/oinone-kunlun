import { ComputeContext, ComputeContextManager } from '../../compute-context';
import { RuntimeContext } from '../runtime-context';

export function resolveCompute(runtimeContext: RuntimeContext) {
  const computeContext = createOrReplaceComputeContext(runtimeContext);
  computeContext.resolveCompute();
}

function createOrReplaceComputeContext(runtimeContext: RuntimeContext) {
  const parentHandle = runtimeContext.parentContext?.handle;
  let parentContext: ComputeContext | undefined;
  if (parentHandle) {
    parentContext = ComputeContextManager.get(parentHandle);
  }
  return ComputeContextManager.createOrReplace(runtimeContext.handle, parentContext);
}
