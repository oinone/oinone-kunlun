import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { DetailRelationSelectFieldWidget } from '../abstract/DetailRelationSelectFieldWidget';
import Select from './Select.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.ManyToOne
  })
)
export class DetailM2OSelectFieldWidget extends DetailRelationSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Select);
    return this;
  }
}

/**
 * @deprecated please using DetailM2OSelectFieldWidget
 */
export const DetailM2oSelectFieldWidget = DetailM2OSelectFieldWidget;
