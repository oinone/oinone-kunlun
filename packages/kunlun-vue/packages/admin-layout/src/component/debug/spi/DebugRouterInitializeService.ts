import { FrameworkInitializeService, FrameworkInitializeSPI, OioProviderProps } from '@kunlun/engine';
import { SPIFactory } from '@kunlun/spi';
import { DebugConfigManager } from '../../../config';
import { DEBUG_ROUTER, DEBUG_VIEW_WIDGET } from '../constants';

@SPIFactory.Register(FrameworkInitializeSPI.Token({ framework: 'vue', isMobile: false, priority: 200 }))
export class DebugRouterInitializeService implements FrameworkInitializeService {
  public before(props: OioProviderProps) {
    if (DebugConfigManager.isEnabled()) {
      let { router } = props;
      if (!router) {
        router = [];
        props.router = router;
      }
      router.push({
        path: `/${DEBUG_ROUTER}`,
        widget: DEBUG_VIEW_WIDGET
      });
    }
  }
}
