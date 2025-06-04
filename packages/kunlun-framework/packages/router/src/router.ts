/* eslint-disable no-restricted-globals */
import { UrlHelper, __DEV__, debugConsole } from '@oinone/kunlun-shared';
import { BehaviorSubject, take } from '@oinone/kunlun-state';
import page from 'page';
import { DefaultUrlSerializer, UrlSegment, UrlSegmentGroup, UrlTree } from './url_tree';
import { _useMatched } from './useMatched';

interface NavigateOptions {
  replaceUrl?: boolean;
}

interface SegmentGroup {
  segments: UrlSeg[];
  children?: { [key: string]: SegmentGroup; primary: SegmentGroup };
}

interface UrlSeg {
  path: string;
  parameters?: { [key: string]: string | null | undefined };
  // TODO: 新传入的 parameters 与老的进行 merge，保留未传入的 parameters 值
  extra?: {
    // 是否保留上个路由的 parameters 参数，用新的参数做部分覆盖
    preserveParameter?: boolean;
  };
}

type ActivatedRoute = UrlTree & {
  raw: PageJS.Context;
};

const serializer = new DefaultUrlSerializer();

const createRouter = () => {
  const router = (page as any).create({ window, click: false }) as PageJS.Static;
  const activatedRoute = new BehaviorSubject<ActivatedRoute>(null as any);

  let ignited = false;
  const ignite = () => {
    if (ignited) {
      return;
    }
    ignited = true;

    /**
     * 当前 route 状态
     */
    router((ctx) => {
      // TODO: 需要再实现 middlewares, 注意不要使用 router() 当作项目内的 middleware，项目后面加入的 middleware 可能在路由表添加以后
      const segment = serializer.parse(ctx.path);

      activatedRoute.next({ ...segment, raw: ctx } as ActivatedRoute);
    });

    router();
  };

  const defaultNavigateOptions: NavigateOptions = {
    replaceUrl: false
  };
  // TODO: 支持参数快捷添加
  const navigate = (segments: string, options: NavigateOptions = defaultNavigateOptions) => {
    if (typeof segments === 'string') {
      navigateByPath(segments, options);
    }
  };

  const pathArr: string[] = [];
  const navigateByPath = (path: string, options: NavigateOptions) => {
    const { replaceUrl } = options;

    activatedRoute.pipe(take(1)).subscribe((route) => {
      if (path === route.raw.canonicalPath) {
        throw new Error(
          `NavigationDuplicated: Avoided redundant navigation to current location: ${route.raw.canonicalPath}`
        );
      }
      if (replaceUrl) {
        router.replace(path);
        // history.pushState(null, '', path);
      } else {
        // history.pushState(null, '', path);
        const lastedPath = history.state?.path;
        if (lastedPath) {
          pathArr.push(lastedPath);
        }
        router(path);
      }
    });
  };

  // const concatHref = (options: SegmentGroup, head = true) => {
  //   let href = '';
  //   let queryStr = '';
  //   if (options.query) {
  //     for (const k in options.query) {
  //       queryStr += `${k}=${options.query[k]};`;
  //     }
  //   }
  //   const tempHref = `${options.path};${queryStr}`;
  //   if (head) {
  //     href += tempHref;
  //   } else {
  //     href += `(${tempHref})`;
  //   }
  //   if (options.children) {
  //     for (let i = 0; i < options.children.length; i++) {
  //       href += concatHref(options.children[i], false);
  //     }
  //   }
  //   return href;
  // };

  const createSegmentGroup = (options: SegmentGroup): UrlSegmentGroup => {
    const segments = options.segments.map((item) => {
      const parameters: Record<string, any> = {};
      const itemParameters = item.parameters || {};
      for (const key in itemParameters) {
        if (itemParameters[key] != null) {
          parameters[key] = itemParameters[key];
        }
      }
      return new UrlSegment(UrlHelper.relativePath(UrlHelper.appendBasePath(item.path)), parameters);
    });
    const children: Record<string, any> = options.children || {};
    const groupChildren: Record<string, any> = {};
    for (const key in children) {
      const child = children[key];
      groupChildren[key] = createSegmentGroup(child);
    }
    return new UrlSegmentGroup(segments, groupChildren);
  };

  const push = (options: SegmentGroup, target?: string) => {
    const { matched: prevMatched } = _useMatched();
    const preserveParameter = options.segments[0]?.extra?.preserveParameter;
    if (preserveParameter) {
      const prevParams = prevMatched.segmentParams.page;
      options.segments[0].parameters = { ...prevParams, ...options.segments[0].parameters };
    }
    const group = createSegmentGroup(options);
    const tree = new UrlTree(group, {}, null);
    const href = serializer.serialize(tree);
    debugConsole.info('router change', options.segments?.[0]);
    if (target) {
      window.open(href, '_blank');
    } else {
      navigate(href);
    }
  };
  const back = () => {
    // const last = pathArr.pop();
    // if (last) {
    //   router.replace(last);
    // } else {
    //   history.back();
    // }
    history.back();
  };

  const _router = {
    ignite,
    navigate,
    push,
    back,
    activatedRoute: activatedRoute.asObservable()
  };

  /**
   * 兼容新版vue调试功能
   */
  if (__DEV__) {
    _router['currentRoute'] = {};
    _router['getRoutes'] = () => [];
  }

  Object.defineProperty(_router, '_instance', {
    enumerable: false,
    configurable: true,
    value: router
  });

  return _router as typeof _router & { _instance: PageJS.Static; back: () => void };
};

type Router = ReturnType<typeof createRouter>;

let instance: Router;

const getRouterInstance = () => {
  if (instance) {
    return instance;
  }

  instance = createRouter();

  return instance;
};

export { ActivatedRoute, NavigateOptions, Router, createRouter, getRouterInstance, SegmentGroup };
