import {
  HttpClientHook,
  HttpClientHookBeforeData,
  HttpClientHookOptions,
  HttpClientHookToken
} from '@oinone/kunlun-request';
import { SPI } from '@oinone/kunlun-spi';
import { getSharedSession } from '../session';

@SPI.Service(HttpClientHookToken, { name: 'shared' })
export class SharedHttpClientHook implements HttpClientHook {
  public isSupported(options: HttpClientHookOptions): boolean {
    return !!getSharedSession();
  }

  public before(data: HttpClientHookBeforeData) {
    const { variables } = data;
    const sharedSession = getSharedSession();
    if (sharedSession) {
      data.variables = {
        ...variables,
        sharedCode: sharedSession.sharedCode,
        authorizationCode: sharedSession.authorizationCode
      };
    }
  }
}
