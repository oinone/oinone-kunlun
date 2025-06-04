import { FrameworkInitializeService, FrameworkInitializeSPI, OioProviderProps } from '@oinone/kunlun-engine';
import { SPIFactory } from '@oinone/kunlun-spi';
import { SHARED_ROUTER, SHARED_VIEW_WIDGET } from '../constants';
import { SharedMiddleware } from '../middleware';

@SPIFactory.Register(FrameworkInitializeSPI.Token({ framework: 'vue', isMobile: false, priority: 100 }))
export class SharedRouterInitializeService implements FrameworkInitializeService {
  public before(props: OioProviderProps) {
    let { router, http } = props;
    if (!router) {
      router = [];
      props.router = router;
    }
    router.push({
      path: `${SHARED_ROUTER}`,
      widget: SHARED_VIEW_WIDGET
    });
    if (!http) {
      http = {};
      props.http = http;
    }
    let { middleware } = http;
    if (!middleware) {
      middleware = [];
      http.middleware = middleware;
    }
    if (Array.isArray(middleware)) {
      http.middleware = [...middleware, SharedMiddleware];
    } else {
      http.middleware = [middleware, SharedMiddleware];
    }
  }
}
