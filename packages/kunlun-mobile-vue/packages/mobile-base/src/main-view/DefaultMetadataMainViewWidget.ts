import { DslDefinition, XMLParse } from '@oinone/kunlun-dsl';
import {
  CurrentLanguage,
  initI18n,
  LanguageType,
  OioProvider,
  ReloadMainViewCallChainingParameters,
  ReloadMaskCallChainingParameters,
  ROOT_HANDLE,
  RuntimeViewAction,
  translateValueByKey,
  useLanguage,
  ViewActionCache,
  ViewActionQueryParameter
} from '@oinone/kunlun-engine';
import { IView, ViewActionTarget } from '@oinone/kunlun-meta';
import { isNotPermission, setSessionPath, useSessionPath } from '@oinone/kunlun-request';
import { useMatched } from '@oinone/kunlun-router';
import { CallChaining, debugConsole } from '@oinone/kunlun-shared';
import { distinctUntilChanged, Subscription } from '@oinone/kunlun-state';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { ViewSubSymbol, Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { nextTick } from 'vue';
import { ZH_CN_CODE } from '@oinone/kunlun-vue-ui-common';
import { OioNotification } from '@oinone/kunlun-vue-ui-mobile-vant';
import { MetadataViewWidget } from '../basic';
import { MaskManager } from '../spi';
import DefaultMetadataMainView from './DefaultMetadataMainView.vue';
import {
  emptyHomepageModelName,
  getUnauthorizedAction,
  unauthorizedActionName,
  replaceStanderMainView
} from '../layout/util/unauthorized-action';
import {
  maskTemplateEdit,
  getDefaultMaskTemplate,
  MenuService,
  ModuleService,
  RuntimeMenu,
  TopBarService,
  fetchBreadcrumbCurrentViewTitle
} from '../layout';
import { isMiniProgram } from '../util';

/**
 * <h3>元数据主视图</h3>
 * 该视图组件提供mask渲染以及首个元数据上下文初始化的处理逻辑
 * metadataHandle、rootHandle、parentHandle将从这里向下提供一个根节点，是整个视图渲染的起点
 * </p>
 * <p>
 * 该视图组件并不会提供除了渲染挂载以外的其他数据，比如model、module等信息将从MainViewWidget向下提供，这样处理将更能凸显MainViewWidget组件的通用性
 * </p>
 */
export class DefaultMetadataMainViewWidget extends MetadataViewWidget {
  protected matchedSub: Subscription | undefined;

  protected pairwiseRoutePage: {
    oldPage: ViewActionQueryParameter | undefined;
    newPage: ViewActionQueryParameter | undefined;
  } = {
    oldPage: undefined,
    newPage: undefined
  };

  @Widget.Reactive()
  @Widget.Provide()
  protected reloadMaskCallChaining = new CallChaining<void>();

  @Widget.Reactive()
  @Widget.Provide()
  protected reloadMainViewCallChaining = new CallChaining<void>();

  @Widget.Reactive()
  protected maskTemplate: DslDefinition | undefined;

  @Widget.Reactive()
  protected loading = true;

  protected currentRuntimeViewAction: RuntimeViewAction | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected mainViewLoading = false;

  @Widget.SubContext(ViewSubSymbol)
  protected view$!: WidgetSubjection<IView>;

  protected setMainViewLoading(loading: boolean) {
    this.mainViewLoading = loading;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMetadataMainView);
    this.metadataHandle = ROOT_HANDLE;
    this.rootHandle = ROOT_HANDLE;

    return this;
  }

  protected arePropertiesEqual<T extends object>(oldProp: T | string | undefined, newProp: T | string | undefined) {
    if (oldProp && newProp) {
      const old = typeof oldProp === 'string' ? oldProp : JSON.stringify(oldProp);
      const _new = typeof newProp === 'string' ? newProp : JSON.stringify(newProp);
      return old === _new;
    }

    return false;
  }

  /**
   * 监听路由变化
   *  1: 渲染mask
   *  2: 初始化上下文P
   */
  protected watchRoute() {
    let oldSegmentParams;
    this.matchedSub = useMatched()
      .getMatched$()
      .pipe(
        distinctUntilChanged((x, y) => {
          oldSegmentParams = x.segmentParams;

          return JSON.stringify(x.segmentParams) === JSON.stringify(y.segmentParams);
        })
      )
      .subscribe((matched) => {
        const { page } = matched.segmentParams;

        this.pairwiseRoutePage = {
          oldPage: oldSegmentParams?.page,
          newPage: page
        };

        if (!page) {
          return;
        }
        this.setMainViewLoading(true);
        this.reloadPage(oldSegmentParams?.page, page)
          .catch((e) => {
            console.error('reload page error.', e);
          })
          .finally(() => {
            this.loading = false;
            this.setMainViewLoading(false);
          });
      });
  }

  protected async reloadPage(
    oldPage: ViewActionQueryParameter | undefined,
    newPage: ViewActionQueryParameter
  ): Promise<void> {
    const { module: moduleName, model, action, target, path } = newPage;

    if (!moduleName) {
      throw new Error('Invalid module');
    }
    if (!model) {
      throw new Error('Invalid view action model');
    }
    if (!action) {
      throw new Error('Invalid view action name');
    }

    // fixme @zbh 20230410 国际化迁移
    await CurrentLanguage.refreshLocalStorage();
    if (OioProvider.getConfig().enableI18n !== false) {
      await initI18n(moduleName);
    }

    let runtimeViewAction: RuntimeViewAction;

    /**
     *  当前模块没有绑定首页，所以是不存在首页的模型
     */
    if (model === emptyHomepageModelName) {
      runtimeViewAction = getUnauthorizedAction({
        moduleName,
        model,
        target: ViewActionTarget.Router,
        title: '无首页',
        name: action
      });

      await ViewActionCache.set(runtimeViewAction);
    } else {
      /**
       * 查询action对应的页面，如果当前页面没有权限，就展示"无权限"的视图
       */
      try {
        runtimeViewAction = await this.fetchRuntimeViewAction(model, action, path);
      } catch (e) {
        if (isNotPermission(e)) {
          runtimeViewAction = getUnauthorizedAction({
            moduleName,
            model,
            target,
            name: action
          });

          await ViewActionCache.set(runtimeViewAction);
        } else {
          throw e;
        }
      }
    }

    if (!this.arePropertiesEqual(this.currentRuntimeViewAction, runtimeViewAction)) {
      await this.beforeRender(runtimeViewAction, oldPage, newPage);

      this.initRuntimeContext(runtimeViewAction);

      await this.renderMask(runtimeViewAction, oldPage, newPage);
      this.currentRuntimeViewAction = runtimeViewAction;
    }

    this.loading = false;

    return this.renderMainView(oldPage, newPage);
  }

  protected async fetchRuntimeViewAction(
    model: string,
    action: string | undefined,
    path: string | undefined
  ): Promise<RuntimeViewAction> {
    let runtimeViewAction = this.runtimeContext?.viewAction;
    if (model && action) {
      if (!runtimeViewAction || runtimeViewAction.model !== model || runtimeViewAction.name !== action) {
        runtimeViewAction = await useSessionPath(path, () => ViewActionCache.getOrThrow(model, action));
      }
    } else {
      runtimeViewAction = undefined;
    }
    if (!runtimeViewAction) {
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('页面初始化异常'));
      throw new Error('页面初始化异常');
    }
    setSessionPath(runtimeViewAction.sessionPath);
    return runtimeViewAction;
  }

  /**
   * 初始化运行时上下文
   * @param viewAction 跳转动作
   * @protected
   */
  protected initRuntimeContext(viewAction: RuntimeViewAction): { isInit: boolean; isRefresh: boolean } {
    if (!this.runtimeContext) {
      this.initContextByViewAction(viewAction);
      return {
        isInit: true,
        isRefresh: false
      };
    }
    const lastedViewAction = this.runtimeContext?.viewAction;
    if (!lastedViewAction || lastedViewAction.model !== viewAction.model || lastedViewAction.name !== viewAction.name) {
      this.initContextByViewAction(viewAction);
      return {
        isInit: false,
        isRefresh: true
      };
    }
    return {
      isInit: false,
      isRefresh: false
    };
  }

  /**
   * 渲染前
   * @param viewAction 跳转动作
   * @param oldPage 旧url参数
   * @param newPage 新url参数
   * @protected
   */
  protected async beforeRender(
    viewAction: RuntimeViewAction,
    oldPage: ViewActionQueryParameter | undefined,
    newPage: ViewActionQueryParameter
  ) {
    const { module: moduleName } = newPage;

    const moduleClassPrefix = `${DEFAULT_PREFIX}-module`;
    const moduleClass = `${moduleClassPrefix}-${moduleName}`;
    const classNameArr = document.body.className.split(' ').filter((a) => !a.includes(moduleClassPrefix));
    classNameArr.push(moduleClass);
    if (isMiniProgram()) {
      classNameArr.push(`${DEFAULT_PREFIX}-mini-program-platform`);
    }
    document.body.className = classNameArr.join(' ');

    const moduleDisplayName = viewAction.resModuleDefinition?.displayName || viewAction.moduleDefinition?.displayName;

    const menus = (await MenuService.queryMenus(moduleName)) as RuntimeMenu[];
    const treeNodes = MenuService.convert(menus);
    MenuService.sort(treeNodes);
    const selectedMenuItem = MenuService.findSelectedMenuItemByAction(treeNodes, viewAction.name);
    const title = selectedMenuItem?.value?.title || ModuleService.generatorViewTitle(viewAction);

    const titleArray: string[] = [];
    if (moduleDisplayName) {
      titleArray.push(translateValueByKey(moduleDisplayName));
    }
    if (title) {
      titleArray.push(translateValueByKey(title));
    }
    if (titleArray.length) {
      document.title = titleArray.join(' - ');
    }

    // MetadataMainViewLifecycle.notifyBeforeRender(viewAction, oldPage, newPage);
  }

  /**
   * 渲染mask
   * @param viewAction 跳转动作
   * @param oldPage 旧url参数
   * @param newPage 新url参数
   */
  public async renderMask(
    viewAction: RuntimeViewAction,
    oldPage: ViewActionQueryParameter | undefined,
    newPage: ViewActionQueryParameter
  ): Promise<void> {
    const { module: moduleName, model, action } = newPage;
    let maskTemplate: string = MaskManager.selector({
      module: viewAction.moduleDefinition?.module || viewAction.resModuleDefinition?.module,
      moduleName: viewAction.moduleDefinition?.name || viewAction.resModuleDefinition?.name || moduleName,
      model,
      actionName: action
    })!;
    if (!maskTemplate) {
      maskTemplate = viewAction.resMaskDefinition?.template as string;
      if (maskTemplate) {
        debugConsole.log('使用后端mask', maskTemplate);
      }
    }
    let finalMaskTemplate: DslDefinition;
    if (maskTemplate) {
      finalMaskTemplate = maskTemplateEdit({ isDefault: false }, XMLParse.INSTANCE.parse(maskTemplate));
    } else {
      finalMaskTemplate = getDefaultMaskTemplate();
    }

    /**
     * 当前用户没有该视图没有权限
     *
     * 但是用户自定义了当前页面的主内容区域mask，所以自定义的mask还是会被渲染出来的，需要将用户自定义的mask，改成`main-view`
     */
    if (viewAction.resView?.name === unauthorizedActionName) {
      finalMaskTemplate = replaceStanderMainView(finalMaskTemplate);
    }

    const preMaskTemplate = JSON.stringify(this.maskTemplate, (key, value) => {
      if (key === '__index') return undefined;
      return value;
    });

    if (!this.arePropertiesEqual(preMaskTemplate, finalMaskTemplate)) {
      this.maskTemplate = finalMaskTemplate;
    }

    // 为模块加上全局的class
    // const { initCurrentContext } = useCurrentContextService();
    // await initCurrentContext(moduleName, model);

    // 面包屑需要view信息，面包屑分类属于mask，渲染需要view的信息暂时放在这里
    this.view$?.subject.next({
      moduleDisplayName: viewAction.moduleDefinition?.displayName,
      title: fetchBreadcrumbCurrentViewTitle(viewAction)
    } as any);

    return nextTick(() => {
      const reloadMaskParameters: ReloadMaskCallChainingParameters = {
        module: moduleName,
        model,
        action,

        previousPage: oldPage,
        currentPage: newPage
      };
      this.reloadMaskCallChaining.call(reloadMaskParameters);
    });
  }

  /**
   * 渲染MainView
   * @param viewAction 跳转动作
   * @param oldPage 旧url参数
   * @param newPage 新url参数
   * @protected
   */
  protected async renderMainView(
    oldPage: ViewActionQueryParameter | undefined,
    newPage: ViewActionQueryParameter
  ): Promise<void> {
    return nextTick(() => {
      const { module: moduleName, model, action, viewType, target } = newPage;
      const reloadMainViewParameters: ReloadMainViewCallChainingParameters = {
        handle: this.currentHandle,
        module: moduleName,
        model,
        action,

        viewType,
        target,

        previousPage: oldPage,
        currentPage: newPage
      };
      return this.reloadMainViewCallChaining?.syncCall(reloadMainViewParameters);
    });
  }

  protected async $$mounted() {
    super.$$mounted();

    const lang = await TopBarService.getCurrentLang();
    const currentLanguageCode = lang?.code || ZH_CN_CODE;
    useLanguage(currentLanguageCode as LanguageType);
    this.watchRoute();
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.matchedSub?.unsubscribe();
  }
}
