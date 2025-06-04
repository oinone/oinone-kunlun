import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { customMutation } from '@oinone/kunlun-service';
import { HttpClient } from '@oinone/kunlun-request';
import { OioProvider, translateValueByKey } from '@oinone/kunlun-engine';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { useRouter } from '@oinone/kunlun-vue-router';

import { BaseElementWidget } from '../../basic';

import LoginPageSetting from './LoginPageSetting.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'LoginPageSettingWidget' }))
export class LoginPageSettingWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(LoginPageSetting);

    return this;
  }

  private http = HttpClient.getInstance();

  @Widget.Reactive()
  private loginConfig = {};

  protected $matched: Matched | undefined;

  protected $router: Router | undefined;

  @Widget.Method()
  private goBack() {
    window.history.back();
    // gotoPrevPage(
    //   this.viewAction!,
    //   (action: RuntimeViewAction) => executeViewAction(action, this.$router, this.$matched),
    //   this.$router?.navigate
    // );
  }

  @Widget.Method()
  private async onSaveLoginConfig() {
    await customMutation('sysSetting.GlobalAppConfigProxy', 'saveLoginSetting', this.loginConfig as any);

    OioNotification.success(translateValueByKey('成功'), translateValueByKey('发布成功'));

    const { loginLayoutType, loginBackground, loginPageLogo } = await OioProvider.refreshSystemMajorConfig();

    OioProvider.setLoginTheme({
      name: loginLayoutType,
      backgroundImage: loginBackground,
      logo: loginPageLogo
    });
  }

  private async queryLoginConfig() {
    const rst = await this.http.mutate(
      'base',
      `{
        globalAppConfigProxyQuery {
          construct(data: {}) {
            id
            code
            loginPageLogo
            loginBackground
            loginLayoutType
          }
        }
      }
      `,
      {}
    );

    this.loginConfig = rst.data.globalAppConfigProxyQuery.construct || {};
  }

  protected async beforeCreated() {
    this.queryLoginConfig();
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    if (!this.$matched) {
      const { matched } = useMatched();
      this.$matched = matched;
    }
    if (!this.$router) {
      this.$router = useRouter().router as Router;
    }
  }
}
