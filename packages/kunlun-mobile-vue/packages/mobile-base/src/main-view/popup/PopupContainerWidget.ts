import {
  computeViewMode,
  IPopupInstance,
  IPopupManager,
  IPopupWidget,
  PopupManager,
  ROOT_HANDLE,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeView,
  RuntimeViewAction,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { ActionContextType, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { debugConsole, ReturnPromise, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { OioNotification } from '@oinone/kunlun-vue-ui-mobile-vant';
import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import { createPopupDslDefinition, PopupDslDefinition, seekPopupDslDefinition } from '../../action';
import { MetadataViewWidget } from '../../basic';
import { createRuntimeContextByView, createRuntimeContextByViewAction } from '../../tags';
import { PopupScene } from '../../typing';

export interface PopupInfo {
  key: string;

  instance: IPopupInstance;

  popupDslDefinition?: PopupDslDefinition | null;

  runtimeContext?: RuntimeContext;

  metadataWidget?: MetadataViewWidget;
}

export abstract class PopupContainerWidget extends VueWidget {
  protected popupInfos: PopupInfo[] = [];

  protected abstract getPopupScene(): PopupScene | string;

  protected abstract createPopupWidget(popupInfo: PopupInfo): ReturnPromise<IPopupWidget | undefined>;

  protected createInitialPopupWidget(widget: IPopupWidget): ReturnPromise<IPopupWidget | undefined> {
    return this.createWidget(widget as unknown as VueWidget) as unknown as IPopupWidget;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get popupScene(): string {
    return this.getPopupScene();
  }

  protected async generatorPopupWidget(popupInfo: PopupInfo) {
    const { action, widget } = popupInfo.instance.initialConfig;
    let popupWidget: IPopupWidget | undefined;
    if (widget) {
      popupWidget = await this.createInitialPopupWidget(widget);
    } else if (action) {
      debugConsole.group(`open popup by function call:${action.model}:${action.name}`);
      debugConsole.log('action', action);
      const popupDslDefinition = await this.initPopupDslDefinition(popupInfo);
      if (!popupDslDefinition) {
        return;
      }
      popupInfo.metadataWidget?.dispose();
      popupInfo.metadataWidget = undefined;
      RuntimeContextManager.delete(popupInfo.runtimeContext?.handle, true);

      const runtimeContext = this.initPopupRuntimeContext(popupInfo);
      popupInfo.runtimeContext = runtimeContext;
      popupInfo.metadataWidget = this.initPopupMetadataWidget(runtimeContext);
      popupWidget = await this.createPopupWidget(popupInfo);
      debugConsole.groupEnd();
    }
    if (popupWidget) {
      popupInfo.instance.widget = popupWidget;
      this.forceUpdate();
    } else {
      popupInfo.instance.widget = null;
    }
  }

  protected async initPopupDslDefinition(popupInfo: PopupInfo): Promise<PopupDslDefinition | undefined> {
    const { instance } = popupInfo;
    let { popupDslDefinition } = popupInfo;
    const { popupViewDslNode, currentViewDslNode } = seekPopupDslDefinition(
      popupInfo.instance.initialConfig.action?.template
    );
    if (popupDslDefinition === undefined) {
      popupDslDefinition = await createPopupDslDefinition(
        popupViewDslNode,
        currentViewDslNode,
        instance.initialConfig.action!
      );
      if (!popupDslDefinition) {
        popupDslDefinition = null;
      }
      popupInfo.popupDslDefinition = popupDslDefinition;
    }
    if (!popupDslDefinition) {
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('未配置弹出层视图'));
      return undefined;
    }
    return popupDslDefinition;
  }

  protected initPopupRuntimeContext(popupInfo: PopupInfo): RuntimeContext {
    const { viewType, resModel, resModelName, resModule, resModuleName, viewDslNode, dslDefinition } =
      popupInfo.popupDslDefinition!;
    const { action, extra = {} } = popupInfo.instance.initialConfig;
    const resView: RuntimeView = {
      type: viewType,
      model: resModel,
      modelName: resModelName,
      module: resModule,
      moduleName: resModuleName,
      dsl: viewDslNode,
      template: dslDefinition,
      context: action?.context
    };
    const extraKeys = Object.keys(extra);
    if (extraKeys.length) {
      resView.initialValue = [extra];
    }

    if (action) {
      const runtimeViewAction: RuntimeViewAction = {
        ...action,
        resViewType: viewType,
        resModel,
        resModelName,
        resModule,
        resModuleName,
        resViewMode: this.computeViewMode(viewType, action),
        resView
      };
      const runtimeContext = createRuntimeContextByViewAction(
        runtimeViewAction,
        true,
        uniqueKeyGenerator(),
        ROOT_HANDLE
      );
      if (runtimeContext) {
        return runtimeContext;
      }
    }
    return createRuntimeContextByView(resView, true, uniqueKeyGenerator(), ROOT_HANDLE);
  }

  protected computeViewMode(viewType: ViewType, action: RuntimeViewAction): ViewMode {
    return computeViewMode(viewType, ActionContextType.ContextFree);
  }

  protected initPopupMetadataWidget(runtimeContext: RuntimeContext): MetadataViewWidget {
    const { handle } = runtimeContext;
    return this.createWidget(new MetadataViewWidget(handle), undefined, {
      metadataHandle: handle,
      rootHandle: handle,
      internal: true,
      isVirtual: true,
      inline: true
    });
  }

  protected onOpen = async (manager: IPopupManager, instance: IPopupInstance) => {
    const { type, widget, initialConfig } = instance;
    const { widget: initialWidget, action } = initialConfig;
    if (widget || type !== this.popupScene || (!initialWidget && !action)) {
      return;
    }
    if (widget === null) {
      return;
    }
    let popupInfo = this.findPopupInfo(instance)?.popupInfo;
    if (!popupInfo) {
      popupInfo = {
        key: instance.key,
        instance
      };
      this.popupInfos.push(popupInfo);
    }
    await this.generatorPopupWidget(popupInfo);
  };

  protected onDispose = (manager: IPopupManager, instance: IPopupInstance) => {
    const target = this.findPopupInfo(instance);
    if (target) {
      const { popupInfo, index } = target;
      popupInfo.metadataWidget?.dispose();
      this.popupInfos.splice(index, 1);
    }
  };

  protected findPopupInfo(instance: IPopupInstance): { popupInfo: PopupInfo; index: number } | undefined {
    const { key } = instance;
    const { length } = this.popupInfos;
    for (let index = 0; index < length; index++) {
      const popupInfo = this.popupInfos[index];
      if (popupInfo.key === key) {
        return {
          popupInfo,
          index
        };
      }
    }
  }

  protected $$mounted() {
    super.$$mounted();
    PopupManager.INSTANCE.onOpen(this.onOpen.bind(this));
    PopupManager.INSTANCE.onDispose(this.onDispose.bind(this));
  }

  protected $$unmounted() {
    super.$$unmounted();
    PopupManager.INSTANCE.clearOnOpen(this.onOpen);
    PopupManager.INSTANCE.clearOnDispose(this.onDispose);
  }
}
