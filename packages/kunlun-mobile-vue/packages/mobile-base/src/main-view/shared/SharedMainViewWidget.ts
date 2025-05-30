import {
  CurrentLanguage,
  ReloadMainViewCallChainingParameters,
  RuntimeContext,
  RuntimeViewAction,
  SharedRuntimeViewAction,
  translateValueByKey,
  ViewActionCache,
  ViewActionQueryParameter
} from '@kunlun/engine';
import { MessageHub, setSessionPath } from '@kunlun/request';
import { useMatched } from '@kunlun/router';
import { CallChaining, uniqueKeyGenerator } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { ModuleService } from '../../layout';
import { RouterWidget } from '@kunlun/vue-router';
import { Widget } from '@kunlun/vue-widget';
import { nextTick } from 'vue';
import { MetadataViewWidget } from '../../basic';
import { MODULE_CLASS_PREFIX } from '../constants';
import { SHARED_VIEW_WIDGET } from './constants';
import { clearSharedSession, getSharedSession, setSharedSession } from './session';
import SharedMainView from './SharedMainView.vue';
import { SharedViewUtils } from './utils';

@SPI.ClassFactory(RouterWidget.Token({ widget: SHARED_VIEW_WIDGET }))
export class SharedMainViewWidget extends RouterWidget {
  protected metadataViewWidget: MetadataViewWidget | undefined;

  protected runtimeContext: RuntimeContext | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected reloadMainViewCallChaining = new CallChaining<void>();

  @Widget.Reactive()
  protected loading = true;

  @Widget.Reactive()
  protected metadataHandle: string | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(SharedMainView);
    if (!this.metadataViewWidget) {
      this.metadataViewWidget = this.createMetadataViewWidget();
      this.metadataHandle = this.metadataViewWidget.getHandle();
    }
    return this;
  }

  protected createMetadataViewWidget(): MetadataViewWidget {
    const handle = uniqueKeyGenerator();
    return this.createWidget(new MetadataViewWidget(), undefined, {
      metadataHandle: handle,
      rootHandle: handle,
      internal: true,
      automatic: true
    });
  }

  protected async mounted() {
    const page = SharedViewUtils.getPageParameters();
    const sharedCode = page?.code;
    if (!sharedCode) {
      MessageHub.error(translateValueByKey('无效的分享码'));
      return;
    }
    this.reloadPage(sharedCode).finally(() => {
      this.loading = false;
    });
  }

  protected async reloadPage(sharedCode: string): Promise<void> {
    const data = await this.fetchSharedRuntimeViewAction(sharedCode);
    if (!data) {
      MessageHub.error(translateValueByKey('分享的页面不存在'));
      return;
    }
    const { action, page } = data;

    this.beforeRender(action);
    this.initView(action);

    this.loading = false;

    await this.renderMainView(page);
  }

  protected async fetchSharedRuntimeViewAction(
    sharedCode: string
  ): Promise<{ action: SharedRuntimeViewAction; page: ViewActionQueryParameter } | undefined> {
    const sharedViewAction = await ViewActionCache.getSharedAction(sharedCode);
    if (!sharedViewAction) {
      clearSharedSession();
      return;
    }
    const { authorizationCode, sharedParameters, sessionPath } = sharedViewAction;
    const page = (sharedParameters || {}) as ViewActionQueryParameter;
    setSessionPath(sessionPath);
    setSharedSession({
      sharedCode,
      authorizationCode,
      page
    });
    const { matched } = useMatched();
    matched.segmentParams = {
      page
    };
    return {
      action: sharedViewAction,
      page
    };
  }

  protected beforeRender(action: SharedRuntimeViewAction) {
    const { browserTitle, language, languageIsoCode } = action;
    if (language && languageIsoCode) {
      CurrentLanguage.refreshSessionStorage(language, languageIsoCode);
    }
    const moduleName = getSharedSession()?.page?.module;
    document.body.className = `${MODULE_CLASS_PREFIX} ${MODULE_CLASS_PREFIX}-${moduleName}`;
    document.title = browserTitle || ModuleService.generatorViewTitle(action);
  }

  protected initView(action: SharedRuntimeViewAction) {
    const runtimeViewAction: RuntimeViewAction = { ...action };
    // const { filter, domain } = action;
    // if (filter) {
    //   runtimeViewAction.filter = resolveDynamicDomain(
    //     filter,
    //     this.activeRecords?.[0] || {},
    //     this.rootData?.[0] || {},
    //     this.parentOpenerDataSource?.[0] || {}
    //   );
    // }
    // if (domain) {
    //   runtimeViewAction.domain = resolveDynamicDomain(
    //     domain,
    //     this.activeRecords?.[0] || {},
    //     this.rootData?.[0] || {},
    //     this.parentOpenerDataSource?.[0] || {}
    //   );
    // }
    this.runtimeContext = this.metadataViewWidget?.initContextByViewAction(runtimeViewAction);
  }

  protected renderMainView(page: ViewActionQueryParameter) {
    return nextTick(() => {
      const { module: moduleName, model, action, viewType, target } = page;
      const reloadMainViewParameters: ReloadMainViewCallChainingParameters = {
        handle: this.metadataHandle!,
        module: moduleName,
        model,
        action,

        viewType,
        target,

        currentPage: page
      };
      return this.reloadMainViewCallChaining?.syncCall(reloadMainViewParameters);
    });
  }
}
