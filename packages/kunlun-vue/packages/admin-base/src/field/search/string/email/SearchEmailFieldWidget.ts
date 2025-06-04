import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import { FormStringFieldWidget } from '../../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Email
  })
)
export class SearchEmailFieldWidget extends FormStringFieldWidget {}
