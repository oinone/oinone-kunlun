import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActionWidget } from '../component';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_ValidateForm }))
export class ValidateFormActionWidget extends ActionWidget {
  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('校验');
  }

  protected get validateForm() {
    return true;
  }

  @Widget.Method()
  public async validateAndClick() {
    const res = await this.validatorForm();
    return res;
  }
}
