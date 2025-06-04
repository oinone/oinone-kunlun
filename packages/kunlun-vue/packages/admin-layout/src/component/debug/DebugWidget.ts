import { RedirectTargetEnum } from '@oinone/kunlun-engine';
import { Router } from '@oinone/kunlun-router';
import { SPI } from '@oinone/kunlun-spi';
import { useRouter } from '@oinone/kunlun-vue-router';
import { Widget } from '@oinone/kunlun-vue-widget';
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
