import { createVNode } from 'vue';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { Modal } from 'ant-design-vue';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { initOioComponentTheme } from '@kunlun/theme';
import { HttpClient } from '@kunlun/request';
import { customMutation } from '@kunlun/service';
import { OioProvider, translateValueByKey } from '@kunlun/engine';
import { Matched, Router, useMatched } from '@kunlun/router';
import { useRouter } from '@kunlun/vue-router';

import { BaseElementWidget } from '../../basic';

import SystemStyle from './SystemStyle.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'SystemStyleWidget' }))
export class SystemStyleWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SystemStyle);

    return this;
  }

  private http = HttpClient.getInstance();

  @Widget.Reactive()
  private systemConfig = {};

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
  private async onSaveSystemConfig(mode, size) {
    await customMutation('sysSetting.GlobalAppConfigProxy', 'saveSysStyleSetting', this.systemConfig as any);

    Modal.confirm({
      wrapClassName: 'oio-modal',
      okText: translateValueByKey('确定'),
      cancelText: translateValueByKey('取消'),
      title: translateValueByKey('保存成功'),
      content: translateValueByKey('是否切换成对应的主题？'),
      icon: createVNode(CheckCircleOutlined, {
        style: {
          color: '#52c41a'
        }
      }),
      onOk: async () => {
        const systemConfig = await OioProvider.refreshSystemMajorConfig();
        initOioComponentTheme(systemConfig);
        OioProvider.setTheme([`${mode}-${size}`]);
      },
      onCancel() {}
    });
  }

  private async querySystemConfig() {
    const rst = await this.http.mutate(
      'base',
      `{
        globalAppConfigProxyQuery {
          construct(data: {}) {
            id
            code
            mode
            size
            extend 
            sideBarTheme {
              mode
              theme
            }
            multiTabTheme {
              inline
              theme
            }
          }
        }
      }
      `,
      {}
    );

    this.systemConfig = rst.data.globalAppConfigProxyQuery.construct || {};
  }

  protected async beforeCreated() {
    this.querySystemConfig();
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
