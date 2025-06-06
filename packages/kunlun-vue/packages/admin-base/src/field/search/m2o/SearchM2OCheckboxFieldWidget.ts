import { SubmitHandler, SubmitValue } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormM2MCheckboxFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Checkbox'
  })
)
export class SearchM2OCheckboxFieldWidget extends FormM2MCheckboxFieldWidget {
  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    return SubmitHandler.O2M(field, itemName, submitValue, value);
  }
}
