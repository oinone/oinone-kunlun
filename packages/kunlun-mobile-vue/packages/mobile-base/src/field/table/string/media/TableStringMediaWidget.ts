import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget } from '../../../../basic';
import { MediaSingle } from '../../../../components';
import { TableStringFieldWidget } from '../TableStringFieldWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Table],
    ttype: ModelFieldType.String,
    widget: ['MediaPlayer']
  })
)
export class TableStringMediaWidget extends TableStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MediaSingle);
    return this;
  }
}
