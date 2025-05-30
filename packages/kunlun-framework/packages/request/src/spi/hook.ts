import { ServiceIdentifier, SPI } from '@kunlun/spi';
import { HttpClientHookAfterData, HttpClientHookBeforeData, HttpClientHookOptions } from './typing';

export interface HttpClientHook {
  isSupported(options: HttpClientHookOptions): boolean;

  before?(data: HttpClientHookBeforeData);

  after?(data: HttpClientHookAfterData<unknown>);
}

/**
 * HttpClientHook Token
 */
export const HttpClientHookToken = ServiceIdentifier<HttpClientHook>('HttpClientHook');

/**
 * 默认实现
 */
@SPI.Service(HttpClientHookToken, { name: '__default__' })
export class DefaultHttpClientHook implements HttpClientHook {
  public isSupported(): boolean {
    return false;
  }
}
