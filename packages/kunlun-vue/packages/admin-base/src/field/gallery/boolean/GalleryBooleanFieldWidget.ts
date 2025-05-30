import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../basic/field';
import Boolean from './Boolean.vue';
import { DetailBooleanFieldWidget } from '../../detail';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Gallery], ttype: ModelFieldType.Boolean }))
export class GalleryBooleanFieldWidget extends DetailBooleanFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Boolean);
    return this;
  }
}
