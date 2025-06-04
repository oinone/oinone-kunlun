import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import UploadImg from './UploadImg.vue';

export default class UploadImgWidget extends VueWidget {
  @Widget.Inject()
  protected value!: string;

  @Widget.Reactive()
  protected get currentValue() {
    return this.value || {};
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(UploadImg);
    return this;
  }
}
