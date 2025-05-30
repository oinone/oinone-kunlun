import { SubmitValue } from '@kunlun/engine';
import { BooleanHelper, CallChaining, Optional } from '@kunlun/shared';
import {
  ActiveEditorContext,
  RenderCellContext,
  RowContext,
  TableEditorCloseTrigger,
  TableEditorMode,
  TableEditorTrigger
} from '../../ui';
import { ActiveRecordsWidgetProps, Widget } from '@kunlun/vue-widget';
import { isEmpty, isString } from 'lodash-es';
import { OioNotification } from '@kunlun/vue-ui-mobile-vant';
import { VNode } from 'vue';
import { BaseDataWidget } from '../common';
import DefaultTableColumn from './DefaultTableColumn.vue';

export class BaseTableColumnWidget<
  Value = unknown,
  Props extends ActiveRecordsWidgetProps = ActiveRecordsWidgetProps
> extends BaseDataWidget<Props> {
  @Widget.Reactive()
  @Widget.Inject()
  protected submitCallChaining: CallChaining<SubmitValue> | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected validatorCallChaining: CallChaining<boolean> | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultTableColumn);
    return this;
  }

  protected getValue(context: RowContext): Value | null | undefined {
    return context.data[this.itemData] as Value;
  }

  protected setValue(context: RowContext, val: Value | null | undefined) {
    context.data[this.itemData] = val;
  }

  protected compute(context: RowContext): Value | null | undefined {
    return this.getValue(context);
  }

  @Widget.Reactive()
  public get columnType(): string {
    return this.getDsl().columnType;
  }

  @Widget.Reactive()
  public get width(): string | number | undefined {
    return this.getDsl().width;
  }

  @Widget.Reactive()
  public get minWidth(): string | number | undefined {
    return this.getDsl().minWidth;
  }

  @Widget.Reactive()
  public get label(): string {
    return this.getDsl().label;
  }

  @Widget.Reactive()
  public get align(): string {
    return this.getDsl().align?.toLowerCase?.();
  }

  @Widget.Reactive()
  public get required(): boolean {
    return this.getDsl().required;
  }

  @Widget.Reactive()
  public get headerAlign(): string {
    return this.getDsl().headerAlign?.toLowerCase?.();
  }

  @Widget.Reactive()
  public get footerAlign(): string {
    return this.getDsl().footerAlign?.toLowerCase?.();
  }

  @Widget.Reactive()
  public get fixed(): string | boolean | undefined {
    return this.getDsl().fixed;
  }

  @Widget.Method()
  public className(context: RenderCellContext): string | string[] | undefined {
    return this.getDsl().className;
  }

  @Widget.Method()
  public headerClassName(context: RenderCellContext): string | string[] | undefined {
    return this.getDsl().headerClassName;
  }

  @Widget.Method()
  public footerClassName(context: RenderCellContext): string | string[] | undefined {
    return this.getDsl().footerClassName;
  }

  @Widget.Reactive()
  @Widget.Inject('sortable')
  protected tableSortable: boolean | undefined;

  @Widget.Reactive()
  public get sortable(): boolean {
    const sortable = BooleanHelper.toBoolean(this.getDsl().sortable);
    if (sortable == null) {
      return this.tableSortable || false;
    }
    return sortable;
  }

  @Widget.Reactive()
  public get invisible() {
    return this.clientInvisible || BooleanHelper.toBoolean(this.getDsl().invisible) || false;
  }

  @Widget.Reactive()
  protected get clientInvisible(): boolean {
    return !this.isSupportCurrentClient;
  }

  @Widget.Method()
  protected invisibleContent(context: RowContext) {
    return BooleanHelper.toBoolean(this.getDsl().invisibleContent) || false;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected expandRowIndexes: number[] | undefined;

  @Widget.Reactive()
  protected get existExpandRow(): boolean {
    return !!this.expandRowIndexes?.length;
  }

  @Widget.Reactive()
  @Widget.Inject('editable')
  protected tableEditable: boolean | undefined;

  /**
   * <h3>可编辑</h3>
   */
  @Widget.Reactive()
  public get editable(): boolean {
    if (1 > 0) {
      // 移动端暂不实现行内编辑
      return false;
    }
    const { editable, independentlyEditable } = this.getDsl();
    const finalEditable = Optional.ofNullable(editable).orElse(independentlyEditable) as boolean | string | undefined;
    let value = BooleanHelper.toBoolean(finalEditable);
    if (value == null) {
      value = this.tableEditable || false;
      if (!value && isString(finalEditable)) {
        value = true;
      }
    }
    if (value) {
      const editorContext = this.currentEditorContext;
      if (!editorContext) {
        return true;
      }
      value = editorContext.editableMap[this.path] || false;
    }
    return value;
  }

  /**
   * <h3>单元格可编辑</h3>
   * <ul>当且仅当以下条件成立时, 该方法有效
   *   <li>{@link BaseTableColumnWidget#editable} = true</li>
   *   <li>{@link BaseTableColumnWidget#editorMode} = {@link TableEditorMode#cell}</li>
   * </ul>
   * @param context 行上下文
   */
  @Widget.Method()
  public cellEditable(context: RowContext): boolean {
    return true;
  }

  @Widget.Reactive()
  @Widget.Inject()
  public editorTrigger: TableEditorTrigger | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  public editorMode: TableEditorMode | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  public editorCloseTrigger: TableEditorCloseTrigger | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected currentEditorContext: ActiveEditorContext | undefined;

  @Widget.Method()
  @Widget.Inject('rowEditorClosed')
  protected tableRowEditorClosed: ((context: RowContext | undefined) => Promise<boolean>) | undefined;

  @Widget.Method()
  protected async rowEditorClosedByEnter(context: RowContext | undefined): Promise<boolean> {
    if (this.required) {
      const row = context?.data || {};
      const value = row[this.itemData];

      if (isEmpty(value)) {
        OioNotification.error('错误', `${this.label}必填`);
        return false;
      }
    }

    let res = await this.tableRowEditorClosed?.(context);
    if (res == null) {
      res = true;
    }
    return res;
  }

  @Widget.Method()
  protected async rowEditorClosedByCancel(context: RowContext | undefined): Promise<boolean> {
    if (this.currentEditorContext) {
      this.currentEditorContext.submit = false;
    }

    let res = await this.tableRowEditorClosed?.(context);
    if (res == null) {
      res = true;
    }
    return res;
  }

  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    return [];
  }

  @Widget.Method()
  public renderEditSlot(context: RowContext): VNode[] | string {
    return [];
  }

  @Widget.Method()
  public renderContentSlot(context: RowContext): VNode[] | string {
    return [];
  }
}
