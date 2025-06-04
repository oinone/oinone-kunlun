import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BasePackWidget } from '../../basic';

import FieldGrid from './FieldGrid.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'field-grid' }))
export class FieldGridGroup extends BasePackWidget {
  @Widget.Reactive()
  protected gridGap = '16,16';

  @Widget.Reactive()
  protected get repeatColumns() {
    if (this.cols) {
      return `repeat(${this.cols}, 1fr)`;
    }
    return `repeat(12, 1fr)`;
  }

  @Widget.Reactive()
  protected title = '';

  public initialize(props) {
    super.initialize(props);

    this.title = (this.getDsl().title as string) || '';

    const { gap } = this.getDsl();

    if (gap) {
      this.gridGap = this.getDsl().gap as string;
    }

    this.setComponent(FieldGrid);
    return this;
  }
}
