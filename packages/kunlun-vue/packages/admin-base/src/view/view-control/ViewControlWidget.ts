import { DslDefinition } from '@oinone/kunlun-dsl';
import { SPI } from '@oinone/kunlun-spi';
import { isGalleryViewState, isTableViewState, Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementHookWidget } from '../../basic';
import type { GalleryWidget } from '../gallery';
import type { TableWidget } from '../table';
import DefaultViewControl from './DefaultViewControl.vue';

@SPI.ClassFactory(
  BaseElementHookWidget.Token({
    widget: ['actionBar', 'action-bar', 'ActionBar'],
    slot: 'right',
    priority: 100
  })
)
export class ViewControlWidget extends BaseElementHookWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultViewControl);
    return this;
  }

  @Widget.Reactive()
  protected get viewControlWidget(): DslDefinition | undefined {
    const { viewState } = this;
    if (!viewState) {
      return undefined;
    }
    if (isTableViewState(viewState) && viewState.table) {
      return Widget.select<TableWidget>(viewState.table)?.getOperator<TableWidget>()?.viewControlWidget;
    }
    if (isGalleryViewState(viewState) && viewState.gallery) {
      return Widget.select<GalleryWidget>(viewState.gallery)?.getOperator<GalleryWidget>()?.viewControlWidget;
    }
    return undefined;
  }

  @Widget.Reactive()
  public get invisible() {
    if (!this.viewControlWidget) {
      return true;
    }
    return super.invisible;
  }
}
