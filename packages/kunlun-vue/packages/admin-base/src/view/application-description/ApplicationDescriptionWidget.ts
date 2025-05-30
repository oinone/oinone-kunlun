import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { MaskWidget } from '@kunlun/vue-admin-layout';
import ApplicationDescription from './ApplicationDescription.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'ApplicationDescriptionWidget', type: ViewType.Detail }))
export class ApplicationDescriptionWidget extends MaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ApplicationDescription);
    return this;
  }
}
