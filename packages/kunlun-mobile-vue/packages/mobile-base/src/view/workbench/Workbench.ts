import { SPI } from '@oinone/kunlun-spi';
import { BaseFormWidget, CustomWidget } from '../../basic';

import WorkbenchView from './Workbench.vue';

@SPI.ClassFactory(CustomWidget.Token({ widget: 'Workbench' }))
export class WorkbenchWidget extends BaseFormWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(WorkbenchView);

    return this;
  }

  public async fetchData() {
    return {} as any;
  }
}
