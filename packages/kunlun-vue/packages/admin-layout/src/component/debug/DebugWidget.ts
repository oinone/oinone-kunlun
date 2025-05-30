import { RedirectTargetEnum } from '@kunlun/engine';
import { Router } from '@kunlun/router';
import { SPI } from '@kunlun/spi';
import { useRouter } from '@kunlun/vue-router';
import { Widget } from '@kunlun/vue-widget';
import { MaskWidget } from '../../basic';
import { DEBUG_ROUTER } from './constants';
import Debug from './Debug.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'debug' }))
export class DebugWidget extends MaskWidget {
  protected router!: Router;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(Debug);
    return this;
  }

  @Widget.Method()
  public onClick() {
    this.router.push(
      {
        segments: [
          {
            path: DEBUG_ROUTER,
            extra: { preserveParameter: true }
          }
        ]
      },
      RedirectTargetEnum.BLANK
    );
  }

  protected beforeCreated() {
    this.router = useRouter().router;
  }
}
