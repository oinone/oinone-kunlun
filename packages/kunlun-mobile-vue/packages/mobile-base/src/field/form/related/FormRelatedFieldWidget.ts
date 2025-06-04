import { RuntimeRelatedField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import Related from './Related.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    ttype: ModelFieldType.Related,
    viewType: [ViewType.Form, ViewType.Search, ViewType.Detail]
  })
)
export class FormRelatedFieldWidget extends FormFieldWidget<unknown, RuntimeRelatedField> {
  protected fieldWidget: FormFieldWidget | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(Related);
    return this;
  }
}
