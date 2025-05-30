import { BaseMaskWidget, BaseMaskWidgetProps } from './basic';
import MaskBlock from './MaskBlock.vue';

export class BaseMaskLayoutWidget<
  Props extends BaseMaskWidgetProps = BaseMaskWidgetProps
> extends BaseMaskWidget<Props> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MaskBlock);
    return this;
  }
}
