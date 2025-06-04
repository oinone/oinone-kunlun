import { ViewType } from '@oinone/kunlun-meta';
import { http } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';

import { FormStringFieldWidget } from '../FormStringFieldWidget';
import Component from './VerificationCode.vue';

@SPI.ClassFactory(
  FormStringFieldWidget.Token({
    viewType: ViewType.Form,
    widget: 'VerificationCode'
  })
)
export class FormStringVerificationCodeFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Component);
    return this;
  }

  @VueWidget.Reactive()
  private imageSrc = '';

  @Widget.Reactive()
  protected get picCodeScene() {
    const _picCodeScene = this.getDsl().picCodeScene as string;
    if (_picCodeScene) {
      return `&picCodeScene=${_picCodeScene}`;
    }
    return '';
  }

  @Widget.Reactive()
  protected get imagePath() {
    const _imagePath = this.getDsl().imagePath;

    return _imagePath || '/pamirs/api/refreshPicCode';
  }

  @Widget.Reactive()
  private reload = () => {
    this.getOperator<this>().imageSrc = '';
    setTimeout(() => {
      this.getOperator<this>().imageSrc = this.genPath();
    });
  };

  protected mounted() {
    super.mounted();
    this.imageSrc = this.genPath();
  }

  protected genPath() {
    return `${http.getBaseURL()}${this.imagePath}?time=${Date.now()}${this.picCodeScene}`;
  }
}
