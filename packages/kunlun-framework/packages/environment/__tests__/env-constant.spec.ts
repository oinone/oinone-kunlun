import { CLICK_ACTIVATED_CLASS, CONTENT_NULL_SELECTOR } from '../index';

describe('environment 常量', () => {
  it('CLICK_ACTIVATED_CLASS 与 CONTENT_NULL_SELECTOR 有默认值', () => {
    expect(CLICK_ACTIVATED_CLASS).toBe('oio-click-activated');
    expect(CONTENT_NULL_SELECTOR).toBe('__null__');
  });
});
