import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, FormSelectTableComplexFieldWidget } from '../../../../../basic';
import { SelectTableMode } from '../../../../../typing';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToMany,
    widget: 'SelectTable'
  })
)
export class FormO2MSelectTableFieldWidget extends FormSelectTableComplexFieldWidget {
  @Widget.Reactive()
  protected selectMode = SelectTableMode.Multiple;

  protected async mounted() {
    await this.loadOriginValue();
  }
}
