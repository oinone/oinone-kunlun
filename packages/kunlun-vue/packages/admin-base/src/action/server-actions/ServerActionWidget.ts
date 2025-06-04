import {
  ActiveRecords,
  Dialog,
  Drawer,
  executeViewAction,
  FunctionCache,
  FunctionService,
  GetRequestModelFieldsOptions,
  ModelCache,
  MultiTabsManager,
  RelationUpdateType,
  RequestModelField,
  ROOT_HANDLE,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeFunctionDefinition,
  RuntimeServerAction,
  RuntimeViewAction,
  StaticMetadata,
  SubmitRelationValue,
  SubmitValue,
  translateValueByKey,
  UpdateOneWithRelationsService
} from '@oinone/kunlun-engine';
import { ActionContextType, ActionType, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { HttpClientError, SystemErrorCode } from '@oinone/kunlun-request';
import { SPI } from '@oinone/kunlun-spi';
import { BooleanHelper, CallChaining, debugConsole, OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { VueWidget, Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { isBoolean, isFunction, isNil } from 'lodash-es';
import { FormValidateResult } from '../../basic';
import { REFRESH_FORM_DATA } from '../../basic/constant/state-stream';
import { ClickResult, PopupSubmitFunction } from '../../typing';
import { gotoPrevPage } from '../../util';
import { ActionWidget } from '../component';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: ActionType.Server
  })
)
export class ServerActionWidget extends ActionWidget<RuntimeServerAction> {
  protected updateActionName = 'update';

  protected updateOneWithRelationName = 'updateOneWithRelations';

  @Widget.Method()
  @Widget.Inject()
  protected onSubmit: PopupSubmitFunction | undefined;

  @Widget.SubContext(REFRESH_FORM_DATA)
  protected reloadFormData$!: WidgetSubjection<boolean>;

  @Widget.Reactive()
  protected get updateData(): boolean {
    let updateData = BooleanHelper.toBoolean(this.getDsl().updateData);
    if (isNil(updateData)) {
      updateData = false;
    }
    return updateData;
  }

  @Widget.Reactive()
  protected get submitData(): boolean {
    let submitData = BooleanHelper.toBoolean(this.getDsl().submitData);
    if (isNil(submitData)) {
      submitData = false;
    }
    return submitData;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected formValidateCallChaining: CallChaining<FormValidateResult[]> | undefined;

  protected async clickAction(): Promise<ClickResult> {
    const { action } = this;
    if (!action) {
      console.error('无法处理没有运行时动作的点击动作');
      return;
    }
    debugConsole.group(`Click serverAction. ${action.model}:${action.name}`);
    const submitValue = await this.submit(action);
    try {
      return await this.executeAction(action, submitValue);
    } catch (e) {
      console.error(e);

      this.formValidateProcess(e as HttpClientError);

      const { forceRefreshWhenError = false } = this.getDsl();
      if (forceRefreshWhenError) {
        this.refreshCallChaining?.syncCall();
      }

      return false;
    } finally {
      debugConsole.groupEnd();
    }
  }

  protected formValidateProcess(e: HttpClientError) {
    if (this.view?.type !== ViewType.Form) {
      return;
    }
    const { formValidateCallChaining } = this;
    if (formValidateCallChaining) {
      const results: FormValidateResult[] = this.convertFormValidateResults(e);
      if (results.length) {
        formValidateCallChaining.syncCall(results);
      }
    }
  }

  protected convertFormValidateResults(e: HttpClientError): FormValidateResult[] {
    const error = e.errors?.[0];
    if (!error) {
      return [];
    }
    if (error.extensions?.errorCode !== SystemErrorCode.FORM_VALIDATE_ERROR) {
      return [];
    }
    const results: FormValidateResult[] = [];
    for (const messageItem of error.extensions?.messages || []) {
      const { level, field, path, message } = messageItem;
      let resultPath: string;
      if ((path?.length || 0) >= 4) {
        resultPath = path!.splice(3).join('.');
      } else if (field) {
        resultPath = field;
      } else {
        console.error(messageItem);
        continue;
      }
      results.push({
        level,
        message,
        path: resultPath
      });
    }
    return results;
  }

  protected async submit(action: RuntimeServerAction): Promise<SubmitValue> {
    let records: ActiveRecords | undefined;
    let relationRecords: SubmitRelationValue[] | undefined;
    if (!this.inline && this.submitCallChaining) {
      debugConsole.run(() => {
        if ([ViewType.Detail, ViewType.Form].includes(this.viewType!)) {
          debugConsole.log('formData in view:', this.activeRecords?.[0]);
        }
      });
      const callResult = await this.submitCallChaining?.syncCall();
      if (callResult != null) {
        records = callResult.records;
        relationRecords = callResult.relationRecords;
      }
    }
    if (records == null) {
      records = this.activeRecords || [];
    }
    if (action.contextType === ActionContextType.Batch || action.contextType === ActionContextType.SingleAndBatch) {
      // do nothing.
    } else if (action.contextType === ActionContextType.Single) {
      if (Array.isArray(records)) {
        [records] = records;
      }
    } else {
      const ttype = action.functionDefinition?.argumentList?.[0]?.ttype;
      if (ttype && [ModelFieldType.ManyToOne, ModelFieldType.OneToOne].includes(ttype as ModelFieldType)) {
        if (Array.isArray(records)) {
          [records] = records;
        }
      }
    }
    if (!records) {
      if (action.contextType !== ActionContextType.ContextFree) {
        const name = this.action?.displayName || this.action?.label;
        throw new Error(`${name} action not params`);
      }
      records = {};
    }
    return new SubmitValue(records, relationRecords);
  }

  protected async clickActionAfter(result: ClickResult): Promise<ClickResult> {
    let refreshParent = false;
    if (this.isDialog) {
      if (this.closeDialog || this.closeAllDialog) {
        refreshParent = true;
        await this.clickActionAfterRefreshData(result, refreshParent);
        this.closeAllDialog ? Dialog.disposeAll() : Dialog.dispose(this.action);
        return result;
      } else if (this.goBack) {
        // eslint-disable-next-line no-restricted-globals
        this.historyBack();
        return result;
      }
    } else if (this.isDrawer) {
      if (this.closeDrawer || this.closeAllDrawer) {
        refreshParent = true;
        await this.clickActionAfterRefreshData(result, refreshParent);
        this.closeAllDrawer ? Drawer.disposeAll() : Drawer.dispose(this.action);
        return result;
      } else if (this.goBack) {
        // eslint-disable-next-line no-restricted-globals
        this.historyBack();
        return result;
      }
    } else if (this.goBack) {
      // eslint-disable-next-line no-restricted-globals
      this.historyBack();
      return result;
    }
    return this.clickActionAfterRefreshData(result, refreshParent);
  }

  protected async clickActionAfterRefreshData(result: ClickResult, refreshParent = false): Promise<ClickResult> {
    if (this.submitData) {
      const submitResult = await this.executeSubmitData(result);
      if (submitResult != null) {
        return submitResult;
      }
    }
    if (this.refreshRoot) {
      this.executeRefreshRoot();
    } else if (this.refreshData) {
      this.executeRefreshData(refreshParent);
    } else if (this.updateData) {
      // fixme @zbh 20230407 废弃功能（更新当前视图），需迁移到executeSubmitData方法中
      if (result && !isBoolean(result)) {
        this.reloadDataSource(result);
        this.reloadActiveRecords(result);
        this.reloadFormData$?.subject.next(true);
      }
    }
    return result;
  }

  protected executeRefreshRoot() {
    const targetRuntimeContext = this.findRefreshRootRuntimeContext();
    const currentTab = MultiTabsManager.INSTANCE.getActiveTab();
    if (currentTab) {
      MultiTabsManager.INSTANCE.refresh(currentTab.key);
      return;
    }
    // TODO 关闭多tab时 查询方式 暂不可用
    // if (targetRuntimeContext?.handle === ROOT_HANDLE) {
    //   const currentMetadataHandle = this.getMetadataHandle();
    //   const mainMetadataWidget = targetRuntimeContext.childrenContext.filter(
    //     (v) => currentMetadataHandle !== v.handle
    //   )?.[0];
    //   if (mainMetadataWidget) {
    //     const targetWidget = (Widget.select(mainMetadataWidget.handle) as VueWidget).getOperator<
    //       VueWidget & { reloadMainViewCallChaining?: CallChaining }
    //     >();
    //     if (targetWidget) {
    //       targetWidget.reloadMainViewCallChaining?.syncCall();
    //       return;
    //     }
    //   }
    // }
    if (targetRuntimeContext) {
      const targetWidget = (Widget.select(targetRuntimeContext.handle) as VueWidget).getOperator<
        VueWidget & { refreshCallChaining?: CallChaining }
      >();
      if (targetWidget) {
        targetWidget.refreshCallChaining?.syncCall();
      }
    }
  }

  protected findRefreshRootRuntimeContext(): RuntimeContext | undefined {
    let targetRuntimeContext: RuntimeContext | undefined = this.rootRuntimeContext;
    while (targetRuntimeContext) {
      const parentRuntimeContext = targetRuntimeContext.parentContext;
      const nextFieldRuntimeContext = parentRuntimeContext?.parentContext;

      if (!nextFieldRuntimeContext || nextFieldRuntimeContext.handle === ROOT_HANDLE) {
        targetRuntimeContext = parentRuntimeContext;
        break;
      }

      if (!parentRuntimeContext || parentRuntimeContext.handle === ROOT_HANDLE) {
        break;
      }

      if (parentRuntimeContext.field) {
        targetRuntimeContext = parentRuntimeContext;
        continue;
      }

      if (nextFieldRuntimeContext.field) {
        targetRuntimeContext = nextFieldRuntimeContext;
      } else {
        targetRuntimeContext = parentRuntimeContext;
        break;
      }
    }
    return targetRuntimeContext;
  }

  protected executeRefreshData(refreshParent: boolean) {
    this.refreshCallChaining?.syncCall(refreshParent);
  }

  protected async executeSubmitData(result: ClickResult): Promise<ClickResult> {
    if (result == null || isBoolean(result)) {
      return result;
    }
    if (this.metadataRuntimeContext.handle === this.rootRuntimeContext.handle) {
      if (isFunction(this.onSubmit)) {
        const clickResult = await this.onSubmit({
          parameters: {
            showRecords: Array.isArray(result) ? result : [result],
            submitRecords: result
          },
          mapping: this.action.mapping,
          action: this.action
        });
        return clickResult;
      }
    }
  }

  protected historyBack() {
    gotoPrevPage(
      this.action,
      (action: RuntimeViewAction) => executeViewAction(action, this.$router, this.$matched),
      this.$router?.navigate
    );
  }

  protected usingDiffUpdate(parameters: SubmitValue): boolean {
    const { relationUpdateType } = this;
    if (relationUpdateType && [RelationUpdateType.diff, RelationUpdateType.batch].includes(relationUpdateType)) {
      return true;
    }
    return !!parameters.relationRecords.length;
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

  protected async executeAction(action: RuntimeServerAction, submitValue: SubmitValue): Promise<ClickResult> {
    if (
      (this.updateOneWithRelationName === action.fun || this.updateActionName === action.name) &&
      this.usingDiffUpdate(submitValue)
    ) {
      const requestFields = await this.getRequestModelFields();
      return this.executeRelationUpdate(requestFields, submitValue);
    }
    let { functionDefinition } = action;
    const { model, fun } = action;
    if (!functionDefinition && fun) {
      functionDefinition = await FunctionCache.get(model, fun);
    }
    if (!functionDefinition) {
      console.error('无法获取可执行函数', action);
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('无法获取可执行函数'));
      return false;
    }
    const requestFields = await this.getRequestModelFields();
    return this.executeFunction(functionDefinition, requestFields, submitValue.records);
  }

  protected executeFunction<T>(
    functionDefinition: RuntimeFunctionDefinition,
    requestFields: RequestModelField[],
    activeRecords: ActiveRecords | undefined
  ): Promise<T> {
    activeRecords = this.mergeContext(activeRecords);
    return FunctionService.INSTANCE.simpleExecute(
      this.model,
      functionDefinition,
      {
        requestModels: [StaticMetadata.ResourceAddress],
        requestFields,
        variables: this.rootRuntimeContext.generatorVariables({ path: this.action.sessionPath })
      },
      activeRecords
    );
  }

  protected executeRelationUpdate<T>(requestFields: RequestModelField[], submitValue: SubmitValue): Promise<T> {
    return UpdateOneWithRelationsService.execute(this.model, submitValue, {
      requestModels: [StaticMetadata.ResourceAddress],
      requestFields,
      variables: this.rootRuntimeContext.generatorVariables({ path: this.action.sessionPath })
    });
  }
}
