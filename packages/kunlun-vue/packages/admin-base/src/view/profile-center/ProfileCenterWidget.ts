import { SPI } from '@oinone/kunlun-spi';
import { Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { customMutation } from '@oinone/kunlun-service';
import { HttpClient } from '@oinone/kunlun-request';
import { PamirsUser, translateValueByKey } from '@oinone/kunlun-engine';
import { pamirsUserSymbol } from '@oinone/kunlun-vue-admin-layout';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { useRouter } from '@oinone/kunlun-vue-router';

import { BaseElementWidget } from '../../basic';

import ProfileCenter from './ProfileCenter.vue';

@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'ProfileCenterWidget' }))
export class ProfileCenterWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ProfileCenter);

    return this;
  }

  @Widget.SubContext(pamirsUserSymbol)
  private pamirsUser$!: WidgetSubjection<PamirsUser>;

  @Widget.Reactive()
  private pamirsUser: PamirsUser = {} as any;

  private http = HttpClient.getInstance();

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
  private async onSaveUser() {
    if (!this.pamirsUser.name) {
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('请输入名称'));

      return;
    }

    await customMutation('my.MyPamirsUserProxy', 'modifyUserInfo', this.pamirsUser as any);

    OioNotification.success(translateValueByKey('成功'), translateValueByKey('保存成功'));

    this.pamirsUser$.subject.next(this.pamirsUser);
  }

  private async queryUser() {
    const rst = await this.http.mutate<PamirsUser>(
      'user',
      `{
        myPamirsUserProxyQuery {
          construct(data: {}) {
            id
            name
            nickname
            realname
            id
            userType
            birthday
            gender
            phone
            idCard
            contactPhone
            contactEmail
            avatarBig {
              name
              id
              url
            }
            avatarUrl
            email
          }
        }
      }
      `,
      {}
    );

    this.pamirsUser = rst.data.myPamirsUserProxyQuery.construct;
  }

  protected async beforeCreated() {
    this.queryUser();
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
