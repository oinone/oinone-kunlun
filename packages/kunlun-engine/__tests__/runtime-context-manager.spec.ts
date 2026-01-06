import { ROOT_HANDLE, RuntimeContextManager } from '../src/runtime-context';

describe('RuntimeContextManager', () => {
  beforeEach(() => {
    RuntimeContextManager.delete(ROOT_HANDLE);
    RuntimeContextManager.clearRuntimeContext();
  });

  it('createOrReplace creates root runtime context', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    expect(root.handle).toBe(ROOT_HANDLE);
    expect(root.parentContext).toBeUndefined();
    expect(root.childrenContext).toEqual([]);
    expect(root.routers).toEqual([]);
    expect(root.extendData).toEqual({});
    expect(typeof root.getModel).toBe('function');
    expect(typeof root.getModelField).toBe('function');
    expect(typeof root.createFieldRuntimeContext).toBe('function');
  });

  it('createOrReplace with parent sets parent and children', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    const child = RuntimeContextManager.createOrReplace('child', root);
    expect(child.parentContext).toBe(root);
    expect(root.childrenContext).toHaveLength(1);
    expect(root.childrenContext[0]).toBe(child);
  });

  it('getOrCreate returns existing context', () => {
    const ctx1 = RuntimeContextManager.createOrReplace('ctx');
    const ctx2 = RuntimeContextManager.getOrCreate('ctx');
    expect(ctx2).toBe(ctx1);
  });

  it('getOrCreate creates new context when missing', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    const child = RuntimeContextManager.getOrCreate('ctx', root);
    expect(child.handle).toBe('ctx');
    expect(child.parentContext).toBe(root);
  });

  it('getOthers returns other runtime contexts with belong filter', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    const ctx1 = RuntimeContextManager.createOrReplace('ctx1', root);
    const ctx2 = RuntimeContextManager.createOrReplace('ctx2', root);
    const ctx3 = RuntimeContextManager.createOrReplace('ctx3', ctx1);
    const othersFromRoot = RuntimeContextManager.getOthers();
    const handlesFromRoot = othersFromRoot.map((item) => item.handle).sort();
    expect(handlesFromRoot).toEqual(['ctx1', 'ctx2', 'ctx3']);
    const othersBelong = RuntimeContextManager.getOthers('ctx1', true);
    expect(othersBelong).toHaveLength(1);
    expect(othersBelong[0]).toBe(ctx3);
    const othersNotBelong = RuntimeContextManager.getOthers('ctx1', false);
    const handlesNotBelong = othersNotBelong.map((item) => item.handle).sort();
    expect(handlesNotBelong).toEqual(['ctx2', 'ctx3']);
  });

  it('generatorFieldRuntimeContextHandle builds handle with field info', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    const field = {
      model: 'User',
      name: 'age',
      __index: 0
    } as any;
    const handle = RuntimeContextManager.generatorFieldRuntimeContextHandle(root, field);
    expect(handle).toBe(`${root.handle}#User#age#0`);
  });

  it('createFieldRuntimeContext creates child context with field and framework', () => {
    const root = RuntimeContextManager.createOrReplace(ROOT_HANDLE);
    const framework = { name: 'app' };
    root.frameworkInstance = framework as any;
    const field = {
      model: 'User',
      name: 'age',
      __index: 0
    } as any;
    const fieldContext = root.createFieldRuntimeContext(field);
    expect(fieldContext.field).toBe(field);
    expect(fieldContext.frameworkInstance).toBe(framework);
    expect(root.childrenContext).toContain(fieldContext);
  });

  it('onCreate onReplace and onDelete hooks receive events', () => {
    const created: any[] = [];
    const replaced: any[] = [];
    const deleted: any[] = [];
    RuntimeContextManager.onCreate((event) => {
      created.push(event);
    });
    RuntimeContextManager.onReplace((event) => {
      replaced.push(event);
    });
    RuntimeContextManager.onDelete((event) => {
      deleted.push(event);
    });
    const handle = 'ctx-hook';
    const first = RuntimeContextManager.createOrReplace(handle);
    const second = RuntimeContextManager.createOrReplace(handle);
    RuntimeContextManager.delete(handle);
    expect(first.handle).toBe(second.handle);
    expect(created.length).toBeGreaterThanOrEqual(1);
    expect(replaced.length).toBeGreaterThanOrEqual(1);
    expect(deleted.length).toBeGreaterThanOrEqual(1);
    expect(created[0].target).toBe(first);
    expect(replaced[0].target).toBe(second);
    expect(deleted[0].target.handle).toBe(handle);
  });
});
