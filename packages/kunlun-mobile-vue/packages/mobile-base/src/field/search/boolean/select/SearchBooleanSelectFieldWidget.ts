import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import { FormFieldWidget } from '../../../../basic';
import Select from './Select.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: ViewType.Search, ttype: ModelFieldType.Boolean }))
export class SearchBooleanSelectFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Select);
    return this;
  }

  @Widget.Reactive()
  protected options: { value: boolean; label: string }[] = [
    { value: true, label: this.translate('kunlun.fields.boolean.true') },
    { value: false, label: this.translate('kunlun.fields.boolean.false') }
  ];
}
