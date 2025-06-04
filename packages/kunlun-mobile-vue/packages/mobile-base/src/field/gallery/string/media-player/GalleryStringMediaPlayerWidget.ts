import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import { FormFieldWidget } from '../../../../basic';
import { FormInputAbstractFieldWidget } from '../../../form';
import GalleryMediaPlayer from './GalleryMediaPlayer.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String],
    widget: 'MediaPlayer'
  })
)
export class GalleryStringMediaPlayerWidget extends FormInputAbstractFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryMediaPlayer);
    return this;
  }

  @Widget.Reactive()
  public get justifyContent() {
    return this.getDsl().justifyContent;
  }
}
