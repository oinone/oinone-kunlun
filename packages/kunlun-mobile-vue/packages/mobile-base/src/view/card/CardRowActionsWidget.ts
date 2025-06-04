import { SPI } from '@oinone/kunlun-spi';
import { RowActionBarWidget } from '../../action/component/action-bar';
import { BaseElementWidget } from '../../basic';
import DefaultCardRowActions from './DefaultCardRowActions.vue';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActiveCountEnum } from '../../typing';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'CardRowActions', inline: true }))
export class CardRowActionsWidget extends RowActionBarWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCardRowActions);
    return this;
  }

  @Widget.Reactive()
  protected get activeCount(): number | undefined {
    return super.activeCount! > ActiveCountEnum.THREE ? ActiveCountEnum.THREE : super.activeCount!;
  }
}
