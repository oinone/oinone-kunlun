import { RequestEncryptHelper } from '../src/license/RequestEncryptHelper';
import { RequestError } from '../src/license/RequestError';
import { verify } from '../src/license/verification';

jest.mock('../src/watermark', () => ({
  setWatermark: jest.fn()
}));

describe('RequestEncryptHelper 与 license.verify', () => {
  it('decrypt 解析合法密文', () => {
    // 该用例只验证 decrypt 调用成功，不校验具体密文
    expect(() => RequestEncryptHelper.decrypt('abcdefghijklmnop', 'cDLnboSInDjbS6S7HCF3eg==')).not.toThrow();
  });

  it('verify 在无 pl/ps 时直接返回', () => {
    expect(() => verify({} as any)).not.toThrow();
  });

  it('verify 在 pl/ps 非字符串时抛出 RequestError', () => {
    expect(() => verify({ data: { __pl__: 1, __ps__: 'k' } } as any)).toThrow(RequestError);
    expect(() => verify({ data: { __pl__: 'v', __ps__: {} } } as any)).toThrow(RequestError);
  });

  it('verify 在解密失败时抛出 RequestError', () => {
    expect(() => verify({ data: { __pl__: 'invalid', __ps__: 'invalid' } } as any)).toThrow(RequestError);
  });
});
