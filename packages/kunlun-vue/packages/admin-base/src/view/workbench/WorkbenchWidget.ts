import { SPI } from '@oinone/kunlun-spi';
import { BaseElementWidget } from '../../basic';

import WorkbenchView from './Workbench.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'Workbench' }))
export class WorkbenchWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(WorkbenchView);
    return this;
  }
}
