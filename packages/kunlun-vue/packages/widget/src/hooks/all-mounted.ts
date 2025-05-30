import { isFunction, isNil } from 'lodash-es';

import { inject, InjectionKey, onBeforeMount, onMounted, onUnmounted, provide } from 'vue';

interface AllMountedContext {
  reportBeforeMount: (key: string) => void;
  reportMounted: (key: string) => void;
  reportUnmounted: (key: string) => void;
  reportAllBeforeMount: (key: string) => void;
  reportAllMounted: (key: string) => void;
  reportAllUnmounted: (key: string) => void;
}

const defaultAllMountedContext = {
  reportBeforeMount: () => {},
  reportMounted: () => {},
  reportUnmounted: () => {},
  reportAllBeforeMount: () => {},
  reportAllMounted: () => {},
  reportAllUnmounted: () => {}
} as AllMountedContext;

interface AllMountedContextOptions {
  reportBeforeMount?: (key: string) => void;
  reportMounted?: (key: string) => void;
  reportUnmounted?: (key: string) => void;
  reportAllBeforeMount?: (key: string) => void;
  reportAllMounted?: (key: string) => void;
  reportAllUnmounted?: (key: string) => void;
}

const AllMountedContextKey: InjectionKey<AllMountedContext> = Symbol('AllMountedContext');

const useProviderAllMountedContext = (state: AllMountedContextOptions): void => {
  provide(AllMountedContextKey, {
    ...defaultAllMountedContext,
    ...state
  });
};

const useInjectAllMountedContext = (): AllMountedContext => {
  return inject(AllMountedContextKey, defaultAllMountedContext);
};

type onAllMountedFn = () => void;

type onAllMountedOptions = { allMounted?: () => void; allMountedUpdate?: () => void };

function computeAndExecute(records: Record<string, boolean>, fn: () => void): boolean {
  if (Object.values(records).every((value) => value)) {
    fn();
    return true;
  }
  return false;
}

let allMountedCount = 0;

/**
 * 在子组件全部挂载时执行（需配合{@link reportAllMounted}使用）
 * @param fn 全部挂载时执行函数; allMounted仅会调用一次，allMountedUpdate会重复调用;
 */
export function onAllMounted(fn: onAllMountedFn | onAllMountedOptions): void {
  if (!fn) {
    console.warn('all mounted method or object is required.');
    return;
  }

  let finalFn: (() => void) | undefined;
  let finalObject: { allMounted?: () => void; allMountedUpdate?: () => void } | undefined;
  if (isFunction(fn)) {
    finalFn = fn;
  } else {
    finalObject = fn;
  }

  const {
    reportAllBeforeMount: parentReportAllBeforeMount,
    reportAllMounted: parentReportAllMounted,
    reportAllUnmounted: parentReportAllUnmounted
  } = useInjectAllMountedContext();

  const allMountedKey = `all-mounted#${allMountedCount++}`;

  const mountedSet: Record<string, boolean> = {};
  const allMountedSet: Record<string, boolean> = {};

  useProviderAllMountedContext({
    reportBeforeMount: (key: string) => {
      const value = mountedSet[key];
      if (isNil(value)) {
        mountedSet[key] = false;
      }
      parentReportAllBeforeMount?.(allMountedKey);
    },
    reportMounted: (key: string) => {
      const value = mountedSet[key];
      if (isNil(value) || value) {
        return;
      }
      mountedSet[key] = true;
      if (computeAndExecute(mountedSet, finalObject?.allMounted || finalFn || (() => ({})))) {
        parentReportAllMounted?.(allMountedKey);
      }
    },
    reportUnmounted: (key: string) => {
      delete mountedSet[key];
      parentReportAllUnmounted?.(allMountedKey);
    },
    reportAllBeforeMount: (key: string) => {
      const value = allMountedSet[key];
      if (isNil(value)) {
        allMountedSet[key] = false;
      }
    },
    reportAllMounted: (key: string) => {
      const value = allMountedSet[key];
      if (isNil(value) || value) {
        return;
      }
      allMountedSet[key] = true;
      computeAndExecute(allMountedSet, finalObject?.allMountedUpdate || (() => ({})));
    },
    reportAllUnmounted: (key: string) => {
      delete allMountedSet[key];
    }
  });
}

let mountedCount = 0;

/**
 * 子组件上报挂载状态，用于执行{@link onAllMounted}传入的全部挂载时执行函数，该方法会防止提供者方法向下透传，如需进行连续处理，应先使用reportAllMounted，再使用onAllMounted方法
 * @param options
 */
export function reportAllMounted(options?: {
  onBeforeMount?: () => void | Promise<void>;
  onMounted?: () => void | Promise<void>;
  onUnmounted?: () => void | Promise<void>;
}): void {
  const { reportBeforeMount, reportMounted, reportUnmounted } = useInjectAllMountedContext();

  const key = `mounted-#${mountedCount++}`;

  onBeforeMount(() => {
    const res = options?.onBeforeMount?.();
    if (res instanceof Promise) {
      res.then(() => {
        reportBeforeMount?.(key);
      });
    } else {
      reportBeforeMount?.(key);
    }
  });

  onMounted(() => {
    const res = options?.onMounted?.();
    if (res instanceof Promise) {
      res.then(() => {
        reportMounted?.(key);
      });
    } else {
      reportMounted?.(key);
    }
  });

  onUnmounted(() => {
    const res = options?.onUnmounted?.();
    if (res instanceof Promise) {
      res.then(() => {
        reportUnmounted?.(key);
      });
    } else {
      reportUnmounted?.(key);
    }
  });

  useProviderAllMountedContext({});
}
