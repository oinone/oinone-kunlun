import {
  RuntimeAction,
  ValidatorCallChainingParameters,
  translateValueByKey,
  ActiveRecord,
  RuntimeContext,
  RuntimeContextManager,
  buildQueryCondition,
  resolveDynamicExpression,
  translate
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { ActionContextType, ActionElement, IAction, ViewActionTarget, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, debugConsole, GraphqlHelper, ReturnPromise } from '@oinone/kunlun-shared';
import { Subject } from '@oinone/kunlun-state';
import { ButtonBizStyle, ButtonType, PopconfirmPlacement, ConfirmType } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isBoolean, isNil, isString } from 'lodash-es';
import { Component, toRaw } from 'vue';
import { DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import { Condition } from '@oinone/kunlun-request';
import { BaseActionWidget, BaseActionWidgetProps, BaseView, QueryExpression } from '../../../basic';
import { ClickResult, fetchPopconfirmPlacement } from '../../../typing';
import { executeConfirm } from '../../../util';
import DefaultAction from './DefaultAction.vue';
import DefaultSelectItemAction from './DefaultSelectItemAction.vue';

export interface ActionWidgetProps<Action extends RuntimeAction = RuntimeAction> extends BaseActionWidgetProps<Action> {
  inline?: boolean;

  /**
   * 此属性通过DefaultDropdown.vue
   */
  isSelectItem?: boolean;
}

export class ActionWidget<
  Action extends RuntimeAction = RuntimeAction,
  Props extends ActionWidgetProps<Action> = ActionWidgetProps<Action>
> extends BaseActionWidget<Action, Props> {
  /**
   * 搜索数据
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected searchBody: ActiveRecord | undefined;

  /**
   * 搜索表达式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected searchConditions: QueryExpression[] | undefined;

  // 视图的filter
  @Widget.Reactive()
  @Widget.Inject('filter')
  protected viewFilter: string | undefined;

  @Widget.Provide('actionComponent')
  protected nextActionComponent: Component | undefined;

  @Widget.Inject()
  protected actionComponent: Component | undefined;

  @Widget.Reactive()
  public get allInvisible(): boolean | undefined {
    return false;
  }

  public initialize(props: Props) {
    super.initialize(props);
    if (this.actionComponent) {
      this.setComponent(toRaw(this.actionComponent));
    } else if (props.isSelectItem) {
      this.setComponent(DefaultSelectItemAction);
    } else {
      this.setComponent(DefaultAction);
    }
    return this;
  }

  @Widget.Reactive()
  public get disabled() {
    const dslDisabled = this.getDsl().disabled;
    let disabled;
    if (isNil(dslDisabled) || dslDisabled === false) {
      const contextType = this.action?.contextType;
      if (contextType) {
        const selectedCount = this.activeRecords?.length || 0;
        switch (contextType) {
          case ActionContextType.Single:
            disabled = selectedCount !== 1;
            break;
          case ActionContextType.Batch:
            disabled = selectedCount < 2;
            break;
          case ActionContextType.SingleAndBatch:
            disabled = selectedCount < 1;
            break;
          default:
            disabled = false;
            break;
        }
      } else {
        disabled = BooleanHelper.toBoolean(dslDisabled);
      }
    } else {
      return this.executeExpression(dslDisabled, false);
    }
    return disabled;
  }

  @Widget.Reactive()
  public get disabledTitle() {
    let disabledTitle = this.getDsl().disabledTitle as string;
    if (isNil(disabledTitle)) {
      const contextType = this.action?.contextType;
      if (contextType) {
        const selectedCount = this.activeRecords?.length || 0;
        switch (contextType) {
          case ActionContextType.Single:
            disabledTitle = selectedCount !== 1 ? translateValueByKey('至多选择1个操作行') : '';
            break;
          case ActionContextType.Batch:
            disabledTitle = selectedCount < 2 ? translateValueByKey('至少选择2个操作行') : '';
            break;
          case ActionContextType.SingleAndBatch:
            disabledTitle = selectedCount < 1 ? translateValueByKey('至少选择1个操作行') : '';
            break;
          default:
            disabledTitle = '';
            break;
        }
      }
    }
    return disabledTitle;
  }

  @Widget.Reactive()
  public get help() {
    return this.getDsl().help;
  }

  @Widget.Reactive()
  protected get validateForm(): boolean {
    let validateForm = BooleanHelper.toBoolean(this.getDsl().validateForm);
    if (isNil(validateForm)) {
      validateForm = false;
    }
    return validateForm;
  }

  @Widget.Reactive()
  protected get goBack(): boolean {
    let goBack = BooleanHelper.toBoolean(this.getDsl().goBack);
    if (isNil(goBack)) {
      goBack = false;
    }
    return goBack;
  }

  @Widget.Reactive()
  protected get closeDialog(): boolean {
    let closeDialog = BooleanHelper.toBoolean(this.getDsl().closeDialog);
    if (isNil(closeDialog)) {
      closeDialog = this.isDialog;
    }
    return closeDialog;
  }

  @Widget.Reactive()
  protected get closeAllDialog(): boolean {
    return !!BooleanHelper.toBoolean(this.getDsl().closeAllDialog);
  }

  @Widget.Reactive()
  protected get closeDrawer(): boolean {
    let closeDrawer = BooleanHelper.toBoolean(this.getDsl().closeDrawer);
    if (isNil(closeDrawer)) {
      closeDrawer = this.isDrawer;
    }
    return closeDrawer;
  }

  @Widget.Reactive()
  protected get closeAllDrawer(): boolean {
    return !!BooleanHelper.toBoolean(this.getDsl().closeAllDrawer);
  }

  @Widget.Reactive()
  protected get refreshRoot(): boolean {
    let refreshRoot = BooleanHelper.toBoolean(this.getDsl().refreshRoot);
    if (isNil(refreshRoot)) {
      refreshRoot = false;
    }
    return refreshRoot;
  }

  @Widget.Reactive()
  protected get refreshData(): boolean {
    let refreshData = BooleanHelper.toBoolean(this.getDsl().refreshData);
    if (isNil(refreshData)) {
      refreshData = true;
    }
    return refreshData;
  }

  @Widget.Reactive()
  protected get label(): string {
    const label = this.getDsl().label || this.action?.displayName;
    if (this.icon) {
      return label;
    }
    return label || this.action?.name;
  }

  protected defaultType = ButtonType.primary;

  @Widget.Reactive()
  protected get type(): string {
    if (this.inline) {
      return ButtonType.link;
    }
    return this.getDsl().type?.toLowerCase?.() || this.defaultType;
  }

  @Widget.Reactive()
  protected get bizStyle(): string {
    return this.getDsl().bizStyle?.toLowerCase?.() || ButtonBizStyle.default;
  }

  @Widget.Reactive()
  protected get icon(): string | undefined {
    return this.getDsl().icon;
  }

  protected seekSearchRuntimeContext(): RuntimeContext | undefined {
    const parentHandle = this.metadataRuntimeContext?.handle;
    if (!parentHandle) {
      return undefined;
    }
    const searchRuntimeContext = RuntimeContextManager.getOthers(parentHandle).find(
      (v) => v.view?.type === ViewType.Search
    );
    if (searchRuntimeContext) {
      return searchRuntimeContext;
    }
  }

  protected seekParentMetadataRuntimeContext() {
    const parentHandle = this.metadataRuntimeContext.handle;
    if (!parentHandle) {
      return undefined;
    }
    const widget = Widget.select(parentHandle) as unknown as { metadataRuntimeContext: RuntimeContext | undefined };
    return widget.metadataRuntimeContext;
  }

  /**
   * 获取按钮上方的搜索内容
   *
   * @param {record: object} 自定义扩展数据
   * @param {concatParentFilter: boolean} 当父视图存在过滤条件的时候，是否拼接到当前的条件中  默认拼接
   *
   * @returns {{rsql: string, queryData: object, condition: Condition | string, queryDataToString: () => string}}
   */
  protected getSearchRsqlAndQueryParams(record: ActiveRecord = {}, concatParentFilter = true) {
    const condition = this.buildSearchConditions(record, concatParentFilter)?.condition || DEFAULT_TRUE_CONDITION;
    let queryData = {};

    let rsql = condition;
    if (condition instanceof Condition) {
      const conditionBodyData = condition.getConditionBodyData();
      if (conditionBodyData && Object.keys(conditionBodyData).length) {
        queryData = conditionBodyData;
      }
      rsql = condition.toString();
    }

    const queryDataToString = () => {
      const { length } = Object.keys(queryData);

      if (length) {
        return GraphqlHelper.serializableObject(queryData);
      }
      return '{}';
    };

    return { rsql, queryData, condition, queryDataToString };
  }

  protected buildSearchConditions(
    record: ActiveRecord = {},
    concatParentFilter = true
  ): { runtimeContext: RuntimeContext; condition: Condition | undefined } | undefined {
    let condition: Condition | undefined;

    let searchRuntimeContext: RuntimeContext | undefined;

    const activeRecords = this.activeRecords;
    if (activeRecords && activeRecords.length) {
      condition = new Condition(`id =in= (${activeRecords.map((a) => a.id).join(',')})`);
    } else {
      // 搜索表达式
      const { searchBody, searchConditions } = this;
      searchRuntimeContext = this.seekSearchRuntimeContext();
      if (searchRuntimeContext) {
        const searchWidget = Widget.select(searchRuntimeContext.handle) as unknown as BaseView;
        const realSearchBody = { ...searchBody, ...record };
        Object.keys(realSearchBody).forEach((key) => {
          const val = realSearchBody[key];
          if (isString(val)) {
            const expStr = val as unknown as string;
            realSearchBody[key] = this.executeSearchExpression(searchWidget, expStr);
          }
        });
        condition = buildQueryCondition(searchRuntimeContext, {}, realSearchBody || {}, searchConditions || []);
      }

      const filter = this.seekParentMetadataRuntimeContext()?.view?.filter;
      if (filter && concatParentFilter) {
        if (condition) {
          condition.and(new Condition(filter));
        } else {
          condition = new Condition(filter);
        }
      }
    }

    if (condition) {
      return {
        runtimeContext: searchRuntimeContext || this.rootRuntimeContext,
        condition
      };
    }
  }

  protected executeSearchExpression(searchWidget: BaseView, expression: string): string | undefined {
    return resolveDynamicExpression(
      expression,
      searchWidget?.activeRecords?.[0] || {},
      searchWidget?.rootData?.[0] || {},
      searchWidget?.openerActiveRecords?.[0] || {},
      searchWidget?.scene || ''
    );
  }

  /**
   * 动作上下文
   * @protected
   */
  protected isExistContext() {
    const dslContext = this.action.context;
    const rootContext = this.rootRuntimeContext.view.context;
    return (dslContext && Object.keys(dslContext).length) || (rootContext && Object.keys(rootContext).length);
  }

  /**
   * 构建上下文
   * @param activeRecord 指定上下文
   * @protected
   */
  protected buildContext(activeRecord?: ActiveRecord): Record<string, unknown> | undefined {
    const dslContext = this.action.context;
    const rootContext = this.rootRuntimeContext.view.context;
    debugConsole.log('context parse before', { actionContext: dslContext, viewContext: rootContext });
    if (!this.isExistContext()) {
      return undefined;
    }
    const context: Record<string, unknown> = {};
    if (dslContext) {
      Object.entries(dslContext).forEach(([key, rawExp]) => {
        if (isString(rawExp)) {
          this.testExpressionNotIn(key, rawExp, { activeRecord });
          context[key] = this.executeExpressionByParameters({ activeRecord }, rawExp, rawExp);
        } else {
          context[key] = rawExp;
        }
      });
    }
    const finalContext = { ...rootContext, ...context };
    debugConsole.log('context parse after', finalContext);
    return finalContext;
  }

  protected testExpressionNotIn(key: string, rawExp: string, parameters: Partial<ExpressionRunParam>) {
    debugConsole.run(() => {
      // 正则表达式来匹配 activeRecord 相关的部分
      const regex = /\b(?:activeRecords|rootRecord|openerRecord|activeRecord)\.[a-zA-Z0-9_]+\b/g;
      // 提取所有相关的变量
      const matches = rawExp.match(regex);
      const activeRecords = this.activeRecords || [];
      const expRunParam = {
        activeRecords: parameters.activeRecords || activeRecords,
        rootRecord: parameters.rootRecord || this.rootData?.[0] || {},
        openerRecord: parameters.openerRecord || this.openerActiveRecords?.[0] || {},
        activeRecord: parameters.activeRecord || activeRecords[0] || {}
      } as ExpressionRunParam;

      const warnFields = [] as string[];
      matches?.forEach((a) => {
        const arr = a.split('.');
        const keywordVar = arr[0];
        const field = arr[1];
        const keys = Object.keys(expRunParam[keywordVar] || {});
        if (!keys?.includes(field)) {
          warnFields.push(field);
        }
      });
      if (warnFields.length) {
        debugConsole.warn(
          [
            `当前动作的上下文表达式中可能使用了未拖入的字段`,
            `上下文所在目标页面模型的字段:${key}`,
            `表达式:${rawExp}`,
            `未拖入的当前视图字段:${warnFields.join(',')}`
          ].join(';')
        );
      }
    });
  }

  @Widget.Reactive()
  protected get enableConfirm(): boolean {
    const enableConfirm = BooleanHelper.toBoolean(this.getDsl().enableConfirm);
    if (isNil(enableConfirm)) {
      return true;
    }
    return enableConfirm;
  }

  @Widget.Reactive()
  protected get confirmType(): ConfirmType | undefined {
    const { confirmType } = this.getDsl();
    if (confirmType) {
      const realConfirmType = ConfirmType[confirmType];
      if (realConfirmType) {
        return realConfirmType;
      }
      return undefined;
    }
    return ConfirmType.POPPER;
  }

  @Widget.Reactive()
  protected get confirm(): string | undefined {
    if (this.enableConfirm && this.confirmType === ConfirmType.POPPER) {
      return this.confirmText;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get confirmText(): string | undefined {
    const confirmText = this.getDsl().confirmText || this.getDsl().confirm;
    if (isString(confirmText)) {
      return this.executeExpression<string>(confirmText);
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get confirmPosition(): PopconfirmPlacement {
    return fetchPopconfirmPlacement(this.getDsl().confirmPosition) || PopconfirmPlacement.BM;
  }

  @Widget.Reactive()
  protected get confirmTitle(): string | undefined {
    const { confirmTitle } = this.getDsl();
    if (confirmTitle) {
      return confirmTitle;
    }
    return translate('kunlun.common.prompt');
  }

  @Widget.Reactive()
  protected get enterText(): string | undefined {
    const { enterText } = this.getDsl();
    if (enterText) {
      return enterText;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get cancelText(): string | undefined {
    const { cancelText } = this.getDsl();
    if (cancelText) {
      return cancelText;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get actionElement(): ActionElement {
    // fixme @zbh 20220812 createActionElement不可用
    // return {
    //   ...createActionElement(this.getActionDslNode(), this.parentDslNode),
    //   model: this.action.model || this.viewModel.model
    // };
    return {} as ActionElement;
  }

  protected filterByContextType(action: IAction, contextTypeLength: number) {
    switch (action.contextType) {
      case ActionContextType.ContextFree:
        return true;
      case ActionContextType.Batch:
        return contextTypeLength > 1;
      case ActionContextType.Single:
        return contextTypeLength === 1;
      case ActionContextType.SingleAndBatch:
        return contextTypeLength >= 1;
      default:
        return true;
    }
  }

  public executeExpressionByParameters<T>(
    parameters: Partial<ExpressionRunParam>,
    expression: string,
    errorValue?: T
  ): T | string | undefined {
    const activeRecords = this.activeRecords || [];
    const { scene } = this;
    return Expression.run(
      {
        activeRecords: parameters.activeRecords || activeRecords,
        rootRecord: parameters.rootRecord || this.rootData?.[0] || {},
        openerRecord: parameters.openerRecord || this.openerActiveRecords?.[0] || {},
        scene: parameters.scene || scene,
        activeRecord: parameters.activeRecord || activeRecords[0] || {}
      } as ExpressionRunParam,
      expression,
      errorValue
    );
  }

  public executeExpression<T>(expression: string, errorValue?: T): T | string | undefined {
    const activeRecords = this.activeRecords || [];
    const { scene } = this;
    return Expression.run(
      {
        activeRecords,
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene,
        activeRecord: activeRecords[0] || {}
      } as ExpressionRunParam,
      expression,
      errorValue
    );
  }

  protected invisibleProcess(invisible: boolean | string): boolean | undefined {
    if (typeof invisible === 'boolean') {
      return invisible;
    }
    const activeRecords = this.activeRecords || [];
    const { scene } = this;
    if (activeRecords.length <= 1) {
      return !!Expression.run(
        {
          activeRecords,
          rootRecord: this.rootData?.[0] || {},
          openerRecord: this.openerActiveRecords?.[0] || {},
          scene
        },
        invisible,
        false
      );
    }
    return !activeRecords.every((record) => {
      return !Expression.run(
        {
          activeRecords,
          rootRecord: this.rootData?.[0] || {},
          openerRecord: this.openerActiveRecords?.[0] || {},
          scene,
          activeRecord: record
        },
        invisible,
        false
      );
    });
  }

  @Widget.Provide()
  @Widget.Reactive()
  protected get variables() {
    // const vari = XMLTemplateParser.resolveVariables(this.getDsl());
    // return this.resolveVariables(vari);
    return {};
  }

  protected resolveVariables(vari: Record<string, unknown>) {
    const result: Record<string, unknown> = {};
    const activeRecords = this.activeRecords || [];
    const rootRecord = this.rootData?.[0] || {};
    const { scene } = this;
    Object.keys(vari).forEach((name) => {
      Expression.getInstance().initExpressionContext(
        activeRecords,
        rootRecord,
        this.openerActiveRecords?.[0] || {},
        scene
      );
      try {
        const v = vari[name] as string;
        if (typeof v === 'string') {
          if (v.startsWith('${') && v.endsWith('}')) {
            const exp = v.substring(2, v.length - 1);
            const val = Expression.getInstance().exec(exp);
            if (val) {
              result[name] = val;
            }
          } else {
            result[name] = vari[name];
          }
        } else {
          result[name] = v;
        }
      } catch (e) {
        // console.error(e);
      } finally {
        Expression.getInstance().cleanupExpressionContext();
      }
    });
    return result;
  }

  /**
   * 手动触发按钮点击方法
   * @param args 参数
   */
  public async click(...args: unknown[]): Promise<ClickResult> {
    return this.validateAndClick(...args);
  }

  /**
   * 动作点击
   * @param args 参数
   * @protected
   */
  @Widget.Method()
  protected async validateAndClick(...args: unknown[]): Promise<ClickResult> {
    return this.load(async (): Promise<ClickResult> => {
      try {
        if (!(await this.validatorForm())) {
          return false;
        }
        const result = await this.validateConfirm();
        if (result) {
          const clickResult = await this.clickAction(...args);
          /**
           * 动作点击后，若结果为false，则中断动作执行后的处理逻辑
           */
          if (isBoolean(clickResult) && !clickResult) {
            return clickResult;
          }
          const res = await this.clickActionAfter(clickResult);
          // this.onShowActionsPopup?.(false);
          return res;
        }
      } catch (e) {
        console.error('click action error.', e);
      }
      return false;
    });
  }

  /**
   * 原始动作点击方法
   * @param args 参数
   */
  protected clickAction(...args: unknown[]): ReturnPromise<ClickResult> {
    this.action$.next({ action: this.action });
    return true;
  }

  /**
   * 二次弹窗校验
   */
  @Widget.Method()
  public validateConfirm(): Promise<boolean> {
    if (this.enableConfirm && this.confirmType === ConfirmType.MODAL) {
      const { confirmText } = this;
      if (confirmText) {
        return executeConfirm({
          confirm: confirmText,
          enterText: this.enterText,
          cancelText: this.cancelText
        });
      }
    }
    return Promise.resolve(true);
  }

  protected validatorForm(): Promise<boolean> {
    if (this.validateForm) {
      return this.validator(true);
    }
    return Promise.resolve(true);
  }

  /**
   * 执行验证
   * <p>
   * 生命周期通知类型:
   * {@link LifeCycleTypes#ON_VIEW_VALIDATE_START} 验证开始
   * {@link LifeCycleTypes#ON_VIEW_VALIDATE_END} 验证结束
   * {@link LifeCycleTypes#ON_VIEW_VALIDATE_SUCCESS} 验证成功
   * {@link LifeCycleTypes#ON_VIEW_VALIDATE_FAILED} 验证失败
   * </p>
   * @protected
   */
  protected validator(sendErrorMessage = false): Promise<boolean> {
    if (this.validatorCallChaining) {
      const validatorParameter: ValidatorCallChainingParameters = {
        notify: true,
        sendErrorMessage
      };
      const res = this.validatorCallChaining.call(validatorParameter);
      if (res != null) {
        return res.then((v) => (v == null ? true : v));
      }
    }
    return Promise.resolve(true);
  }

  @Widget.Method()
  @Widget.Inject()
  protected onShowActionsPopup;

  protected clickActionAfter(result: ClickResult): ReturnPromise<ClickResult> {
    const { target } = (this.action || {}) as any;
    if (!target || ![ViewActionTarget.Drawer, ViewActionTarget.Dialog].includes(target)) {
      // 弹窗
      this.onShowActionsPopup?.(false);
    }
    return result;
  }

  /**
   * @description 根据xml中api的配置，校验提交数据
   *
   * @returns {Promise | null} 如果配置了submitApi，则返回校验后的结果，否则返回null
   *
   * @example
   * <view widget="form">
   *  <api name="apiName">
   *    <validation scope="作用域" fun="校验函数" expression="表达式校验" tips="错误的提示"/>
   *    <action refs='xxxxx' submit-api="apiName"  displayName='确定' />
   *  </api>
   * </view>
   */
  @Widget.Method()
  protected async validatorByApi(): Promise<{ status: boolean; message: string } | null> {
    return null;
    // const { submitApi } = this.actionElement;
    // if (!submitApi) {
    //   return null;
    // }
    //
    // const viewDsl = this.getSelfViewWidget()!.getDsl().children;
    //
    // const apiDsl = viewDsl.find((c) => c.name === submitApi);
    // if (!apiDsl) {
    //   console.error(`submit api "${submitApi}" not match configuration in current xml`);
    //   return {
    //     status: false,
    //     message: ''
    //   };
    // }
    //
    // const validationDsl = apiDsl?.children.find((a) => a.tagName === ElementType.VALIDATION);
    // if (!validationDsl) {
    //   // console.error(`api node child not "validation", usage <validation scope="" fun="" expression="" tips=""/>`);
    //   return null;
    // }
    //
    // const { scope, fun, expression, tips } = validationDsl as unknown as IValidationAttrs;
    //
    // switch (scope) {
    //   case ActionValidationScope.Client:
    //     return {
    //       status: await this.executeClientValidator(expression, fun),
    //       message: tips
    //     };
    //   case ActionValidationScope.Server:
    //     return {
    //       status: await this.executeServerValidator(expression, fun),
    //       message: tips
    //     };
    //   case ActionValidationScope.Both: // 如果scope="both", 前端只做表达式校验
    //     if (expression === false) {
    //       return {
    //         status: false,
    //         message: tips
    //       };
    //     }
    //
    //     return {
    //       status: this.validatorByExpression(expression as string),
    //       message: tips
    //     };
    //   default:
    //     return {
    //       status: false,
    //       message: ''
    //     };
    // }
  }

  /**
   * @description 客户端校验「表达式、全局函数校验」
   *
   * @param {string | boolean} expression 表达式
   * @param {string} fun 全局的函数名，`挂在window中的函数`
   *
   * @returns {boolean}
   */
  protected async executeClientValidator(expression: string | boolean, fun: string): Promise<boolean> {
    // let result = false;
    //
    // // 根据表达式校验
    // if (typeof expression === 'boolean') {
    //   result = expression;
    // } else if (expression) {
    //   const res = this.validatorByExpression(expression);
    //   result = !!res;
    // } else if (fun) {
    //   const _fun = getClientFun(this.action.model!, fun);
    //   if (!_fun) {
    //     result = false;
    //     console.error(`client function "${fun}" is not defined，usage registerClientFun to register`);
    //   } else {
    //     return _fun(this.getActiveRecords()[0] || {}, this.rootData || {});
    //   }
    // } else {
    //   const widget = this.getSelfViewWidget();
    //   // 只有FormWidgetV3才有 `getValidatorRes`
    //   const res = await (widget as any).getValidatorRes();
    //   if (res) {
    //     result = true;
    //   }
    // }

    return false;
  }

  /**
   * @description 服务端函数校验「表达式、服务端函数校验」
   */
  protected async executeServerValidator(expression: string | boolean, fun: string): Promise<boolean> {
    let result = false;

    // 如果服务端校验配置了expression， 那么前端不做处理，又后端处理
    if (expression) {
      return true;
    }

    // const actions = this.viewModel.serverActionList || [];
    // const action = actions.find((a) => a.name === fun) as unknown as RuntimeServerAction;
    //
    // if (!action) {
    //   result = false;
    //   console.error(`server action ${fun} not find`);
    // }
    //
    // try {
    //   await executeServerAction(action, this.activeRecords?.[0] || {});
    //   result = true;
    // } catch (error) {
    //   result = false;
    // }

    return result;
  }

  protected validatorByExpression(expression: string) {
    Expression.getInstance().initExpressionContext(
      this.activeRecords,
      this.rootData?.[0] || {},
      this.openerActiveRecords?.[0] || {},
      this.scene
    );
    try {
      const res = Expression.getInstance().exec(expression);
      if (!res) {
        return false;
      }
    } catch (e) {
      return false;
    }

    return true;
  }

  @Widget.Inject()
  protected action$!: Subject<Record<string, unknown>>;

  /**
   * 获取当前domain
   *
   */
  @Widget.Reactive()
  public get actionDomain() {
    let { domain } = this.getDsl();
    domain = (domain || '') as string;
    if (domain) {
      return this.resolveDynamicDomain(domain);
    }
    return undefined;
  }

  public resolveDynamicDomain(domain?: string): string {
    Expression.getInstance().initExpressionContext(
      this.activeRecords,
      this.rootData?.[0] || {},
      this.openerActiveRecords?.[0] || {},
      this.scene,
      null,
      this.parentViewActiveRecords?.[0] || {}
    );
    if (!domain) {
      Expression.getInstance().cleanupExpressionContext();
      return '';
    }

    const reg = /\$[\!,\?,\#]?\{([^\}]+)\}/g;
    const contrastObj: Record<string, string | null> = {};
    const matchArr: string[] = [];
    let tempResult = reg.exec(domain);
    const typeArr: string[] = [];
    // 匹配到${}中的值,存入数组中
    while (tempResult !== null) {
      matchArr.push(tempResult[1]);
      const type = tempResult[0].charAt(1);
      if (type !== '{') {
        typeArr.push(tempResult[0].substr(1, 1));
      } else {
        typeArr.push('');
      }
      tempResult = reg.exec(domain);
    }

    // matchArr.length === 0` 时代表 `domain` 可能是一个 `id == xxx` 的静态条件，
    // 这时直接返回原值就好
    if (matchArr.length === 0) {
      return domain;
    }

    // 获取activeRecord中对应的匹配到的值,存入_contrastObj对照对象中
    const _matchLength = matchArr.length;

    for (let _matchIndex = 0; _matchIndex < _matchLength; _matchIndex++) {
      const _matchItem = matchArr[_matchIndex];
      const _type = typeArr[_matchIndex];
      if (_type === '#') {
        contrastObj[_matchItem] = `\${${_matchItem}}`;
      } else {
        try {
          const value = Expression.getInstance().exec(_matchItem);
          contrastObj[_matchItem] = (value as string) || null;
          if (_type === '!' && contrastObj[_matchItem] === null) {
            contrastObj[_matchItem] = '';
          }
        } catch (e) {
          contrastObj[_matchItem] = `\${${_matchItem}}`;
        }
      }
    }

    Expression.getInstance().cleanupExpressionContext();
    return domain.replace(reg, (matchWithBrackets, matchExp: string): string => {
      if (matchExp) {
        return contrastObj[matchExp] as string;
      }
      // 兼容用户配置错误,正则没有匹配到变量
      return '';
    });
  }
}
