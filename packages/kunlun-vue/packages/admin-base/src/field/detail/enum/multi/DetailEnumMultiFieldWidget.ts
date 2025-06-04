import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { Widget } from '@oinone/kunlun-vue-widget';

import { FormFieldWidget } from '../../../../basic';
import { EnumerationValue, FormEnumFieldAbstractWidget } from '../../../form/enum/FormEnumFieldAbstractWidget';
import { multiEnumFetchOptionByValue } from '../../../util';

import Enum from '../Enum.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Detail], ttype: ModelFieldType.Enum, multi: true }))
export class DetailEnumMultiFieldWidget extends FormEnumFieldAbstractWidget<EnumerationValue[]> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Enum);
    return this;
  }

  @Widget.Reactive()
  protected get displayNameList() {
    const options = this.options || [];
    return multiEnumFetchOptionByValue(this.value, options);
  }

  @Widget.Reactive()
  protected get displayNameListStr() {
    if (this.displayNameList && this.displayNameList.length) {
      return this.displayNameList.map((v) => v && v.label).join('，');
    }
    return undefined;
  }
}

/**
 * @deprecated please using DetailEnumMultiFieldWidget
 */
export const DetailMultiEnumFieldWidget = DetailEnumMultiFieldWidget;
