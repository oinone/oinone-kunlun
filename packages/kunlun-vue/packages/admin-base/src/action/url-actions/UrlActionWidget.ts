import {
  ActiveRecord,
  FunctionCache,
  FunctionService,
  GetRequestModelFieldsOptions,
  ModelCache,
  RedirectTargetEnum,
  RequestModelField,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeFunctionDefinition,
  RuntimeUrlAction,
  StaticMetadata,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Expression } from '@oinone/kunlun-expression';
import { ActionType, ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioMessage, OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';

import { ActionWidget } from '../component';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: ActionType.URL
  })
)
export class UrlActionWidget extends ActionWidget<RuntimeUrlAction> {
  public initialize(config) {
    super.initialize(config);
    return this;
  }

  @Widget.Reactive()
  private get url() {
    return this.getDsl().url || this.action?.url || '#';
  }

  @Widget.Reactive()
  private get target(): ViewActionTarget {
    return this.getDsl().target || this.action?.target || ViewActionTarget.OpenWindow;
  }

  @Widget.Reactive()
  private get queryBody() {
    const va = this.action;
    const exp = Expression.getInstance();
    if (!va || !va.context) {
      return null;
    }
    const res: Record<string, unknown> = {};
    Object.keys(va.context || {}).forEach((name) => {
      exp.initExpressionContext(this.activeRecords, this.rootData?.[0], {}, '');
      try {
        const value = exp.exec(va.context![name] as string);
        if (value !== undefined) {
          res[name] = value;
        }
      } catch (e) {
        console.error(e);
      } finally {
        exp.cleanupExpressionContext();
      }
    });
    return res;
  }

  protected seekPopupMainRuntimeContext(): RuntimeContext {
    if (this.metadataHandle === this.rootHandle) {
      const modelModel = this.model.model;
      if (modelModel) {
        const popupMainRuntimeContext = RuntimeContextManager.getOthers(this.rootHandle)?.find(
          (v) => v.model.model === modelModel
        );
        if (popupMainRuntimeContext) {
          return popupMainRuntimeContext;
        }
      }
    }
    return this.rootRuntimeContext;
  }

  protected async getRequestModelFields(options?: GetRequestModelFieldsOptions): Promise<RequestModelField[]> {
    const { viewType } = this;
    if (viewType === ViewType.Tree) {
      const runtimeModel = await ModelCache.get(this.model.model);
      if (runtimeModel) {
        return runtimeModel.modelFields.map((field) => ({ field }));
      }
      return [];
    }
    if (this.popupScene) {
      return this.seekPopupMainRuntimeContext().getRequestModelFields(options);
    }
    return this.rootRuntimeContext.getRequestModelFields(options);
  }

  protected executeFunction<T>(
    functionDefinition: RuntimeFunctionDefinition,
    requestFields: RequestModelField[],
    activeRecords: ActiveRecord[] | undefined
  ): Promise<T> {
    const isMutil = functionDefinition.argumentList?.[0]?.multi;
    const preActiveRecords = this.mergeContext(activeRecords);
    const realRecords = isMutil ? preActiveRecords : preActiveRecords?.[0];
    return FunctionService.INSTANCE.simpleExecute(
      this.model,
      functionDefinition,
      {
        requestModels: [StaticMetadata.ResourceAddress],
        requestFields,
        variables: { path: this.action.sessionPath }
      },
      realRecords
    );
  }

  protected async getUrlByComputed(): Promise<string | undefined> {
    const { compute } = this.getDsl();
    const functionDefinition = await FunctionCache.get(this.action.model, compute);
    if (!functionDefinition) {
      console.error('无法获取可执行函数', this.action);
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('无法获取可执行函数'));
      return undefined;
    }
    const requestFields = await this.getRequestModelFields();
    return this.executeFunction(functionDefinition, requestFields, this.activeRecords);
  }

  protected getUrlByUrlAttr() {
    let { url } = this;
    if (this.queryBody) {
      const parameters = this.resolveQueryBody();
      if (parameters) {
        url = `${url}?${parameters}`;
      }
    }
    url = this.resolveDynamicDomain(url);
    url = encodeURI(decodeURI(url));
    return url;
  }

  protected getUrl(): ReturnPromise<string | undefined> {
    const { compute } = this.getDsl();
    if (compute) {
      return this.getUrlByComputed();
    }
    return this.getUrlByUrlAttr();
  }

  protected async clickAction() {
    const url = await this.getUrl();
    if (!url) {
      OioMessage.error(translateValueByKey('未设置正确的URL'));
      return;
    }
    this.executeAction(this.action, url);
  }

  protected executeAction(action: RuntimeUrlAction, url: string) {
    switch (this.target) {
      case ViewActionTarget.Router:
        window.open(url, RedirectTargetEnum.SELF);
        break;
      case ViewActionTarget.OpenWindow:
      case ViewActionTarget.Frame:
        window.open(url, RedirectTargetEnum.BLANK);
        break;
      default:
        throw new Error(`Invalid target type. value = ${this.target}`);
    }
  }

  private resolveQueryBody() {
    return Object.keys(this.queryBody!)
      .map((name) => {
        return `${name}=${this.queryBody![name]}`;
      })
      .join('&');
  }
}
