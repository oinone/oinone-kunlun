import { RouterWidget } from '@oinone/kunlun-vue-router';
import { getDefaultBrowser, initI18n, OioProvider, translateValueByKey } from '@oinone/kunlun-engine';
import { SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';

/**
 * 无模块需要国际化的路由页面
 */
export class BaseI18nRouterWidget extends RouterWidget {
  protected moduleName = SYSTEM_MODULE_NAME.BASE;

  protected isoStorageKey = '';

  protected translateBrowserTitle = true;

  protected async beforeMount() {
    if (OioProvider.getConfig().enableI18n !== false) {
      initI18n(this.moduleName, this.isoStorageKey).then(() => {
        const title = getDefaultBrowser()?.title;
        if (this.translateBrowserTitle && title) {
          document.title = translateValueByKey(title);
        }
        this.forceUpdate();
      });
    }
    super.beforeMount();
  }
}
