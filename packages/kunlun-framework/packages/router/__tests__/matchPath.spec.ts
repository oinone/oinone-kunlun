import { matchPath, UrlSegment } from '../index';

const createSegments = (paths: string[]) => paths.map((p) => new UrlSegment(p, {}));

describe('matchPath', () => {
  it('支持精确匹配', () => {
    const segments = createSegments(['user', '1']);
    const matched = matchPath(segments, { path: '/user/:id', exact: true });
    expect(matched).not.toBeNull();
    expect(matched?.params.id).toBe('1');
    expect(matched?.isExact).toBe(true);
  });

  it('不匹配错误路径', () => {
    const segments = createSegments(['user']);
    const matched = matchPath(segments, { path: '/order/:id', exact: true });
    expect(matched).toBeNull();
  });
});
