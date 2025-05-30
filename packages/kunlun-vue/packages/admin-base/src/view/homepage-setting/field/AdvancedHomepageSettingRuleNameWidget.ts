import { translateValueByKey } from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormStringInputFieldWidget } from '../../../field';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { HomepageConfigRule } from '../typing';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    widget: 'AdvancedHomepageSettingRuleNameWidget'
  })
)
export class AdvancedHomepageSettingRuleNameWidget extends FormStringInputFieldWidget {
  @Widget.Inject('useHomepageSetting')
  protected useHomepageSetting;

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();

    if (!isValidatorSuccess(res)) {
      return res;
    }

    const rule = this.formData as HomepageConfigRule;
    const isUnique: boolean = this.useHomepageSetting.checkRuleName(rule);
    if (!isUnique) {
      return this.validatorError(translateValueByKey('规则名称应用下唯一'));
    }

    return this.validatorSuccess();
  }
}
