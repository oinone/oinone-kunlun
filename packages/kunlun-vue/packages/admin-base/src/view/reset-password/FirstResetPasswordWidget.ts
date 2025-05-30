import { MultiTabsRuntimeManifestMergedConfigManager } from '@kunlun/engine';
import { ViewActionTarget } from '@kunlun/meta';
import { UrlHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { RouterWidget } from '@kunlun/vue-router';
import { OioMessage } from '@kunlun/vue-ui-antd';
import { Widget } from '@kunlun/vue-widget';
import { UserService } from '../../service';
import FirstResetPassword from './FirstResetPassword.vue';
import { ForgetPasswordWidget } from './ForgetPasswordWidget';

@SPI.ClassFactory(RouterWidget.Token({ widget: 'FirstResetPassword' }))
export class FirstResetPasswordWidget extends ForgetPasswordWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(FirstResetPassword);
    return this;
  }

  @Widget.Reactive()
  protected get verificationRules() {
    return {
      newPassword: [{ required: true, validator: this.validateNewPassword.bind(this) }],
      confirmPassword: [{ required: true, validator: this.validateConfirmPassword.bind(this) }]
    };
  }

  @Widget.Method()
  protected async onOk(): Promise<void> {
    const { newPassword, confirmPassword } = this.formData;
    if (!newPassword || !confirmPassword) {
      return;
    }
    const result = await this.executeResetPasswordByFirst(newPassword, confirmPassword);
    if (result) {
      window.location.href = UrlHelper.appendBasePath('/');
    }
  }

  protected async executeResetPasswordByFirst(password: string, confirmPassword): Promise<boolean> {
    const { broken, errorMsg, redirect } = await UserService.resetPasswordByFirst(password, confirmPassword);
    if (broken) {
      if (errorMsg) {
        OioMessage.error(errorMsg);
      }
      return false;
    }
    if (redirect) {
      const { model, name, viewType, moduleDefinition, resModuleDefinition } = redirect;
      const moduleName = resModuleDefinition?.name || moduleDefinition?.name;
      if (model && name && viewType && moduleName) {
        this.router.push({
          segments: [
            {
              path: 'page',
              parameters: {
                module: moduleName,
                model,
                action: name,
                viewType,
                scene: name,
                target: MultiTabsRuntimeManifestMergedConfigManager.isEnabled(moduleName)
                  ? ViewActionTarget.OpenWindow
                  : redirect.target
              }
            }
          ]
        });
        return false;
      }
    }
    return true;
  }

  protected async mountedProcess(): Promise<void> {
    await this.initMajorConfig();
  }
}
