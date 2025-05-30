import { Key, pathToRegexp } from 'path-to-regexp';
import { UrlSegment } from './url_tree';

export interface Matched {
  path: string;
  url: string;
  params: { [props: string]: string };
  segmentParams: { [props: string]: any; extra?: { preserveParameter?: boolean } };
  isExact?: boolean;
}

export interface MatchPathOptions {
  path: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

export const matchPath = (segments: UrlSegment[], opts: MatchPathOptions): Matched | null => {
  const currentPath = `/${segments.map((seg) => seg.path).join('/')}`;
  const { path, exact = false, strict = false, sensitive = false } = opts;

  if (!path && path !== '') {
    return null;
  }

  const { regexp, keys } = compilePath(path, {
    end: exact,
    strict,
    sensitive
  });
  const matched = regexp.exec(currentPath);

  if (!matched) {
    return null;
  }

  const [url, ...values] = matched;
  const isExact = currentPath === url;

  if (exact && !isExact) {
    return null;
  }

  return {
    path, // the path used to match
    url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
    // 是否精确匹配
    isExact,
    // path 段中代表参数的部分：`/user/:id` => `/user/1` => { id: '1' }
    params: keys.reduce((memo: any, key: any, index: any) => {
      memo[key.name] = values[index];
      return memo;
    }, {}),
    segmentParams: segments.reduce((prev, seg) => ({ ...prev, [seg.path]: seg.parameters || {} }), {})
  };
};

const cache: Record<string, any> = {};
const cacheLimit = 10000;
let cacheCount = 0;

const compilePath = (path: string, options: any) => {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) {
    return pathCache[path];
  }

  const keys: Key[] = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
};
