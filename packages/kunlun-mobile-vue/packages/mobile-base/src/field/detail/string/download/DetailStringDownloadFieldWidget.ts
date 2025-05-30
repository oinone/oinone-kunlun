import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { FormStringDownloadFieldWidget } from '../../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'Download'
  })
)
export class DetailStringDownloadFieldWidget extends FormStringDownloadFieldWidget {}
