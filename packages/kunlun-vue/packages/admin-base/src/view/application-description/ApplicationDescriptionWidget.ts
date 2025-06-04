import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { MaskWidget } from '@oinone/kunlun-vue-admin-layout';
import ApplicationDescription from './ApplicationDescription.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'ApplicationDescriptionWidget', type: ViewType.Detail }))
export class ApplicationDescriptionWidget extends MaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ApplicationDescription);
    return this;
  }
}
