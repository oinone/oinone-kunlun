import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { FormFieldWidget, FormSelectModalComplexFieldWidget } from '../../../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToMany,
    widget: 'SelectModal'
  })
)
export class FormO2MSelectModalFieldWidget extends FormSelectModalComplexFieldWidget {
  @Widget.Reactive()
  protected get selectMode() {
    return SelectMode.multiple;
  }

  protected filterX2mChangeValue(value: any) {
    return value;
  }

  protected async mounted() {
    await this.loadOriginValue();
  }
}
