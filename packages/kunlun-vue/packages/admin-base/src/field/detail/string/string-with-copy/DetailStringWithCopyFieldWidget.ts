import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget } from '../../../../basic';
import String from './String.vue';

@SPI.ClassFactory(
  BaseFieldWidget.Token({ viewType: [ViewType.Detail], ttype: ModelFieldType.String, widget: 'StringWithCopy' })
)
export class DetailStringWithCopyFieldWidget extends BaseFieldWidget {
  public initialize(props: any): this {
    super.initialize(props);

    this.setComponent(String);
    return this;
  }
}

/**
 * @deprecated please using DetailStringWithCopyFieldWidget
 */
export const StringWithCopyWidget = DetailStringWithCopyFieldWidget;
