import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../basic/field';
import { DetailRelationSelectFieldWidget } from '../abstract/DetailRelationSelectFieldWidget';
import Select from './Select.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.ManyToOne
  })
)
export class DetailM2oSelectFieldWidget extends DetailRelationSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Select);
    return this;
  }
}
