import { translateValueByKey } from '@oinone/kunlun-engine';
import { UrlHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { RouterWidget } from '@oinone/kunlun-vue-router';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseLoginWidget } from './BaseLoginWidget';
import SSOLogin from './SSOLogin.vue';

@SPI.ClassFactory(
  RouterWidget.Token({
    widget: 'sso-login'
  })
)
export class SSOLoginWidget extends BaseLoginWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SSOLogin);
    return this;
  }

  protected get keyMapping(): Record<string, string> {
    return {
      login: 'username',
      client_id: 'clientId',
      redirect_uri: 'redirectUri'
    };
  }

  protected mappingForKey(key: string): string {
    return this.keyMapping[key] || key;
  }

  @Widget.Reactive()
  protected get loginMethod(): string {
    return 'POST';
  }

  @Widget.Reactive()
  protected get loginUrl() {
    return UrlHelper.appendBasePath('/pamirs/sso/login');
  }

  @Widget.Method()
  public async login() {
    const rst = await this.beforeClick();
    if (!rst) {
      return;
    }

    const { login, password } = this.authForm;
    if (!login || !password) {
      this.error.login = login ? '' : translateValueByKey(this.errorMessages.loginEmpty);
      this.error.password = password ? '' : translateValueByKey(this.errorMessages.passwordEmpty);
      return;
    }

    const formData: Record<string, string> = {};
    formData[this.mappingForKey('login')] = login;
    formData[this.mappingForKey('password')] = password;
    Object.entries(this.getUrlParameters()).forEach(([key, value]) => {
      if (key === 'error') {
        return;
      }
      formData[this.mappingForKey(key)] = value;
    });
    this.submitLoginFormData(formData);
  }

  protected submitLoginFormData(formData: Record<string, string>) {
    // 1. 创建 form 元素
    const form = document.createElement('form');
    form.action = this.loginUrl; // 提交的目标地址（服务端可能返回 302 重定向）
    form.method = this.loginMethod; // 提交方法（POST/GET）
    form.style.display = 'none'; // 隐藏表单

    // 2. 添加表单数据（键值对）
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.name = key; // 字段名
      input.value = value; // 字段值
      form.appendChild(input);
    });

    // 3. 将表单添加到页面并提交
    document.body.appendChild(form);
    form.submit(); // 触发提交，浏览器会自动处理 302 重定向

    // 4. 清理（可选，提交后页面会跳转，可能无需清理）
    document.body.removeChild(form);
  }

  protected getUrlParameters(): Record<string, string> {
    return this.matched?.segmentParams['sso-login'] || {};
  }

  protected async beforeMount() {
    await super.beforeMount();
    const { error } = this.getUrlParameters();
    if (error) {
      this.error.password = error;
    }
  }
}
