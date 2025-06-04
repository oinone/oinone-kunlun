import { IDslNode } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { LayoutWidget, MobileViewWidget } from '../../layout';
import ConfigComponent from './Config.vue';

@SPI.ClassFactory(
  MobileViewWidget.Token({
    tagName: 'config'
  })
)
export class ConfigLayout extends LayoutWidget {
  protected props!: IDslNode;

  public initialize(props) {
    super.initialize(props);
    this.props = props;
    this.setComponent(ConfigComponent);
    return this;
  }
}
