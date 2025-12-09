import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget, SelectTableFieldWidget } from '../../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToMany,
    widget: 'SelectTable'
  })
)
export class FormO2MSelectTableFieldWidget extends SelectTableFieldWidget {
  @Widget.Reactive()
  protected get selectMode() {
    return SelectMode.multiple;
  }

  protected async mounted() {
    await this.loadOriginValue();
  }
}
