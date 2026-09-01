import {
  type ActiveRecord,
  GroupStatisticsEnum,
  isAllowGrouping,
  isAllowSortable,
  isRelatedField,
  isRuntimeClientAction,
  type RuntimeModelField
} from '@oinone/kunlun-engine';
import { type FieldEventName, FieldEventNames, LifeCycleHeart, LifeCycleTypes } from '@oinone/kunlun-event';
import { Expression, ExpressionKeyword, type ExpressionRunParam } from '@oinone/kunlun-expression';
import { isEmptyValue, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, Optional, StringHelper } from '@oinone/kunlun-shared';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import {
  type ActiveEditorContext,
  type RenderCellContext,
  type RowContext,
  TableEditorMode,
  VxeTableHelper
} from '@oinone/kunlun-vue-ui';
import { useClick } from '@oinone/kunlun-vue-ui-common';
import { type ActiveRecordsWidgetProps, InnerWidgetType, Widget } from '@oinone/kunlun-vue-widget';
import { isBoolean, isFunction, isNaN, isNil, isPlainObject, isString, toString } from 'lodash-es';
import { createVNode, type VNode, withModifiers } from 'vue';
import type { VxeTableDefines } from 'vxe-table';
import { ActionWidget } from '../../action/component/action/ActionWidget';
import { ActionClickMethod } from '../../action/component/typing';
import { EditorField } from '../../tags/internal';
import type { UserTablePrefer } from '../../typing';
import { getTableColumnFixed, getTableColumnWidth } from '../../util';
import { getClickActionInfo } from '../helper';
import { BaseTableQuickOperationColumnWidget } from './BaseTableQuickOperationColumnWidget';
import DefaultGroupCell from './DefaultGroupCell.vue';

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
> extends BaseTableQuickOperationColumnWidget<Value, Props> {
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
  public get columnType() {
    if (this.isExpandOperationField) {
      return 'expand';
    }
    return super.columnType;
  }

  @Widget.Reactive()
  public get minWidth() {
    return Optional.ofNullable(this.getDsl().minWidth).orElseGet(() => this.computeDefaultMinWidth());
  }

  @Widget.Reactive()
  public get width() {
    const { fieldWidth } = this.userPrefer || ({} as UserTablePrefer);
    return getTableColumnWidth(fieldWidth, this.itemData, super.width || this.cellWidth);
  }

  @Widget.Reactive()
  public get fixed(): string | boolean | undefined {
    const userPrefer = this.userPrefer || ({} as UserTablePrefer);
    return getTableColumnFixed(userPrefer, this.itemData, super.fixed);
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected expandOperationField: string | undefined;

  @Widget.Reactive()
  public get isExpandOperationField(): boolean {
    return this.expandOperationField === this.itemData;
  }

  @Widget.Method()
  public className(context: RenderCellContext): string | string[] | undefined {
    const { field } = this;
    const classList = [`${DEFAULT_PREFIX}-column-${field.ttype.toLowerCase()}`];
    if (isRelatedField(field)) {
      classList.push(`${DEFAULT_PREFIX}-column-${field.relatedTtype.toLowerCase()}`);
    }
    if (this.isExpandOperationField) {
      classList.push(`${DEFAULT_PREFIX}-column-expandable`);
    }
    return StringHelper.append(classList, super.className(context)).join(' ');
  }

  @Widget.Reactive()
  public get sortable(): boolean {
    if (this.isExpandOperationField) {
      return false;
    }
    const sortable = BooleanHelper.toBoolean(this.getDsl().sortable);
    if (sortable == null) {
      if (!this.tableSortable) {
        return false;
      }
      return this.defaultSortable;
    }
    return sortable;
  }

  @Widget.Reactive()
  protected get defaultSortable() {
    return isAllowSortable(this.field);
  }

  @Widget.Reactive()
  public get enableGrouping(): boolean {
    const enableGrouping = BooleanHelper.toBoolean(this.getDsl().enableGrouping);
    if (enableGrouping == null) {
      if (!this.tableEnableGrouping) {
        return false;
      }
      return this.defaultEnableGrouping;
    }
    return enableGrouping || false;
  }

  @Widget.Reactive()
  protected get defaultEnableGrouping() {
    return isAllowGrouping(this.field);
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
    if (this.isExpandOperationField) {
      return false;
    }
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
  public compute(context: RowContext): Value | null | undefined {
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
    const currentValue = this.getValue(context);
    const isEqual = JSON.stringify(computeResult) === JSON.stringify(currentValue);
    if (typeof computeResult === 'object' && isEqual) {
      // []({}) == []({}) 和 []({}) === []({})结果均为false, 所以会导致表达式无限执行
      return currentValue;
    }
    if (isRelatedField(this.field) && !isEqual) {
      if (isEmptyValue(computeResult)) {
        computeResult = currentValue;
      }
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
  protected editorConfirmText(context: RowContext): string | undefined {
    return Optional.ofNullable(super.editorConfirmText(context))
      .map((v) => this.executeExpression<string>(context.data, v))
      .orElse(undefined);
  }

  @Widget.Method()
  public renderEditSlot(context: RowContext): VNode[] | string {
    if (this.invisible || !this.template) {
      return [];
    }

    const column = (context.origin as any).column as VxeTableDefines.ColumnInfo;

    const data = [context.data];
    const rowKey = VxeTableHelper.getKey(context.data) || context.index;
    const vnode = createVNode(EditorField, {
      ...this.template,
      key: `${rowKey}-${this.getHandle()}`,
      dslDefinition: {
        ...this.template,
        placeholder: column.title || this.template.placeholder
      },
      parentHandle: this.getHandle(),
      dataSource: data,
      activeRecords: data,
      rowIndex: context.index,
      inline: true,
      watchActiveRecords: this.editorMode === TableEditorMode.table
    });
    if (!vnode) {
      return [];
    }
    return [vnode];
  }

  public isExpressionString(expression?: string) {
    /**
     * 如果表达式全是英文 / 中文，则不需要进行表达式解析
     */
    if (typeof expression === 'string' && (/^[a-zA-Z]+$/.test(expression) || /^[\u4e00-\u9fa5]+$/.test(expression))) {
      return false;
    }

    return true;
  }

  public executeExpression<T>(
    activeRecord: ActiveRecord | undefined,
    expression: string,
    errorValue?: T
  ): T | string | undefined {
    if (expression === null || expression === undefined) {
      return typeof errorValue === 'boolean' ? errorValue : errorValue || expression;
    }

    if (!this.isExpressionString(expression)) {
      return expression;
    }

    return Expression.run(
      {
        activeRecords: [activeRecord || {}],
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene: this.scene,
        parentRecord: this.parentViewActiveRecords?.[0] || {}
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
    this.viewState?.pushField(this.currentHandle);
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
    this.viewState?.popField(this.currentHandle);
    this.fieldWidgetUnmounted?.(this);
    this.notify(LifeCycleTypes.ON_FIELD_UNMOUNTED);
  }

  /**
   * @deprecated widget finder please this.viewState.fields
   */
  @Widget.Method()
  @Widget.Inject()
  protected fieldWidgetMounted: ((widget: BaseTableFieldWidget) => void) | undefined;

  /**
   * @deprecated widget finder please this.viewState.fields
   */
  @Widget.Method()
  @Widget.Inject()
  protected fieldWidgetUnmounted: ((widget: BaseTableFieldWidget) => void) | undefined;

  private ownEventListeners: Record<LifeCycleTypes, Array<HandlerEvent>> = {} as any;

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
        LifeCycleHeart.publish<BaseTableFieldWidget>(type, `${view.name}:${field.name}`, this);
      }
    } catch (error) {
      console.error(error);
    }
  }

  protected getClickAction(context: RowContext): ActionWidget | undefined {
    const clickActionInfo = getClickActionInfo(this.model.model, this.getDsl().clickActionName);
    if (!clickActionInfo) {
      return undefined;
    }
    const { name: clickActionName } = clickActionInfo;
    let enableClick = BooleanHelper.toBoolean(this.getDsl().enableClick);
    if (enableClick == null) {
      enableClick = true;
    }
    if (!enableClick) {
      return undefined;
    }
    return (this.viewState?.getActionBarState(context.index)?.actions || [])
      .map((handle) => Widget.select<ActionWidget>(handle))
      .find((v) => {
        const action = v?.action;
        if (!action) {
          return false;
        }
        if (isRuntimeClientAction(action)) {
          return action.name === clickActionName || action.fun === clickActionName;
        }
        return action.name === clickActionName;
      });
  }

  protected onClickAction(context: RowContext, action: ActionWidget) {
    action.getOperator<ActionWidget>().click();
  }

  @Widget.Method()
  protected wrapperToFieldAction(nodes: VNode[] | string, context: RowContext) {
    if (!(typeof nodes === 'string')) {
      return nodes;
    }
    const clickAction = this.getClickAction(context);
    if (!clickAction) {
      return nodes;
    }
    let { clickMethod } = this;
    if (clickMethod == null) {
      clickMethod = ActionClickMethod.click;
    }
    const props: Record<string, unknown> = {
      class: 'default-table-hyperlinks'
    };
    switch (clickMethod) {
      case ActionClickMethod.click:
        const { onMousedown, onMouseup } = useClick(
          withModifiers(() => this.onClickAction.bind(this)(context, clickAction), ['stop'])
        );
        props.onMousedown = onMousedown;
        props.onMouseup = onMouseup;
        break;
      case ActionClickMethod.dblclick:
        props.onDblclick = withModifiers(() => this.onClickAction.bind(this)(context, clickAction), ['stop']);
        break;
      default:
        console.error('Unknown click method', clickMethod);
        return nodes;
    }
    return this.renderFieldAction(props, nodes);
  }

  protected renderFieldAction(props: Record<string, unknown>, nodes: string | VNode[]): VNode[] {
    return [createVNode('div', props, [createVNode('a', {}, nodes)])];
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    return toString(this.compute(context));
  }

  // region 分组统计

  /**
   *
   * @see {@link TableWidget#loadGroupStatistics}
   */
  @Widget.Method()
  @Widget.Inject()
  protected loadGroupStatistics!: (
    row: ActiveRecord,
    field: RuntimeModelField,
    groupStatistics: GroupStatisticsEnum
  ) => Promise<string | undefined>;

  /**
   * 渲染分组展开行的单元格
   */
  @Widget.Method()
  protected renderGroupCellSlot(context: RowContext) {
    return [
      createVNode(DefaultGroupCell, {
        context,
        model: this.model,
        field: this.field,
        loadGroupStatistics: this.loadGroupStatistics
      })
    ];
  }

  // endregion

  /**
   * @deprecated invalid property
   */
  @Widget.Reactive()
  public get relationSortFields(): string[] | undefined {
    // const { field } = this;
    // if (isRelationField(field)) {
    //   return field.sortFields || field.referencesModel?.labelFields;
    // }
    return undefined;
  }
}
