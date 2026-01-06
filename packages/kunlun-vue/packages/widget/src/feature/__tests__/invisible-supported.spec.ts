import { executeInvisible, isAllInvisible, type InvisibleSupported } from '../invisible-supported';

describe('invisible-supported', () => {
  it('executeInvisible: 不传或为 undefined 时返回 false', () => {
    expect(executeInvisible(undefined)).toBe(false);
    expect(executeInvisible({ invisible: undefined })).toBe(false);
  });

  it('executeInvisible: 布尔值时直接返回布尔值', () => {
    expect(executeInvisible({ invisible: true })).toBe(true);
    expect(executeInvisible({ invisible: false })).toBe(false);
  });

  it('executeInvisible: 函数时执行并返回结果', () => {
    const supported: InvisibleSupported = {
      invisible: () => true
    };
    expect(executeInvisible(supported)).toBe(true);
  });

  it('isAllInvisible: 空数组或 undefined 返回 true, 否则需全部为 invisible', () => {
    expect(isAllInvisible(undefined)).toBe(true);
    expect(isAllInvisible([])).toBe(true);
    expect(
      isAllInvisible([{ invisible: true } as InvisibleSupported, { invisible: () => true } as InvisibleSupported])
    ).toBe(true);
    expect(
      isAllInvisible([{ invisible: true } as InvisibleSupported, { invisible: false } as InvisibleSupported])
    ).toBe(false);
  });
});
