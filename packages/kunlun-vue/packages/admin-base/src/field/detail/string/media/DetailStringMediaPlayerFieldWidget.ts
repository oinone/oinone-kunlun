import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { MediaSingle } from '../../../../components';
import { FormStringFieldWidget } from '../../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: ['MediaPlayer']
  })
)
export class DetailStringMediaPlayerFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MediaSingle);
    return this;
  }
}

/**
 * @deprecated please using DetailStringMediaPlayerFieldWidget
 */
export const DetailStringMediaWidget = DetailStringMediaPlayerFieldWidget;
