import { gql, HttpClient } from '@oinone/kunlun-request';
import { SYSTEM_MODULE_NAME } from '../../metadata';
import { RemoteLoadOption } from '../typing';
import { PluginLoadHelper } from '../util';

const http = HttpClient.getInstance();

export class RemotePluginLoader {
  public static readonly INSTANCE = new RemotePluginLoader();

  private cache: RemoteLoadOption | null | undefined;

  public async load(): Promise<void> {
    let option = this.cache;
    if (option === undefined) {
      option = await fetchRemoteLoadOptions();
      if (!option) {
        option = null;
      }
      this.cache = option;
    }
    if (option) {
      const { javascript: js, css } = option;
      const promises: Promise<void>[] = [];
      if (js) {
        promises.push(PluginLoadHelper.loadJavascript(js));
      }
      if (css) {
        promises.push(PluginLoadHelper.loadCSS(css));
      }
      await Promise.allSettled(promises);
    }
  }
}

async function fetchRemoteLoadOptions(): Promise<RemoteLoadOption | undefined> {
  const queryGql = gql`
    {
      widgetDefinitionQuery {
        loadSDK(data: {}) {
          javascript
          css
        }
      }
    }
  `;
  try {
    const result = await http.query<RemoteLoadOption>(SYSTEM_MODULE_NAME.BASE, queryGql);
    return result.data.widgetDefinitionQuery.loadSDK;
  } catch (e) {
    console.error('remote plugin load error.', e);
    return undefined;
  }
}
