import { RouterPath, RuntimeContextManager } from '@kunlun/engine';
import { GlobalConfig } from '@kunlun/meta';
import { UrlHelper } from '@kunlun/shared';
import { SPIFactory } from '@kunlun/spi';
import { VueWidget } from '@kunlun/vue-widget';
import { DefaultMetadataMainViewWidget } from '../main-view';
import { RootComponentSPI } from '../spi';
import { FirstResetPasswordWidget, ForgetPasswordWidget, HomePageWidget, LoginPageWidget } from '../view';
import RootView from './Root.vue';
import { setGlobalEnv } from '@kunlun/router';

interface Page extends RouterPath {
  slotName?: string;
}

const DEFAULT_PAGES: Page[] = [
  {
    path: '/login',
    widget: 'Login',
    slotName: 'login'
  },
  {
    path: '/forget',
    widget: 'ForgetPassword',
    slotName: 'forget'
  },
  {
    path: '/first',
    widget: 'FirstResetPassword',
    slotName: 'firstReset'
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
    forget: ForgetPasswordWidget,
    first: FirstResetPasswordWidget
    // studio: EntryWidget,
  };

  @VueWidget.Reactive()
  private loginUrl = GlobalConfig.getConfig().login || GlobalConfig.defaultLoginPath;

  @VueWidget.Reactive()
  private pages: Page[] = [...DEFAULT_PAGES];

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
