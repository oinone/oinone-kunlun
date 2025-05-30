import {
  baseActionTokenSymbol,
  ClearCache,
  executeServerAction,
  executeUrlAction,
  executeViewAction,
  getDefaultBrowser,
  isRuntimeClientAction,
  isRuntimeServerAction,
  isRuntimeUrlAction,
  isRuntimeViewAction,
  MultiTabsRuntimeManifestMergedConfigManager,
  OioProvider,
  PamirsUser,
  ReloadMaskCallChainingParameters,
  RuntimeAction,
  ServerActionCache,
  UrlActionCache,
  UserInfo,
  ViewActionCache
} from '@kunlun/engine';
import { GlobalConfig, IURLAction, ViewActionTarget } from '@kunlun/meta';
import { setSessionPath, useSessionPath } from '@kunlun/request';
import { Matched, Router, useMatched } from '@kunlun/router';
import { SPI, SPIOperator } from '@kunlun/spi';
import { useRouter } from '@kunlun/vue-router';
import { Widget, WidgetSubjection } from '@kunlun/vue-widget';
import { MaskWidget } from '../../basic';
import { TopBarService } from '../../service';
import { pamirsUserSymbol } from '../../typing';
import DefaultUser from './DefaultUser.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'user' }))
export class UserWidget extends MaskWidget {
  protected router!: Router;

  protected matched!: Matched;

  @Widget.SubContext(pamirsUserSymbol)
  private pamirsUser$!: WidgetSubjection<PamirsUser>;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultUser);
    return this;
  }

  @Widget.Reactive()
  protected userInfo: UserInfo | undefined;

  @Widget.Method()
  public async executeAction(action: RuntimeAction) {
    const { model, name } = action;

    if (isRuntimeViewAction(action)) {
      const viewAction = await useSessionPath(action.sessionPath, () => ViewActionCache.get(model, name));
      if (viewAction) {
        if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled() && viewAction.target === ViewActionTarget.Router) {
          viewAction.target = ViewActionTarget.OpenWindow;
        }
        executeViewAction(viewAction, this.router, this.matched);
      }
    } else if (isRuntimeServerAction(action)) {
      const serverAction = await useSessionPath(action.sessionPath, () => ServerActionCache.get(model, name));
      if (serverAction) {
        await executeServerAction(serverAction, {});
      }
      if (name === 'logout') {
        this.logout();
      }
    } else if (isRuntimeUrlAction(action)) {
      const urlAction = await useSessionPath(action.sessionPath, () => UrlActionCache.get(model, name));
      await executeUrlAction(urlAction as unknown as IURLAction);
    } else if (isRuntimeClientAction(action)) {
      const actionOptions = {
        actionType: action.actionType,
        model: action.model,
        name: action.fun,
        widget: action.widget
      };

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const Widget = SPIOperator.selector(baseActionTokenSymbol, actionOptions) as any;
      const actionWidget = new Widget();
      actionWidget.initialize({ action });
      await actionWidget.click();
    }
  }

  public logout() {
    const loginPath = GlobalConfig.getConfigByName('login') as string;
    let url = loginPath;
    if (loginPath.startsWith('/')) {
      url = loginPath.slice(1);
    }
    OioProvider.setBrowserConfig(getDefaultBrowser());
    setSessionPath(undefined);
    ClearCache.clear();
    this.router.push({ segments: [{ path: url }] });
    OioProvider.refreshSystemMajorConfig();
  }

  protected fetchUserInfo(): Promise<UserInfo> {
    return TopBarService.getUserInfo();
  }

  protected async initUserInfo(): Promise<void> {
    if (!this.userInfo) {
      const data = await this.fetchUserInfo();
      this.userInfo = data;
    }
  }

  protected reloadMaskProcess(reloadParameters: ReloadMaskCallChainingParameters) {
    return this.initUserInfo();
  }

  protected $$mounted() {
    super.$$mounted();
    this.matched = useMatched().matched;
    this.router = useRouter().router;

    this.pamirsUser$.subscribe((v) => {
      if (v && Object.keys(v).length) {
        this.userInfo!.pamirsUser = JSON.parse(JSON.stringify(v));
      }
    });
  }
}
