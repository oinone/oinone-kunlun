import { ActiveRecord, isRelatedField, isRelationField, RuntimeModelField } from '@kunlun/engine';
import { FieldEventName, FieldEventNames, LifeCycleHeart, LifeCycleTypes } from '@kunlun/event';
import { Expression, ExpressionKeyword, ExpressionRunParam } from '@kunlun/expression';
import { isEmptyValue, ViewMode, ViewType } from '@kunlun/meta';
import { BooleanHelper, Optional, StringHelper } from '@kunlun/shared';
import { DEFAULT_PREFIX } from '@kunlun/vue-ui-mobile-vant';
import { ActiveEditorContext, RenderCellContext, RowContext } from '../../ui';
import { ActiveRecordsWidgetProps, InnerWidgetType, Widget } from '@kunlun/vue-widget';
import { isBoolean, isFunction, isNaN, isNil, isPlainObject, isString, toString } from 'lodash-es';
import { createVNode, VNode } from 'vue';
import { EditorField } from '../../tags/internal';
import { UserTablePrefer } from '../../typing';
import { BaseTableColumnWidget } from './BaseTableColumnWidget';

export type HandlerEvent = (field: BaseTableFieldWidget) => void;

export interface BaseTableFieldWidgetProps<Field extends RuntimeModelField = RuntimeModelField>
  extends ActiveRecordsWidgetProps {
  viewType: ViewType;
  field: Field;
}

export class BaseTableFieldWidget<
  Value = unknown,
  Field extends RuntimeModelField = RuntimeModelField,
  Props extends BaseTableFieldWidgetProps<Field> = BaseTableFieldWidgetProps<Field>
> extends BaseTableColumnWidget<Value, Props> {
  protected $$innerWidgetType = InnerWidgetType.Field;

  @Widget.Reactive()
  @Widget.Inject()
  protected viewType: ViewType | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected currentEditorContext: ActiveEditorContext | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected viewMode = ViewMode.Editor;

  @Widget.Reactive()
  protected runtimeField: Field | undefined;

  @Widget.Reactive()
  public get field(): Field {
    const field = this.runtimeField;
    if (!field) {
      throw new Error('Invalid field define.');
    }
    return field;
  }

  public initialize(props: Props) {
    super.initialize(props);
    this.runtimeField = props.field;
    return this;
  }

  @Widget.Reactive()
  public get minWidth() {
    return Optional.ofNullable(this.getDsl().minWidth).orElse('100');
  }

  @Widget.Method()
  public className(context: RenderCellContext): string | string[] | undefined {
    const { field } = this;
    const classList = [`${DEFAULT_PREFIX}-column-${field.ttype.toLowerCase()}`];
    if (isRelatedField(field)) {
      classList.push(`${DEFAULT_PREFIX}-column-${field.relatedTtype.toLowerCase()}`);
    }
    return StringHelper.append(classList, this.getDsl().className).join('');
  }

  @Widget.Reactive()
  public get sortable(): boolean {
    const sortable = BooleanHelper.toBoolean(this.getDsl().sortable);
    if (sortable == null) {
      if (!this.tableSortable) {
        return false;
      }
      const { field, relationSortFields } = this;
      const { store } = field;
      if (isRelationField(field)) {
        const { relationStore } = field;
        if (store) {
          return false;
        }
        if (!relationStore) {
          return false;
        }
        return !!relationSortFields && !!relationSortFields.length;
      }
      return store;
    }
    return sortable || false;
  }

  @Widget.Reactive()
  public get relationSortFields(): string[] | undefined {
    // const { field } = this;
    // if (isRelationField(field)) {
    //   return field.sortFields || field.referencesModel?.labelFields;
    // }
    return undefined;
  }

  @Widget.Reactive()
  public get invisible(): boolean {
    return this.clientInvisible || this.dslInvisible || this.userPreferInvisible;
  }

  @Widget.Reactive()
  protected get dslInvisible(): boolean {
    const { invisible } = this.getDsl();
    if (isBoolean(invisible)) {
      return invisible;
    }
    if (isString(invisible)) {
      const expressionInvisible = this.executeExpression<boolean>(undefined, invisible, false);
      if (isBoolean(expressionInvisible)) {
        return expressionInvisible;
      }
      return false;
    }
    return false;
  }

  @Widget.Reactive()
  public get required(): boolean {
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

      const activeRecord = this.currentEditorContext;

      if (activeRecord) {
        return !!this.executeExpression<boolean>(activeRecord.row, required, false);
      }
    }
    return false;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected userPrefer?: UserTablePrefer;

  @Widget.Reactive()
  protected get userPreferInvisible(): boolean {
    if (!this.userPrefer) {
      return false;
    }
    return this.userPrefer?.fieldPrefer?.includes(this.itemData) || false;
  }

  @Widget.Method()
  protected invisibleContent(context: RowContext) {
    const { invisibleContent } = this.getDsl();
    if (isBoolean(invisibleContent)) {
      return invisibleContent;
    }
    if (isString(invisibleContent)) {
      const expressionInvisible = this.executeExpression<boolean>(context.data, invisibleContent, false);
      if (isBoolean(expressionInvisible)) {
        return expressionInvisible;
      }
      return false;
    }
    return false;
  }

  @Widget.Reactive()
  public get editable(): boolean {
    if (this.rootViewRuntimeContext.runtimeContext.view.type === ViewType.Detail) {
      return false;
    }
    return super.editable;
  }

  @Widget.Method()
  public cellEditable(context: RowContext) {
    const { editable, independentlyEditable } = this.getDsl();
    const finalEditable = Optional.ofNullable(editable).orElse(independentlyEditable) as boolean | string | undefined;
    const value = BooleanHelper.toBoolean(finalEditable);
    if (value == null && isString(finalEditable)) {
      const expressionEditable = this.executeExpression<boolean>(context.data, finalEditable, false);
      if (isBoolean(expressionEditable)) {
        return expressionEditable;
      }
      return false;
    }
    return true;
  }

  // fixme @zbh 20221021 计算逻辑拆分
  protected compute(context: RowContext): Value | null | undefined {
    const compute = this.getCompute(context.data);
    if (compute == null || compute === '') {
      return this.getValue(context);
    }
    let computeResult;
    if (isBoolean(compute)) {
      computeResult = compute;
    } else {
      computeResult = this.executeExpression(context.data, compute) as Value;
      if (typeof computeResult === 'number') {
        if (isNaN(computeResult)) {
          computeResult = 0;
        }
      }
    }
    const isEqual = JSON.stringify(computeResult) === JSON.stringify(this.getValue(context));
    if (typeof computeResult === 'object' && isEqual) {
      // []({}) == []({}) 和 []({}) === []({})结果均为false, 所以会导致表达式无限执行
      return this.getValue(context);
    }
    if (isRelatedField(this.field) && (!isEqual || isEmptyValue(computeResult))) {
      computeResult = this.getValue(context);
    }
    this.setValue(context, computeResult as Value);
    return computeResult;
  }

  protected getCompute(data: ActiveRecord): boolean | string | undefined {
    const { field } = this;
    if (!isRelatedField(field)) {
      return field.compute;
    }
    // 若是多值则需要包装一下, 暂支持两层
    let _compute = ExpressionKeyword.activeRecord.toString();
    if (field.related && field.related.length > 0) {
      const mainField = field.related[0];
      const mainFieldData = data[mainField];
      if (field.multi && field.related.length > 1 && Array.isArray(mainFieldData)) {
        const targetField = field.related[1];
        _compute = `LIST_FIELD_VALUES(${_compute}.${mainField},'','${targetField}')`;
        return _compute;
      }
      for (const levelField of field.related) {
        _compute = `${_compute}.${levelField}`;
      }
      return _compute;
    }
    return undefined;
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    return toString(this.compute(context));
  }

  @Widget.Method()
  public renderEditSlot(context: RowContext): VNode[] | string {
    if (this.invisible || !this.template) {
      return [];
    }
    const data = [context.data];
    const vnode = createVNode(EditorField, {
      ...this.template,
      dslDefinition: this.template,
      parentHandle: this.getHandle(),
      dataSource: data,
      activeRecords: data,
      rowIndex: context.index,
      inline: true
    });
    if (!vnode) {
      return [];
    }
    return [vnode];
  }

  public executeExpression<T>(
    activeRecord: ActiveRecord | undefined,
    expression: string,
    errorValue?: T
  ): T | string | undefined {
    return Expression.run(
      {
        activeRecords: [activeRecord || {}],
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene: this.scene
      } as ExpressionRunParam,
      expression,
      errorValue
    );
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
  protected fieldWidgetMounted: ((widget: BaseTableFieldWidget) => void) | undefined;

  @Widget.Method()
  @Widget.Inject()
  protected fieldWidgetUnmounted: ((widget: BaseTableFieldWidget) => void) | undefined;

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
    // 字段内部监听
    if (this.ownEventListeners[type]) {
      this.ownEventListeners[type].forEach((h) => h(this));
    }

    const { view, field } = this;
    if (field?.name && view?.name) {
      // 全局生命周期监听
      LifeCycleHeart.publish<BaseTableFieldWidget>(type, `${view.name}:${field.name}`, this);
    }
  }
}
