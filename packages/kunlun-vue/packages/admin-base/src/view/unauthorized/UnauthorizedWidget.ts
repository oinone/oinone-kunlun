import { SPI } from '@kunlun/spi';
import { useMatched } from '@kunlun/router';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../basic';
import Unauthorized from './Unauthorized.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'UnauthorizedWidget' }))
export class UnauthorizedWidget extends BaseElementWidget {
  public initialize(props?: any) {
    super.initialize(props);
    this.setComponent(Unauthorized);
    return this;
  }

  @Widget.Reactive()
  private currentModel = '';

  protected mounted(): void {
    const { model = '' } = useMatched().matched.segmentParams.page;
    this.currentModel = model;
  }
}
