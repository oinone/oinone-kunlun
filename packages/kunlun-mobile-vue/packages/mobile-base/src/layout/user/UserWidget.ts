import { VueWidget, Widget, WidgetBehaviorSubjection } from '@oinone/kunlun-vue-widget';
import { GlobalConfig } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import {
  executeServerAction,
  executeViewAction,
  OioProvider,
  UserInfo,
  translateValueByKey,
  ViewActionCache,
  RuntimeAction,
  isRuntimeViewAction,
  ServerActionCache
} from '@oinone/kunlun-engine';
import { useRouter } from '@oinone/kunlun-vue-router';
import { notification } from '@oinone/kunlun-vue-ui-mobile-vant';
import { get as getValue } from 'lodash-es';
import { setSessionPath, useSessionPath } from '@oinone/kunlun-request';
import { GlobalStateSubSymbol, IGlobalState } from '../type';
import UserComponent from './User.vue';

import { TopBarService } from '../service';
import { MobileMaskWidget } from '../basic';

@SPI.ClassFactory(
  MobileMaskWidget.Token({
    widget: 'user'
  })
)
export class UserWidget extends MobileMaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(UserComponent);
    return this;
  }

  @Widget.BehaviorSubContext(GlobalStateSubSymbol, {})
  protected globalState!: WidgetBehaviorSubjection<IGlobalState>;

  protected router!: Router;

  @VueWidget.Reactive()
  protected userInfo: UserInfo | undefined;

  @VueWidget.Method()
  public async executeAction(action: RuntimeAction) {
    const { model, name } = action;
    if (action.name === 'modify_pwd_view_action') {
      const userType = getValue(this, 'userInfo.pamirsUser.userType');
      if (userType === 'TENANT') {
        notification.info(translateValueByKey('提示'), translateValueByKey('请前往官网修改密码!'));
        return;
      }
    }

    if (isRuntimeViewAction(action)) {
      const viewAction = await useSessionPath(action.sessionPath, () => ViewActionCache.get(model, name));
      executeViewAction(viewAction as any, this.router as any, this.mached, {});
    }

    if (action?.name === 'logout') {
      const serverAction = await useSessionPath(action.sessionPath, () => ServerActionCache.get(model, name));
      if (serverAction) {
        await executeServerAction(serverAction, {});
      }
      this.logout();
    }
  }

  public logout() {
    const loginPath = GlobalConfig.getConfigByName('login') as string;
    let url = loginPath;
    if (loginPath.startsWith('/')) {
      url = loginPath.slice(1);
    }
    OioProvider.setBrowserConfig();
    setSessionPath(undefined);
    this.router.push({ segments: [{ path: url }] });
  }

  protected async beforeCreated() {
    this.router = useRouter().router;
    const data = await TopBarService.getUserInfo();
    this.userInfo = data;
    const value = this.globalState.subject.getValue();
    value.user = data;
    this.globalState.subject.next(value);
  }

  protected mounted() {
    const matched$ = useMatched().getMatched$();
    matched$?.subscribe({
      next: (newMached) => {
        this.mached = newMached;
      }
    });
  }

  protected mached?: Matched;
}
