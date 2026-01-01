import { BehaviorSubject, distinctUntilChanged, Subscription } from '@oinone/kunlun-state';

import type { Matched } from './matchPath';

let matched: Matched;
let globePrevMatched: Matched | null = null;

const matched$ = new BehaviorSubject<Matched>(null as any);

export const _useMatched = () => {
  let prevMatched: Matched | null = null;

  const setMatched = (_matched: Matched) => {
    if (prevMatched === _matched) {
      return;
    }
    prevMatched = _matched;
    if (
      JSON.stringify(globePrevMatched) !== JSON.stringify(matched) &&
      JSON.stringify(_matched) !== JSON.stringify(matched)
    ) {
      globePrevMatched = matched;
    }
    matched = _matched;

    matched$.next(_matched);
  };

  const getMatched$ = (): BehaviorSubject<Matched> => {
    return matched$;
  };

  return {
    globePrevMatched,
    matched,
    getMatched$,
    setMatched
  };
};

export const useMatched = () => {
  const { matched: matched1, globePrevMatched, getMatched$ } = _useMatched();

  return {
    prevMatched: globePrevMatched,
    matched: matched1,
    getMatched$
  };
};

/**
 * 获取当前url
 */
export const getMatchedUrl = () => {
  const { page = {} } = useMatched().matched.segmentParams;
  return page;
};

const Mode = 'mode';

enum ModeEnum {
  Dev = 'dev',
  Product = 'product'
}

/**
 * 判断当前是不是开发环境
 */
export const isDev = () => {
  const devMode = (window as any)[Mode];
  if (devMode !== undefined && devMode !== null) {
    return devMode === ModeEnum.Dev;
  }
  const page = getMatchedUrl() as Record<string, any>;
  if (!page) {
    return false;
  }
  if (Object.keys(page).includes(Mode) && !page.mode) {
    localStorage.removeItem(Mode);
  } else if (page.mode) {
    localStorage.setItem(Mode, page.mode);
  }
  return localStorage.getItem(Mode) === ModeEnum.Dev;
};

export const setGlobalEnv = () => {
  isDev();
  (window as any)[Mode] = localStorage.getItem(Mode);
};

/**
 * 监听路由
 * @param  callback 回调函数
 * @param  options 监听路由可选项；distinct 是否去重
 *
 * @return 订阅对象，可操作取消订阅。
 */
export const subscribeRoute = (
  callback: (matched: Matched) => void,
  options?: {
    distinct: boolean;
  }
): Subscription => {
  if (options?.distinct) {
    return useMatched()
      .getMatched$()
      .pipe(distinctUntilChanged((x, y) => JSON.stringify(x.segmentParams) === JSON.stringify(y.segmentParams)))
      .subscribe(callback);
  }
  return useMatched().getMatched$().subscribe(callback);
};
