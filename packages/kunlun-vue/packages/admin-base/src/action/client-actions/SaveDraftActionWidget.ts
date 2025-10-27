import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  FunctionCache,
  FunctionService,
  QueryContext,
  QueryService,
  QueryVariables,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { ActionContextType, Entity, ModelDefaultActionName, ModelType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { BooleanHelper, CallChaining, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioButton, OioCloseIcon, OioIcon, OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { isFormViewState, OioFormViewState, Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { Modal } from 'ant-design-vue';
import { isArray } from 'lodash-es';
import { createVNode } from 'vue';
import { FETCH_DRAFT_DATA_WIDGET_PRIORITY, REFRESH_FORM_DATA } from '../../basic/constant';
import { ActionWidget } from '../component';

/**
 * 草稿动作
 */
@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_SaveDraft
  })
)
export class SaveDraftAction extends ActionWidget {
  protected viewState: OioFormViewState | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  @Widget.SubContext(REFRESH_FORM_DATA)
  protected reloadFormData$!: WidgetSubjection<boolean>;

  @Widget.Reactive()
  protected isLoadDraft = false;

  @Widget.Reactive()
  public get loadFunctionFun(): string | undefined {
    return this.getDsl().load || 'queryDraft';
  }

  protected setDraftCode(draftCode: string): void {
    const formViewState = this.viewState;
    if (formViewState && isFormViewState(formViewState)) {
      (formViewState as OioFormViewState).draftCode = draftCode;
    }
  }

  /**
   * 草稿数据回填
   */
  protected useDraftValue(activeRecords: ActiveRecord[]) {
    this.reloadActiveRecords(activeRecords);
    this.reloadDataSource(activeRecords);
    this.reloadFormData$?.subject.next(true);
  }

  /**
   * 如果存在草稿数据，则提示用户是否使用草稿数据
   */
  protected async draftProcess(resolve: Function, reject: Function) {
    const res = await this.queryDraft();
    if (!res.draftCode) {
      resolve();
      return;
    }
    this.setDraftCode(res.draftCode);
    const modal = Modal.confirm({
      class: 'oio-modal oio-draft-data-modal-confirm',
      icon: createVNode(OioIcon, { icon: 'oinone-tixing1', size: '18' }),
      closeIcon: createVNode(OioCloseIcon),
      title: translateValueByKey('是否加载草稿数据'),
      closable: true,
      content: () => {
        return createVNode(
          OioButton,
          {
            onClick: async () => {
              await this.deleteDraft();
              modal.destroy();
              resolve();
            },
            style: {
              position: 'absolute',
              bottom: 'var(--oio-margin-md)',
              right: '28%'
            }
          },
          {
            default: () => translateValueByKey('清空草稿')
          }
        );
      },
      okText: translateValueByKey('是'),
      cancelText: translateValueByKey('否'),
      onOk: () => {
        this.useDraftValue([res]);
        this.isLoadDraft = true;
        resolve();
      },
      onCancel: () => {
        resolve();
      }
    });
  }

  protected $$draftProcess(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.draftProcess(resolve, reject);
    });
  }

  protected async $$beforeMount() {
    super.$$beforeMount();
    this.mountedCallChaining?.hook(
      this.path,
      () => {
        return this.$$draftProcess();
      },
      FETCH_DRAFT_DATA_WIDGET_PRIORITY
    );
  }

  /**
   * 查询草稿
   */
  protected async queryDraft() {
    const variables = this.generatorQueryVariables();
    const context = this.generatorQueryContext();
    return this.queryData(variables, context);
  }

  /**
   * 创建草稿
   */
  protected async createDraft() {
    const draftCode = this.viewState?.draftCode;
    if (draftCode) {
      return this.executeDraftOperator('createDraft', {
        ...(this.activeRecords?.[0] || {}),
        draftCode
      });
    }
    return this.executeDraftOperator('createDraft', this.activeRecords?.[0] || {});
  }

  /**
   * 修改草稿
   */
  protected async updateDraft() {
    const draftCode = this.viewState?.draftCode;
    return this.executeDraftOperator('updateDraft', {
      ...(this.activeRecords?.[0] || {}),
      draftCode
    });
  }

  /**
   * 删除草稿
   */
  protected async deleteDraft() {
    const draftCode = this.viewState?.draftCode;
    if (!draftCode) {
      return undefined;
    }
    return this.executeDraftOperator('deleteDraft', draftCode);
  }

  /**
   * 执行草稿相关函数
   * @param {string} fun 函数名
   * @param {string[]} args 参数
   */
  protected async executeDraftOperator(fun: string, ...args: unknown[]) {
    const functionDefinition = await FunctionCache.get(this.model.model, fun);
    if (!functionDefinition) {
      console.error('无法获取可执行函数', this.action);
      OioNotification.error(translateValueByKey('错误'), translateValueByKey('无法获取可执行函数'));
      return;
    }

    const requestFields = await this.getRequestModelFields();

    return FunctionService.INSTANCE.simpleExecute<Entity>(
      this.model,
      functionDefinition,
      {
        requestModels: FunctionService.usingStaticModels(),
        requestFields,
        variables: this.generatorQueryVariables(),
        context: this.generatorQueryContext()
      },
      ...args
    );
  }

  /**
   * 点击动作保存草稿
   */
  protected async clickAction(...args: unknown[]) {
    if (this.isLoadDraft) {
      await this.updateDraft();
    } else {
      const res = (await this.createDraft()) || {};
      if (res.draftCode) {
        this.setDraftCode(res.draftCode as string);
        const formData = this.activeRecords?.[0];
        if (formData) {
          formData.draftCode = res.draftCode as string;
        }
      }
    }
    OioNotification.success(translateValueByKey('提示'), translateValueByKey('保存成功'));
    return true;
  }

  public generatorQueryVariables(variables?: QueryVariables) {
    variables = { ...(variables || {}), ...(this.metadataRuntimeContext.view?.context || {}) };
    if (!variables.scene) {
      variables.scene = this.scene || this.getUrlParameters().action;
    }
    if (!variables.path) {
      variables.path = this.action.sessionPath;
    }
    return this.rootRuntimeContext.generatorVariables(variables);
  }

  public generatorQueryContext(context?: QueryContext) {
    context = { ...(context || {}) };
    context.__queryParams = {
      ...(context.__queryParams || {}),
      scene: this.scene || this.getUrlParameters().action
    };
    return context;
  }

  public get useConstruct() {
    const { viewAction } = this;
    if (viewAction) {
      const { contextType, model, resModel } = viewAction;
      const { type: modelType } = this.model;
      return (
        model !== resModel ||
        (modelType && [ModelType.TRANSIENT].includes(modelType)) ||
        [ActionContextType.ContextFree, ActionContextType.SingleAndBatch, ActionContextType.Batch].includes(contextType)
      );
    }
    return true;
  }

  public async queryData(variables: QueryVariables, context: QueryContext): Promise<ActiveRecord> {
    const { useConstruct, initialValue, loadFunctionFun } = this;
    let result: ActiveRecord | undefined;
    let id: string | null | undefined;
    let ids: string[] | undefined;
    const contextType = this.viewAction?.contextType || ActionContextType.Single;
    if (this.inline) {
      switch (contextType) {
        case ActionContextType.Single:
          if (BooleanHelper.isFalse(loadFunctionFun)) {
            return initialValue?.[0] || {};
          }
          id = initialValue?.[0]?.id as string;
          break;
        case ActionContextType.SingleAndBatch:
        case ActionContextType.Batch:
          ids = initialValue?.map((v) => v.id).filter((v) => !!v) as string[];
          break;
      }
    } else {
      switch (contextType) {
        case ActionContextType.Single:
          id = this.urlParameters.id;
          break;
        case ActionContextType.SingleAndBatch:
        case ActionContextType.Batch:
          ids = this.urlParameters.ids?.split(StringHelper.ARRAY_DEFAULT_SEPARATOR);
          break;
      }
    }
    if (!useConstruct && (loadFunctionFun || id)) {
      [result] = ActiveRecordsOperator.repairRecords(
        await this.queryOne(
          {
            id,
            ...(this.initialContext || {})
          },
          variables,
          context
        )
      );
    } else {
      let queryData: ActiveRecords | undefined;
      if (id) {
        queryData = { id };
      }
      if (ids) {
        queryData = ids.map((v) => ({ id: v } as ActiveRecord));
      }
      [result] = ActiveRecordsOperator.repairRecords(await this.queryConstruct(queryData, variables, context));
    }

    return result;
  }

  public async queryConstruct(
    queryData: ActiveRecords | undefined,
    variables: QueryVariables,
    context: QueryContext
  ): Promise<ActiveRecord> {
    const { viewAction } = this;
    let finalQueryData: ActiveRecords | undefined;
    let isSameModel = true;
    if (viewAction) {
      const { model: lastModel, contextType } = viewAction;
      const currentModel = this.model.model;
      if (currentModel && lastModel && currentModel !== lastModel) {
        isSameModel = false;
        switch (contextType) {
          case ActionContextType.Batch:
          case ActionContextType.SingleAndBatch:
            finalQueryData = this.initialValue;
            break;
          case ActionContextType.ContextFree:
            isSameModel = true;
            break;
        }
      }
    }
    if (!finalQueryData) {
      if (isArray(queryData)) {
        finalQueryData = queryData;
      } else {
        const viewInitialValue = await this.rootRuntimeContext.getInitialValue();
        const initialValue = this.initialValue?.[0] || {};
        finalQueryData = {
          ...viewInitialValue,
          ...initialValue,
          ...(queryData || {}),
          ...(this.initialContext || {})
        };
      }
    }
    const requestFields = this.rootRuntimeContext.getRequestModelFields();
    return (
      (await QueryService.constructOne(this.model, finalQueryData, {
        requestFields,
        responseFields: requestFields,
        fun: this.loadFunctionFun,
        isSameModel,
        variables,
        context
      })) || {}
    );
  }

  /**
   * 页面查询函数
   * @param queryData
   * @param variables
   * @param context
   */
  public async queryOne(
    queryData: ActiveRecord,
    variables: QueryVariables,
    context: QueryContext
  ): Promise<ActiveRecord> {
    const requestFields = this.rootRuntimeContext.getRequestModelFields();
    return (
      (await QueryService.queryOne(this.model, queryData, {
        requestFields,
        responseFields: requestFields,
        fun: this.loadFunctionFun,
        variables,
        context
      })) || {}
    );
  }

  /**
   * 页面条件查询函数
   * @param condition
   * @param variables
   * @param context
   */
  public async queryOneByWrapper(condition: Condition, variables: QueryVariables, context: QueryContext) {
    const requestFields = this.rootRuntimeContext.getRequestModelFields();
    return (
      (await QueryService.queryOneByWrapper(this.model, {
        requestFields,
        responseFields: requestFields,
        fun: this.loadFunctionFun,
        condition,
        variables,
        context
      })) || {}
    );
  }
}
