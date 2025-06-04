import { SPI } from '@oinone/kunlun-spi';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import { DropdownWidget } from './DropdownWidget';

export enum DropdownContentType {
  TEXT = 'TEXT',
  ICON = 'ICON'
}

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'ToolbarDropdown' }))
export class ToolbarDropdownWidget extends DropdownWidget {
  @Widget.Reactive()
  protected get contentType(): DropdownContentType {
    return (this.getDsl().contentType as DropdownContentType) || DropdownContentType.TEXT;
  }

  @Widget.Reactive()
  protected get label() {
    if (this.contentType === DropdownContentType.TEXT) {
      return this.getDsl().label || translateValueByKey('设置');
    }
    return '';
  }

  @Widget.Reactive()
  protected get icon() {
    if (this.contentType === DropdownContentType.ICON) {
      return this.getDsl().icon;
    }
    return '';
  }
}
