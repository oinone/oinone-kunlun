import {
  CommonPatternMap,
  FieldPattern,
  RuntimeModelField,
  SubmitHandler,
  SubmitRelationValue,
  SubmitValue,
  translateValueByKey
} from '@kunlun/engine';
import { FieldEventName, FieldEventNames, LifeCycleHeart, LifeCycleTypes } from '@kunlun/event';
import { Expression } from '@kunlun/expression';
import { isEmptyValue, isValidateEmpty, ModelFieldType, ViewType } from '@kunlun/meta';
import { BooleanHelper, Constructor, ReturnPromise } from '@kunlun/shared';
import { SPI, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { ComputeTrigger } from '@kunlun/vue-ui-common';
import { InnerWidgetType, PathWidget, Widget } from '@kunlun/vue-widget';
import { isEmpty, isFunction, isNil, isPlainObject, isString } from 'lodash-es';
import { isValidatorError, isValidatorSuccess, ValidatorInfo } from '../../typing';
import { BaseFormItemWidget, BaseFormItemWidgetProps } from '../form-item';
import { MobileSPIOptions } from '../types';

export interface BaseFieldProps<Field extends RuntimeModelField = RuntimeModelField> extends BaseFormItemWidgetProps {
  field?: Field;
}

export interface BaseFieldOptions extends MobileSPIOptions {
  /**
   * 当前视图类型
   */
  viewType?: ViewType | ViewType[];
  /**
   * 组件名称
   */
  widget?: string | string[];
  /**
   * 字段业务类型
   */
  ttype?: ModelFieldType | ModelFieldType[];
  /**
   * 是否多值
   */
  multi?: boolean;
  /**
   * 指定模型
   */
  model?: string | string[];
  /**
   * 指定视图名称
   */
  viewName?: string | string[];
  /**
   * 指定字段name
   */
  name?: string;
}

export type HandlerEvent = (field: BaseFieldWidget) => void;

/**
 * 单字段组件
 */
@SPI.Base(Symbol('Field'), ['viewType', 'ttype', 'multi', { key: 'widget', weight: 999 }, 'model', 'viewName', 'name'])
export class BaseFieldWidget<
  Value = unknown,
  Field extends RuntimeModelField = RuntimeModelField,
  Props extends BaseFieldProps<Field> = BaseFieldProps<Field>
> extends BaseFormItemWidget<Value, Props> {
  protected $$innerWidgetType = InnerWidgetType.Field;

  public static Token: SPITokenFactory<BaseFieldOptions>;

  public static Selector: SPISingleSelector<BaseFieldOptions, Constructor<BaseFieldWidget>>;

  protected runtimeField: Field | undefined;

  @Widget.Reactive()
  public get field(): Field {
    const field = this.runtimeField;
    if (!field) {
      throw new Error('Invalid field define.');
    }
    return field;
  }

  @Widget.Reactive()
  public get label(): string | undefined {
    const label = super.label;
    if (
      isEmpty(label) &&
      (Expression.isExpressionStr(this.getDsl().label! as string) ||
        Expression.hasKeywords(this.getDsl().label! as string))
    ) {
      // 有表达式，且计算结果为空的时候需要显示空
      return '';
    }
    return super.label || this.field.label || this.field.displayName;
  }

  // FIXME df
  @Widget.Reactive()
  public get fieldLabel() {
    if (this.field) {
      const { label, displayName, name } = this.field;
      if (isNil(label)) {
        return displayName || name;
      }
      if (BooleanHelper.isFalse(label)) {
        return '';
      }
      return this.label;
    }
    return this.label;
  }

  @Widget.Reactive()
  public get required(): boolean {
    if (this.viewType === ViewType.Detail) {
      return false;
    }
    return super.required;
  }

  @Widget.Reactive()
  public get readonly(): boolean {
    if (this.viewType === ViewType.Search) {
      return false;
    }
    if (this.viewType === ViewType.Detail) {
      return true;
    }
    return super.readonly;
  }

  public initialize(props: Props) {
    super.initialize(props);
    this.runtimeField = props.field;
    return this;
  }

  protected get isSkipValidator(): boolean {
    if (this.viewType === ViewType.Search) {
      return true;
    }
    return super.isSkipValidator;
  }

  /**
   * 具体校验逻辑
   * @param needCheckedValue
   */
  protected async validatorSpecific(needCheckedValue: any): Promise<ValidatorInfo> {
    if (this.isSkipValidator) {
      return this.validatorSkip();
    }
    if (this.required) {
      if (isValidateEmpty(needCheckedValue)) {
        return this.validatorError();
      }
    }

    // 正则校验
    const xmlPatternType = this.getDsl().patternType as string;
    const patternType = this.executeExpression(xmlPatternType);
    let { pattern, tips = '' } = this.getDsl();
    pattern = this.executeExpression(pattern as string, pattern);
    if (!isValidateEmpty(patternType)) {
      const realType = patternType as string;
      const patternObj = CommonPatternMap.get(realType) as FieldPattern;
      if (!isEmpty(patternObj)) {
        pattern = patternObj.pattern;
        tips = patternObj.errorMsg;
      }
    }
    if (pattern && !isEmptyValue(needCheckedValue)) {
      let reg: RegExp;
      const matchedCompleteRegExpStr = pattern.match(/^(\/.*\/)(.*)?$/);

      // 普通字符串
      if (!matchedCompleteRegExpStr) {
        reg = new RegExp(pattern);
      } else {
        const regExpStr = matchedCompleteRegExpStr[1];
        const flags = matchedCompleteRegExpStr[2];

        // 符合正则表达式语法的字符串，如：`/^[0-9]$/ig`
        reg = new RegExp(regExpStr.slice(1, -1), flags);
      }

      if (!reg.test(needCheckedValue as string)) {
        return this.validatorError(this.executeExpression(tips, tips) || translateValueByKey('校验失败'));
      }
    }

    return super.validator();
  }

  @Widget.Method()
  public change(val: Value | null | undefined) {
    super.change(val);
    this.notify(LifeCycleTypes.ON_FIELD_CHANGE);
  }

  @Widget.Method()
  public focus() {
    super.focus();
    this.notify(LifeCycleTypes.ON_FIELD_FOCUS);
  }

  @Widget.Method()
  public blur() {
    super.blur();
    this.notify(LifeCycleTypes.ON_FIELD_BLUR);
  }

  public async executeValidator(): Promise<ValidatorInfo> {
    this.notify(LifeCycleTypes.ON_FIELD_VALIDATE_START);
    const result = await super.executeValidator();
    if (isValidatorSuccess(result)) {
      this.notify(LifeCycleTypes.ON_FIELD_VALIDATE_SUCCESS);
    } else if (isValidatorError(result)) {
      this.notify(LifeCycleTypes.ON_FIELD_VALIDATE_FAILED);
    }
    this.notify(LifeCycleTypes.ON_FIELD_VALIDATE_END);
    return result;
  }

  public submit(submitValue: SubmitValue): ReturnPromise<Record<string, unknown> | SubmitRelationValue | undefined> {
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, this.value);
  }

  public validator(): Promise<ValidatorInfo> {
    return this.validatorSpecific(this.getValue());
  }

  protected defaultComputeTrigger: ComputeTrigger[] = [ComputeTrigger.BLUR];

  @Widget.Reactive()
  public get computeTrigger(): ComputeTrigger[] {
    const { computeTrigger } = this.getDsl();
    if (!isEmpty(computeTrigger) && isString(computeTrigger)) {
      return computeTrigger.split(',').map((v) => v.trim().toLowerCase() as ComputeTrigger);
    }
    return this.defaultComputeTrigger;
  }

  public executeCompute(trigger: ComputeTrigger) {
    // fixme @zbh 20231125 表达式运行时计算
    // if (!this.computeTrigger.includes(trigger)) {
    //   return;
    // }
    // const formData = this.formData || {};
    // this.rootComputeContext?.compute(
    //   {
    //     activeRecords: [formData],
    //     rootRecord: this.rootData?.[0] || {},
    //     openerRecord: this.openerActiveRecords?.[0] || {},
    //     scene: this.scene,
    //     activeRecord: formData
    //   },
    //   this.field
    // );
  }

  protected $$beforeCreated() {
    super.$$beforeCreated();
    this.notify(LifeCycleTypes.ON_FIELD_BEFORE_CREATED);
  }

  protected $$created() {
    super.$$created();
    this.notify(LifeCycleTypes.ON_FIELD_CREATED);
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.notify(LifeCycleTypes.ON_FIELD_BEFORE_MOUNT);
  }

  protected $$mounted() {
    super.$$mounted();
    this.fieldWidgetMounted?.(this);
    this.notify(LifeCycleTypes.ON_FIELD_MOUNTED);
  }

  protected $$beforeUpdate() {
    super.$$beforeUpdate();
    this.notify(LifeCycleTypes.ON_FIELD_BEFORE_UPDATE);
  }

  protected $$updated() {
    super.$$updated();
    this.notify(LifeCycleTypes.ON_FIELD_UPDATED);
  }

  protected $$beforeUnmount() {
    super.$$beforeUnmount();
    this.notify(LifeCycleTypes.ON_FIELD_BEFORE_UNMOUNT);
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.fieldWidgetUnmounted?.(this);
    this.notify(LifeCycleTypes.ON_FIELD_UNMOUNTED);
  }

  @Widget.Method()
  @Widget.Inject()
  protected fieldWidgetMounted: ((widget: PathWidget) => void) | undefined;

  @Widget.Method()
  @Widget.Inject()
  protected fieldWidgetUnmounted: ((widget: PathWidget) => void) | undefined;

  protected ownEventListeners: Record<LifeCycleTypes, Array<HandlerEvent>> = {} as any;

  /**
   * 监听字段的事件
   * @param  event 事件名 / 事件对象
   * @param  handler? 回调函数
   *
   * @example
   *
   * 单个事件监听
   * fieldWidget.on('change', (fieldInstance) => {})
   * fieldWidget.on('blur', (fieldInstance) => {})
   *
   */
  public on(event: { [key in FieldEventName]?: HandlerEvent }): void;

  /**
   * 多个事件监听
   *
   * @example
   *
   * fieldWidget.on({
   *  change(fieldInstance) => {},
   *  blur(fieldInstance) => {},
   * })
   */
  public on(event: FieldEventName, handler: HandlerEvent): void;

  public on(event: FieldEventName | { [key in FieldEventName]?: HandlerEvent }, handler?: HandlerEvent) {
    let handlers: { [key in FieldEventName]?: HandlerEvent };

    if (isString(event)) {
      if (!isFunction(handler)) {
        return;
      }

      handlers = { [event]: handler };
    } else {
      if (!isPlainObject(event)) {
        return;
      }
      handlers = event;
    }

    Object.entries(handlers).forEach(([key, h]) => {
      const value = FieldEventNames[key];

      if (value) {
        if (this.ownEventListeners[value]) {
          this.ownEventListeners[value].push(h);
        }

        this.ownEventListeners[value] = [h];
      }
    });
  }

  protected notify(type: LifeCycleTypes) {
    try {
      // 字段内部监听
      if (this.ownEventListeners[type]) {
        this.ownEventListeners[type].forEach((h) => h(this));
      }

      const { view, field } = this;
      if (field?.name && view?.name) {
        // 全局生命周期监听
        LifeCycleHeart.publish<BaseFieldWidget>(type, `${view.name}:${field.name}`, this);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
