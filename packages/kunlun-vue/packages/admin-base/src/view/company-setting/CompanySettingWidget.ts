import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { OioNotification } from '@kunlun/vue-ui-antd';
import { customMutation } from '@kunlun/service';
import { HttpClient } from '@kunlun/request';
import { OioProvider, translateValueByKey } from '@kunlun/engine';
import { Matched, Router, useMatched } from '@kunlun/router';
import { useRouter } from '@kunlun/vue-router';

import { BaseElementWidget } from '../../basic';

import CompanySetting from './CompanySetting.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'CompanySettingWidget' }))
export class CompanySettingWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(CompanySetting);

    return this;
  }

  private http = HttpClient.getInstance();

  @Widget.Reactive()
  private companySetting = {} as any;

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
  private async onSaveCompanySetting() {
    await customMutation('sysSetting.GlobalAppConfigProxy', 'saveCorporateImageSetting', this.companySetting as any);
    await OioProvider.refreshSystemMajorConfig();
    OioNotification.success(translateValueByKey('成功'), translateValueByKey('发布成功'));

    OioProvider.setBrowserConfig({
      favicon: this.companySetting.favicon
    });
  }

  private async queryCompanySetting() {
    const rst = await this.http.mutate(
      'base',
      `{
        globalAppConfigProxyQuery {
          construct(data: {}) {
            id
            code
            partnerName
            officialWebsite
            slogan
            icpDesc
            logo
            appSideLogo
            favicon
            browserTitle
          }
        }
      }
      `,
      {}
    );

    this.companySetting = rst.data.globalAppConfigProxyQuery.construct || {};
  }

  protected async beforeCreated() {
    this.queryCompanySetting();
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
