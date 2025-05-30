import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../../basic';
import { FormStringFieldWidget } from '../../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Phone
  })
)
export class SearchPhoneFieldWidget extends FormStringFieldWidget {}
