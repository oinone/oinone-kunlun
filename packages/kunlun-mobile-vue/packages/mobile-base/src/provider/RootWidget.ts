import { RouterPath, RuntimeContextManager } from '@oinone/kunlun-engine';
import { GlobalConfig } from '@oinone/kunlun-meta';
import { UrlHelper } from '@oinone/kunlun-shared';
import { SPIFactory } from '@oinone/kunlun-spi';
import { VueWidget } from '@oinone/kunlun-vue-widget';
import { setGlobalEnv } from '@oinone/kunlun-router';
import { DefaultMetadataMainViewWidget } from '../main-view';
import { RootComponentSPI } from '../spi';
import { HomePageWidget, LoginPageWidget, NoticePageWidget, MobileUnauthorizedWidget } from '../view';
import RootView from './Root.vue';

interface Page extends RouterPath {
  slotName?: string;
}

const DEFAULT_PAGES: Page[] = [
  {
    path: '/login',
    widget: 'MobileLogin',
    slotName: 'login'
  },
  {
    path: '/notice',
    widget: 'Notice',
    slotName: 'notice'
  },
  {
    path: '/unauthorized',
    widget: 'MobileUnauthorizedWidget',
    slotName: 'unauthorized'
  }
];

function pathConvertSlotName(path: string): string {
  return path.split('/')[1];
}

@SPIFactory.Register(RootComponentSPI.Token({ widget: 'root' }))
export class RootWidget extends VueWidget {
  @VueWidget.Reactive()
  public root: string;

  @VueWidget.Reactive()
  public widgets = {
    login: LoginPageWidget,
    page: DefaultMetadataMainViewWidget,
    notice: NoticePageWidget,
    unauthorized: MobileUnauthorizedWidget
    // studio: EntryWidget,
  };

  @VueWidget.Reactive()
  protected loginUrl = GlobalConfig.getConfig().login || GlobalConfig.defaultLoginPath;

  @VueWidget.Reactive()
  protected pages: Page[] = [...DEFAULT_PAGES];

  constructor() {
    super();
    this.root = this.getHandle();
  }

  public initialize() {
    super.initialize();
    this.createWidget(HomePageWidget, 'homePage');
    const customRoutes = RuntimeContextManager.get()?.routers;
    const customRouteMap = new Map();
    if (customRoutes && Array.isArray(customRoutes)) {
      customRoutes.forEach((route) => {
        customRouteMap.set(route.path, route);
      });
    }
    // 替换默认页面
    this.pages = this.pages.map((page) => {
      let route: Page;
      const customRoute = customRouteMap.get(page.path);
      if (customRoute) {
        customRouteMap.delete(page.path);
        route = { ...customRoute };
      } else {
        route = { ...page };
      }
      return {
        ...route,
        path: UrlHelper.appendBasePath(route.path),
        slotName: route.slotName || pathConvertSlotName(route.path)
      };
    });
    // 添加新路由
    customRouteMap.forEach((page) => {
      this.pages.push({
        ...page,
        path: UrlHelper.appendBasePath(page.path),
        slotName: page.slotName || pathConvertSlotName(page.path)
      });
    });
    this.setComponent(RootView);
    return this;
  }

  public $$mounted() {
    super.$$mounted();
    setGlobalEnv();
  }
}
