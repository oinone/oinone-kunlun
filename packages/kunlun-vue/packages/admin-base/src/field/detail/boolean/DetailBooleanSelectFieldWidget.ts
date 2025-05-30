import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { OptionColorStyle } from '../../FieldCommonEnum';

import { FormBooleanSelectFieldWidget } from '../../form';
import { enumFetchOptionByValue } from '../../util';
import Enum from '../enum/Enum.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: [ModelFieldType.Boolean],
    widget: ['Select', 'Radio']
  })
)
export class DetailBooleanSelectFieldWidget extends FormBooleanSelectFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Enum);
    return this;
  }

  @Widget.Reactive()
  protected get displayNameList() {
    return enumFetchOptionByValue(this.value, this.options);
  }

  @Widget.Reactive()
  protected get optionColor() {
    return this.optionColorStyle === OptionColorStyle.COLORFUL;
  }

  @Widget.Reactive()
  protected get optionColorStyle() {
    return this.getDsl().optionColorStyle || OptionColorStyle.COLORFUL;
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
 * @deprecated please using DetailBooleanSelectFieldWidget
 */
export const DetailBoolEnumOptionFieldWidget = DetailBooleanSelectFieldWidget;
