import { SPI } from '@oinone/kunlun-spi';
import { useMatched } from '@oinone/kunlun-router';
import { Widget } from '@oinone/kunlun-vue-widget';
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
