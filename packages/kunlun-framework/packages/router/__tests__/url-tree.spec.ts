import { UrlSegment, UrlSegmentGroup, UrlTree } from '../index';
import { containsTree } from '../src/url_tree';

describe('UrlTree 与 UrlSegment', () => {
  it('UrlTree toString 包含路径、查询参数和 fragment', () => {
    const group = new UrlSegmentGroup([new UrlSegment('user', {}), new UrlSegment('1', {})], {});
    const tree = new UrlTree(group, { debug: 'true' }, 'frag');
    expect(tree.toString()).toBe('/user/1?debug=true#frag');
  });

  it('containsTree 在非 exact 模式下只要求包含关系', () => {
    const group = new UrlSegmentGroup([new UrlSegment('user', {}), new UrlSegment('1', {})], {});
    const parent = new UrlTree(group, { debug: 'true' }, null);
    const child = new UrlTree(group, {}, null);

    expect(containsTree(parent, child, false)).toBe(true);
    expect(containsTree(parent, child, true)).toBe(false);
  });
});
