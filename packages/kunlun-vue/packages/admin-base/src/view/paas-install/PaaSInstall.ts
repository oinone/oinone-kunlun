import { SPI } from '@oinone/kunlun-spi';
import { MaskWidget } from '@oinone/kunlun-vue-admin-layout';
import { useMatched } from '@oinone/kunlun-vue-router';
import { Widget } from '@oinone/kunlun-vue-widget';
import PaaSInstallView from './PaaSInstall.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'PaaSInstall' }))
export class PaaSInstallWidget extends MaskWidget {
  @Widget.Reactive()
  public viewModel = '';

  public initialize(props) {
    super.initialize(props);
    this.setComponent(PaaSInstallView);
    return this;
  }

  async mounted() {
    super.mounted();
    const model = useMatched().matched.segmentParams.page.model;
    this.viewModel = model as string;
  }
}
