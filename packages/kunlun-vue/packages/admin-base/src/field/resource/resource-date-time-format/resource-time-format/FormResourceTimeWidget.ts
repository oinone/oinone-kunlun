import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ResourceDateTimeOption } from '@oinone/kunlun-shared';

import { FormFieldWidget } from '../../../../basic';
import { FormResourceDateFormatWidget } from '../resource-date-format';
import { getResourceTimeFormatOptions } from '../constant';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.Map,
    widget: ['ApColonNormalMapWidget', 'ColonNormalMapWidget', 'ApColonShortMapWidget', 'ColonShortMapWidget']
  })
)
export class FormResourceTimeWidget extends FormResourceDateFormatWidget {
  @Widget.Reactive()
  protected get options(): ResourceDateTimeOption[] {
    const opts = getResourceTimeFormatOptions();

    return opts.filter((opt) => this.optionalFields.includes(opt.id));
  }
}
