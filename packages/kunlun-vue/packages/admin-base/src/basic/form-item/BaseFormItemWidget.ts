import {
  ActiveRecord,
  QueryService,
  RelationUpdateType,
  SubmitRelationValue,
  SubmitType,
  SubmitValue,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { ViewMode, ViewType } from '@oinone/kunlun-meta';
import { ILevel } from '@oinone/kunlun-request';
import { BooleanHelper, CallChaining, CastHelper, ObjectUtils, Optional, ReturnPromise } from '@oinone/kunlun-shared';
import { ComputeTrigger, ValidateTrigger, WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { ActiveRecordsWidget, ActiveRecordsWidgetProps, Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { isBoolean, isEmpty, isNil, isString } from 'lodash-es';
import { clearFieldsDataFun, generatorConstructMirrorSubmitData } from '../../field/util';
import { isValidatorLikeSuccess, isValidatorSuccess, ValidatorInfo, ValidatorStatus } from '../../typing';
import { BaseDataWidget } from '../common';
import { REFRESH_FORM_DATA } from '../constant/state-stream';
import { FormValidateResult } from '../types';

function isSubmitRelationValue(value: Record<string, unknown> | SubmitRelationValue): value is SubmitRelationValue {
  return value instanceof SubmitRelationValue;
}

export type BaseFormItemWidgetProps = ActiveRecordsWidgetProps;

export class BaseFormItemWidget<
  Value = unknown,
  Props extends BaseFormItemWidgetProps = BaseFormItemWidgetProps
> extends BaseDataWidget<Props> {
  @Widget.Reactive()
  @Widget.Inject()
  protected viewType: ViewType | undefined;

  @Widget.Reactive()
  @Widget.Inject('viewMode')
  protected parentViewMode: ViewMode | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get viewMode(): ViewMode | undefined {
    if (this.viewType === ViewType.Table) {
      return ViewMode.Editor;
    }
    return this.parentViewMode;
  }

  @Widget.Reactive()
  @Widget.Inject('submitType')
  protected parentSubmitType: SubmitType | undefined;

  @Widget.Reactive()
  protected currentSubmitType: SubmitType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get submitType(): SubmitType {
    return (
      this.currentSubmitType ||
      (this.getDsl().submitType?.toLowerCase?.() as SubmitType) ||
      this.parentSubmitType ||
      SubmitType.default
    );
  }

  @Widget.Reactive()
  @Widget.Inject('relationUpdateType')
  protected parentRelationUpdateType: RelationUpdateType | undefined;

  @Widget.Reactive()
  protected currentRelationUpdateType: RelationUpdateType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get relationUpdateType(): RelationUpdateType {
    return (
      this.currentRelationUpdateType ||
      (this.getDsl().relationUpdateType?.toLowerCase?.() as RelationUpdateType) ||
      this.parentRelationUpdateType ||
      RelationUpdateType.default
    );
  }

  @Widget.SubContext(REFRESH_FORM_DATA)
  protected reloadFormData$!: WidgetSubjection<boolean>;

  public initialize(props: Props) {
    if (!props.slotNames) {
      props.slotNames = [];
    }
    super.initialize(props);
    return this;
  }

  /**
   * 当前表单数据
   * @protected
   */
  @Widget.Reactive()
  protected get formData(): ActiveRecord {
    return this.activeRecords?.[0] || {};
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected submitCallChaining: CallChaining<SubmitValue> | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected validatorCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  public get value(): Value | null | undefined {
    return this.compute();
  }

  public getValue(): Value | null | undefined {
    return this.formData[this.itemName] as Value;
  }

  public setValue(value: Value | null | undefined): void {
    this.formData[this.itemName] = value;
  }

  protected compute(): Value | null | undefined {
    return this.getValue();
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }

  @Widget.Reactive()
  public get label(): string | undefined {
    const { label } = this.getDsl();
    if (label == null) {
      return undefined;
    }
    if (isBoolean(label)) {
      return BooleanHelper.toString(label);
    }
    return this.executeLabelExpression(label as string);
  }

  @Widget.Reactive()
  public get labelInvisible(): boolean {
    return BooleanHelper.isFalse(this.label) || !!BooleanHelper.toBoolean(this.getDsl().labelInvisible);
  }

  @Widget.Reactive()
  public get help() {
    return this.getDsl().help;
  }

  @Widget.Reactive()
  public get hint(): string | undefined {
    const { hint } = this.getDsl();
    if (hint) {
      return Optional.ofNullable(this.executeExpression<string>(hint, hint)).orElse(hint);
    }
    return undefined;
  }

  @Widget.Reactive()
  public get required(): boolean {
    if (this.viewMode === ViewMode.Lookup || this.viewType === ViewType.Search) {
      return false;
    }
    let { required } = this.getDsl();
    if (isNil(required)) {
      required = false;
    }
    if (isBoolean(required)) {
      return required;
    }
    if (isString(required)) {
      if (BooleanHelper.isStringBoolean(required)) {
        return !!BooleanHelper.toBoolean(required);
      }
      return !!this.executeExpression<boolean>(required as string, false);
    }
    return false;
  }

  @Widget.Reactive()
  public get readonly(): boolean {
    if (this.viewMode === ViewMode.Lookup) {
      return true;
    }
    let { readonly } = this.getDsl();
    if (isNil(readonly)) {
      readonly = false;
    }
    if (isBoolean(readonly)) {
      return readonly;
    }
    if (isString(readonly)) {
      if (BooleanHelper.isStringBoolean(readonly)) {
        return !!BooleanHelper.toBoolean(readonly);
      }
      return !!this.executeExpression<boolean>(readonly as string, false);
    }
    return false;
  }

  @Widget.Reactive()
  public get disabled(): boolean {
    if (this.viewMode === ViewMode.Lookup) {
      return false;
    }
    let { disabled } = this.getDsl();
    if (isNil(disabled)) {
      disabled = false;
    }
    if (isBoolean(disabled)) {
      return disabled;
    }
    if (isString(disabled)) {
      if (BooleanHelper.isStringBoolean(disabled)) {
        return !!BooleanHelper.toBoolean(disabled);
      }
      return !!this.executeExpression<boolean>(disabled as string, false);
    }
    return false;
  }

  @Widget.Reactive()
  public get requiredTips(): string | undefined {
    return this.getDsl().requiredTips;
  }

  public defaultValidateTrigger: ValidateTrigger[] = [ValidateTrigger.BLUR];

  @Widget.Reactive()
  public get validateTrigger(): ValidateTrigger[] {
    const { validateTrigger } = this.getDsl();
    if (!isEmpty(validateTrigger) && isString(validateTrigger)) {
      return validateTrigger.split(',').map((v) => v.trim().toLowerCase() as ValidateTrigger);
    }
    return this.defaultValidateTrigger;
  }

  @Widget.Reactive()
  protected validation: ValidatorInfo | undefined;

  @Widget.Reactive()
  public get validatorInfo(): ValidatorInfo | undefined {
    return this.validation;
  }

  @Widget.Reactive()
  protected blurValue: string | null | undefined;

  public setBlurValue(val: unknown) {
    this.blurValue = this.computeBlurValue(val);
  }

  public computeBlurValue(val: unknown) {
    if (val == null || isString(val)) {
      return val;
    }
    return JSON.stringify(val);
  }

  @Widget.Reactive()
  protected get clearFields(): string[] {
    return (this.getDsl().clearFields && (this.getDsl().clearFields as string).split(',')) as string[];
  }

  /**
   * 值变更
   * @param val 新值
   */
  @Widget.Method()
  public change(val: Value | null | undefined) {
    this.updateValue(val);
    this.executeCompute?.(ComputeTrigger.CHANGE);
    if (this.validateTrigger.includes(ValidateTrigger.CHANGE)) {
      this.executeValidator().then((info) => {
        if (isValidatorSuccess(info)) {
          this.afterChange();
        }
      });
    } else {
      this.afterChange();
    }
  }

  protected updateValue(val: Value | null | undefined) {
    this.setValue(val);
  }

  protected afterChange() {
    this.afterTriggerExecute(WidgetTrigger.CHANGE);
  }

  /**
   * 聚焦
   */
  @Widget.Method()
  public focus() {
    this.setBlurValue(this.value);
  }

  /**
   * 失焦
   */
  @Widget.Method()
  public blur() {
    const { blur } = this.getDsl();
    if (!isEmpty(blur)) {
      this.updateValue(CastHelper.cast(this.executeExpression(blur, null)));
    }
    if (this.validateTrigger.includes(ValidateTrigger.BLUR)) {
      this.executeValidator().then((info) => {
        if (isValidatorSuccess(info)) {
          this.afterBlur();
        }
      });
    } else {
      this.afterBlur();
    }
  }

  protected afterBlur() {
    if (this.blurValueChange()) {
      this.setBlurValue(this.value);
      this.executeCompute?.(ComputeTrigger.BLUR);
      this.afterTriggerExecute(WidgetTrigger.BLUR);
    }
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.BLUR];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.BLUR];
  }

  @Widget.Reactive()
  protected get constructDataTrigger(): WidgetTrigger[] {
    const { constructDataTrigger } = this.getDsl();
    if (!isEmpty(constructDataTrigger) && isString(constructDataTrigger)) {
      return constructDataTrigger.split(',').map((v) => v.trim().toLowerCase() as WidgetTrigger);
    }
    return this.defaultConstructDataTrigger();
  }

  @Widget.Reactive()
  protected get clearFieldsTrigger(): WidgetTrigger[] {
    const { clearFieldsTrigger } = this.getDsl();
    if (!isEmpty(clearFieldsTrigger) && isString(clearFieldsTrigger)) {
      return clearFieldsTrigger.split(',').map((v) => v.trim().toLowerCase() as WidgetTrigger);
    }
    return this.defaultClearFieldsTrigger();
  }

  public async afterTriggerExecute(trigger: WidgetTrigger) {
    let isChange = false;
    if (this.constructDataTrigger.includes(trigger)) {
      isChange = await this.constructDataBack();
    }
    if (this.clearFieldsTrigger.includes(trigger)) {
      const res = this.clearFieldsCallback();
      if (res) {
        isChange = res;
      }
    }
    if (isChange) {
      this.reloadFormData$.subject.next(true);
    }
  }

  protected blurValueChange() {
    return JSON.stringify(this.value) !== JSON.stringify(this.blurValue);
  }

  public async constructDataBack(): Promise<boolean> {
    const { constructFun, constructSubmitType, submitFields } = this.getDsl();
    const { formData, model } = this;

    if (!constructFun) {
      return false;
    }

    const { runtimeContext, fields } = this.rootViewRuntimeContext;

    const targetWidget = Widget.select(runtimeContext.handle);
    let targetActiveRecord: ActiveRecord | undefined;
    if (targetWidget instanceof ActiveRecordsWidget) {
      targetActiveRecord = targetWidget.getOperator<ActiveRecordsWidget>()?.activeRecords?.[0];
    }
    if (!targetActiveRecord) {
      targetActiveRecord = this.rootData?.[0];
    }
    if (!targetActiveRecord) {
      console.error('Invalid target active record.', runtimeContext.handle, targetWidget);
      return false;
    }

    const submitData = generatorConstructMirrorSubmitData(
      model,
      targetActiveRecord,
      formData,
      this.generatorConstructMirrorSubmitData(),
      {
        submitType: constructSubmitType,
        customSubmitFields: submitFields
      }
    );
    let finalSubmitData = submitData;
    if (submitData !== targetActiveRecord) {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        finalSubmitData = {
          [field.name]: finalSubmitData
        };
      }
    }

    const requestFields = runtimeContext.getRequestModelFields();

    const result = await QueryService.constructMirror(runtimeContext.model, finalSubmitData, {
      fun: constructFun,
      requestFields
    });

    if (result) {
      return ObjectUtils.shallowMerge(targetActiveRecord, result);
    }
    return false;
  }

  protected generatorConstructMirrorSubmitData(): ActiveRecord {
    const { formData, itemName } = this;
    return { [itemName]: formData[itemName] };
  }

  protected clearFieldsCallback(): boolean {
    return clearFieldsDataFun(this.clearFields, this.formData);
  }

  protected englishOnlyRegex = /^[a-zA-Z]+$/;

  protected quotationOnlyRegex = /^['|"]/;

  protected executeLabelExpression<T>(label: string): string | undefined {
    if (Expression.isExpressionStr(label as string)) {
      return this.executeExpression(Expression.getExpressionStr(label));
    }
    return Expression.hasKeywords(label as string) ? this.executeExpression(label) : label;
  }

  protected executeExpression<T>(expression: string, errorValue?: T): T | string | undefined {
    if (expression === null || expression === undefined) {
      return typeof errorValue === 'boolean' ? errorValue : errorValue || expression;
    }

    /**
     * 如果表达式是字符串，且不是以引号开头
     *
     * (带有引号的表示compute="'value'")
     */
    if (typeof expression === 'string' && !this.quotationOnlyRegex.test(expression)) {
      /**
       * 如果表达式全是英文，则不需要进行表达式解析，否则会导致翻译后的label或者displayName之类的变成"true"
       * 如果表达式没有“表达式”关键词，则不需要进行表达式解析
       */
      if (this.englishOnlyRegex.test(expression)) {
        return expression;
      }
    }

    const params: ExpressionRunParam = {
      activeRecords: [this.formData || {}],
      rootRecord: this.rootData?.[0] || {},
      openerRecord: this.openerActiveRecords?.[0] || {},
      parentRecord: this.parentViewActiveRecords?.[0] || {},
      scene: this.scene
    };

    return Expression.run(params, expression, errorValue);
  }

  public executeCompute?(trigger: ComputeTrigger);

  /**
   * 数据提交的方法，例如：m2o字段user(假设其关系字段为userId)的值{id: 1, name: 'xxx'},但是实际后端数据只需要其中的id，所以用m2o对应的关系字段userId提交数据就可以了
   * @param submitValue
   */
  public submit(submitValue: SubmitValue): ReturnPromise<Record<string, unknown> | SubmitRelationValue | undefined> {
    return undefined;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected formValidateCallChaining: CallChaining<FormValidateResult[] | undefined> | undefined;

  protected get isSkipValidator(): boolean {
    return this.invisible || this.parentInvisible || false;
  }

  public async validator(): Promise<ValidatorInfo> {
    if (this.isSkipValidator) {
      return this.validatorSkip();
    }
    const { validation, tips } = this.getDsl();
    if (validation) {
      const valid = this.validatorByExpression(validation, tips);
      if (valid) {
        return valid;
      }
    }
    const { validator, validatorMessage } = this.getDsl();
    if (validator) {
      const valid = this.validatorByExpression(validator as string, validatorMessage as string);
      if (valid) {
        return valid;
      }
    }
    return this.validatorSuccess();
  }

  /**
   * @description 表达式校验
   *
   * @param {string} expression 表达式
   * @param {string} msg 校验失败的消息提示
   *
   */
  protected validatorByExpression(expression: string, msg: string): ValidatorInfo | undefined {
    try {
      const res = this.executeExpression(expression);
      if (!res) {
        return this.validatorError(msg || translateValueByKey('校验失败'));
      }
    } catch (e) {
      return this.validatorError(translateValueByKey('表达式校验失败'));
    }
  }

  protected validatorSuccess(message?: string): ValidatorInfo {
    return {
      status: ValidatorStatus.Success,
      message: translateValueByKey(message),
      path: this.dataPath
    };
  }

  protected validatorSkip(message?: string): ValidatorInfo {
    return {
      status: ValidatorStatus.Skip,
      message: translateValueByKey(message),
      path: this.dataPath
    };
  }

  protected validatorError(message?: string): ValidatorInfo {
    console.error(`validator error. path=${this.dataPath}`, this);
    return {
      status: ValidatorStatus.Error,
      message: translateValueByKey(message || this.requiredTips || this.translate('kunlun.field.required')),
      path: this.dataPath
    };
  }

  protected validatorWarning(message?: string): ValidatorInfo {
    return {
      status: ValidatorStatus.Warning,
      message: translateValueByKey(message),
      path: this.dataPath
    };
  }

  protected validatorValidating(message?: string): ValidatorInfo {
    return {
      status: ValidatorStatus.Validating,
      message: translateValueByKey(message),
      path: this.dataPath
    };
  }

  public async executeValidator(): Promise<ValidatorInfo> {
    const status = await this.validator();
    if (status?.status !== this.validation?.status || status?.message !== this.validation?.message) {
      this.validation = status;
    }
    return status;
  }

  protected invisibleProcess(invisible: boolean | string): boolean | undefined {
    if (typeof invisible === 'boolean') {
      return invisible;
    }
    return !!this.executeExpression<boolean>(invisible, false);
  }

  protected childrenInvisibleProcess(): boolean {
    if (this.getChildren().length) {
      return super.childrenInvisibleProcess();
    }
    return false;
  }

  protected $$mounted() {
    super.$$mounted();
    this.submitCallChaining?.hook(this.path, async (args, result) => {
      if (!result) {
        return;
      }
      const submitResult = result.records as ActiveRecord | undefined;
      if (!submitResult) {
        return;
      }
      const submitValue = await this.submit(result);
      if (submitValue == null) {
        return;
      }
      const isReturnRelationValue = isSubmitRelationValue(submitValue);
      let finalSubmitValue: Record<string, unknown> | undefined;
      if (isReturnRelationValue) {
        result.relationRecords.push(submitValue);
      } else {
        finalSubmitValue = submitValue;
      }
      if (finalSubmitValue) {
        Object.keys(finalSubmitValue).forEach((key) => {
          submitResult[key] = finalSubmitValue![key];
        });
      }
    });
    this.validatorCallChaining?.hook(this.path, async () => {
      return isValidatorLikeSuccess(await this.executeValidator());
    });
    this.formValidateCallChaining?.hook(this.path, (args) => {
      const results = args?.[0] as FormValidateResult[] | undefined;
      if (!results) {
        return;
      }
      const result = results.find((v) => v.path === this.dataPath);
      if (result) {
        let status = ValidatorStatus.Success;
        switch (result.level) {
          case ILevel.DEBUG:
            return;
          case ILevel.WARN:
            status = ValidatorStatus.Warning;
            break;
          case ILevel.ERROR:
            status = ValidatorStatus.Error;
            break;
        }
        this.validation = {
          message: result.message,
          status,
          path: result.path
        };
      }
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.submitCallChaining?.unhook(this.path);
    this.validatorCallChaining?.unhook(this.path);
  }
}
