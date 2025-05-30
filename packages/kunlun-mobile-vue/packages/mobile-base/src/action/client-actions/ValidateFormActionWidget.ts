import { ModelDefaultActionName } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { translateValueByKey } from '@kunlun/engine';
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
