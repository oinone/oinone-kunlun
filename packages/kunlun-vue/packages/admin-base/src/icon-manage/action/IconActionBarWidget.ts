import { ActiveRecordsOperator } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { RowContext } from '@kunlun/vue-ui';
import { RowActionBarWidget } from '../../action';
import { BaseElementWidget } from '../../basic';
import IconActionBar from './IconActionBar.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'iconActionBar', inline: true }))
export class IconActionBarWidget extends RowActionBarWidget {
  public initialize(props) {
    const slotContext = props.slotContext as unknown as RowContext;
    if (slotContext) {
      props.activeRecords = ActiveRecordsOperator.repairRecords(slotContext.data);
    }
    super.initialize(props);
    this.setComponent(IconActionBar);
    return this;
  }
}
