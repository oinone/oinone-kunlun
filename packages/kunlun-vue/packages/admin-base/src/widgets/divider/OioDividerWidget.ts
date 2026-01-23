import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { DividerOrientation, DividerType, OioDivider } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../basic';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'divider' }))
export class OioDividerWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(OioDivider);
    return this;
  }

  @Widget.Reactive()
  public get type(): DividerType | string | undefined {
    return this.getDsl().type;
  }

  @Widget.Reactive()
  public get dashed(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().dashed);
  }

  @Widget.Reactive()
  public get plain(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().plain);
  }

  @Widget.Reactive()
  public get orientation(): DividerOrientation | string | undefined {
    return this.getDsl().orientation;
  }
}
