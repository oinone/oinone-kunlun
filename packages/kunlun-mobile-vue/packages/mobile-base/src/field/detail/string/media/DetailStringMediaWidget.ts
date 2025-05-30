import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormStringFieldWidget } from '../../../form/string/FormStringFieldWidget';
import { FormFieldWidget } from '../../../../basic';
import { MediaSingle } from '../../../../components';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: ['MediaPlayer']
  })
)
export class DetailStringMediaWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MediaSingle);
    return this;
  }
}
