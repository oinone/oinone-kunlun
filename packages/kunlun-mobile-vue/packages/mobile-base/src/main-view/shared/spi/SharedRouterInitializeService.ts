import { FrameworkInitializeService, FrameworkInitializeSPI, OioProviderProps } from '@oinone/kunlun-engine';
import { SPIFactory } from '@oinone/kunlun-spi';
import { SHARED_ROUTER, SHARED_VIEW_WIDGET } from '../constants';

@SPIFactory.Register(FrameworkInitializeSPI.Token({ framework: 'vue', isMobile: true, priority: 100 }))
export class SharedRouterInitializeService implements FrameworkInitializeService {
  public before(props: OioProviderProps) {
    let { router } = props;
    if (!router) {
      router = [];
      props.router = router;
    }
    router.push({
      path: `${SHARED_ROUTER}`,
      widget: SHARED_VIEW_WIDGET
    });
  }
}
