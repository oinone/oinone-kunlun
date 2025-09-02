import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../basic';
import DefaultViewControl from './DefaultViewControl.vue';
import { ActionWidget } from '../../action';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'ViewControl'
  })
)
export class ViewControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultViewControl);
    return this;
  }

  /**
   * @see {@link BaseListView}
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected actionBarChildren: ActionWidget[] | undefined;

  @Widget.Reactive()
  protected get hasActionBar() {
    return !!this.actionBarChildren?.length && this.actionBarChildren.every((action) => !action.invisible);
  }
}
