import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { BasePackWidget } from '../../basic/token/BasePackWidget';
import { DefaultTabsWidget } from '../tabs/DefaultTabsWidget';
import DefaultMultiViewTabs from './DefaultMultiViewTabs.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'MultiViewTabs' }))
export class DefaultMultiViewTabsWidget extends DefaultTabsWidget {
  @Widget.Reactive()
  public get invisible(): boolean {
    return false;
  }

  @Widget.Reactive()
  public get allInvisible(): boolean | undefined {
    return false;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMultiViewTabs);
    return this;
  }
}
