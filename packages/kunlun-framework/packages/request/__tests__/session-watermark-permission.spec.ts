/**
 * @jest-environment jsdom
 */
import { getErrorCode, HttpClientError } from '../src/exception/HttpClientError';
import { isNotPermission } from '../src/permission/isNotPermission';
import { getSessionPath, setSessionPath, useSessionPath } from '../src/session/useSessionPath';
import { setWatermark } from '../src/watermark/session';

jest.mock('../src/watermark/watermark', () => ({
  __esModule: true,
  default: {
    set: jest.fn()
  }
}));

describe('session path', () => {
  it('setSessionPath 与 getSessionPath 读写一致', () => {
    expect(getSessionPath()).toBeUndefined();
    setSessionPath('/a');
    expect(getSessionPath()).toBe('/a');
  });

  it('useSessionPath 在执行后恢复之前的 sessionPath', async () => {
    setSessionPath('/root');
    await useSessionPath('/child', async () => {
      expect(getSessionPath()).toBe('/child');
    });
    expect(getSessionPath()).toBe('/root');
  });
});

describe('HttpClientError 与 permission', () => {
  it('getErrorCode 可以从 HttpClientError 中提取错误码', () => {
    const error = new HttpClientError(
      'msg',
      {
        errors: [
          {
            message: 'e',
            extensions: { errorCode: '403001' }
          }
        ]
      } as any,
      new Error('origin')
    );

    expect(getErrorCode(error)).toBe('403001');
  });

  it('isNotPermission 当错误码在 notPermissionCodes 中时返回 true', () => {
    const error = new HttpClientError(
      'msg',
      {
        errors: [
          {
            message: 'e',
            extensions: { errorCode: '11040035' }
          }
        ]
      } as any,
      new Error('origin')
    );

    expect(isNotPermission(error)).toBe(true);
    expect(isNotPermission(new Error('other'))).toBe(false);
  });
});

describe('watermark', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('setWatermark 只会触发一次 watermark.set', () => {
    const watermark = require('../src/watermark/watermark').default as { set: jest.Mock };
    const root = document.getElementById('root') as HTMLElement;

    setWatermark('code1', 'message1');
    setWatermark('code2', 'message2');

    jest.runAllTimers();

    expect(watermark.set).toHaveBeenCalledTimes(1);
    expect(watermark.set).toHaveBeenCalledWith('message1', document.body);
  });
});
