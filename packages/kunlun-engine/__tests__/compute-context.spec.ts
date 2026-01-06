import '../src';
import { ComputeContextManager, ExpressionExecutor } from '../src/compute-context';
import { ROOT_HANDLE, RuntimeContextManager } from '../src/runtime-context';
import { parameters } from '../src/compute-context/__tests__/data';

const optimizeExpression =
  '1 + activeRecord.field0003 * 3 - 2 - activeRecord.field0006 - 5 - activeRecord.field0006 + 7';

describe('ExpressionExecutor', () => {
  it('run evaluates simple arithmetic expression', () => {
    const result = ExpressionExecutor.run(parameters, '1 + 2 * 3');
    expect(result).toBe(7);
  });

  it('optimizeAndRun evaluates complex expression using parameters', () => {
    const result = ExpressionExecutor.optimizeAndRun(parameters, optimizeExpression);
    expect(result).toBeNull();
  });

  it('parser and toString round trip for arithmetic expression', () => {
    const expr = '1 + 2 * 3 - 4 / 2';
    const node = ExpressionExecutor.parser(expr);
    expect(node).toBeDefined();
    if (!node) {
      return;
    }
    const text = ExpressionExecutor.toString(node);
    const original = ExpressionExecutor.run(parameters, expr);
    const roundTrip = ExpressionExecutor.run(parameters, text);
    expect(roundTrip).toBe(original);
  });
});

describe('ComputeContextManager', () => {
  it('createOrReplace creates compute context linked to runtime context', () => {
    RuntimeContextManager.delete(ROOT_HANDLE);
    RuntimeContextManager.clearRuntimeContext();
    const runtime = RuntimeContextManager.createOrReplace('runtime-handle');
    const computeContext = ComputeContextManager.createOrReplace('runtime-handle');
    expect(computeContext.runtimeContext).toBe(runtime);
    expect(typeof computeContext.resolveCompute).toBe('function');
    expect(typeof computeContext.compute).toBe('function');
  });

  it('get returns existing compute context', () => {
    const handle = 'compute-handle';
    const context = ComputeContextManager.createOrReplace(handle);
    const same = ComputeContextManager.get(handle);
    expect(same).toBe(context);
  });

  it('delete removes compute context', () => {
    const handle = 'compute-delete';
    ComputeContextManager.createOrReplace(handle);
    ComputeContextManager.delete(handle);
    expect(ComputeContextManager.get(handle)).toBeUndefined();
  });

  it('deleting runtime context deletes its compute context via onDelete hook', () => {
    const handle = 'runtime-compute-link';
    const runtime = RuntimeContextManager.createOrReplace(handle);
    const computeContext = ComputeContextManager.createOrReplace(handle);
    expect(computeContext.runtimeContext).toBe(runtime);
    RuntimeContextManager.delete(handle);
    expect(ComputeContextManager.get(handle)).toBeUndefined();
  });

  it('deleting ROOT_HANDLE deletes ROOT and children compute contexts', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    const otherHandle = 'other-runtime';
    RuntimeContextManager.createOrReplace(otherHandle, root);
    ComputeContextManager.createOrReplace(ROOT_HANDLE);
    ComputeContextManager.createOrReplace(otherHandle);
    RuntimeContextManager.delete(ROOT_HANDLE);
    expect(ComputeContextManager.get(ROOT_HANDLE)).toBeUndefined();
    expect(ComputeContextManager.get(otherHandle)).toBeUndefined();
  });

  it('deleting field runtime context does not delete other field compute contexts', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    const field1 = {
      model: 'User',
      name: 'age',
      __index: 0
    } as any;
    const field2 = {
      model: 'User',
      name: 'name',
      __index: 0
    } as any;
    const fieldContext1 = root.createFieldRuntimeContext(field1);
    const fieldContext2 = root.createFieldRuntimeContext(field2);
    const fieldHandle1 = fieldContext1.handle;
    const fieldHandle2 = fieldContext2.handle;
    const compute1 = ComputeContextManager.createOrReplace(fieldHandle1);
    const compute2 = ComputeContextManager.createOrReplace(fieldHandle2);
    expect(ComputeContextManager.get(fieldHandle1)).toBe(compute1);
    expect(ComputeContextManager.get(fieldHandle2)).toBe(compute2);
    RuntimeContextManager.delete(fieldHandle1);
    expect(ComputeContextManager.get(fieldHandle1)).toBeUndefined();
    expect(ComputeContextManager.get(fieldHandle2)).toBe(compute2);
  });
});
