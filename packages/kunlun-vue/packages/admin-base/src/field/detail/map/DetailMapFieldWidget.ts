import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormMapFieldWidget } from '../../form';
import DefaultReadonlyMap from './DefaultReadonlyMap.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: ModelFieldType.Map
  })
)
export class DetailMapFieldWidget extends FormMapFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultReadonlyMap);
    return this;
  }
}
