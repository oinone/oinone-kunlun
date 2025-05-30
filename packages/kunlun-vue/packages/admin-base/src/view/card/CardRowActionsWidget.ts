import { SPI } from '@kunlun/spi';
import { RowActionBarWidget } from '../../action/component/action-bar';
import { BaseElementWidget } from '../../basic';
import DefaultCardRowActions from './DefaultCardRowActions.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'CardRowActions', inline: true }))
export class CardRowActionsWidget extends RowActionBarWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCardRowActions);
    return this;
  }
}
