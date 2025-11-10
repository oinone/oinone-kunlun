import { SubmitValue } from '@oinone/kunlun-engine';
import { IGroup } from '@oinone/kunlun-service';
import { BooleanHelper, CallChaining, ObjectUtils, Optional } from '@oinone/kunlun-shared';
import {
  ActiveEditorContext,
  GROUP_TREE_KEY,
  OioTableInstance,
  RenderCellContext,
  RowContext,
  TableEditorCloseTrigger,
  TableEditorMode,
  TableEditorTrigger
} from '@oinone/kunlun-vue-ui';
import { ConfirmType, PopconfirmPlacement } from '@oinone/kunlun-vue-ui-antd';
import { ActiveRecordsWidgetProps, Widget } from '@oinone/kunlun-vue-widget';
import { isNil, isString, toString } from 'lodash-es';
import { toRaw, VNode } from 'vue';
import { fetchPopconfirmPlacement } from '../../typing';
import { executeConfirm } from '../../util';
import type { TableWidget } from '../../view';
import { BaseDataWidget } from '../common';
import { FieldWidgetComponentFunction } from '../types';
import DefaultTableColumn from './DefaultTableColumn.vue';

export abstract class BaseTableColumnWidget<
  Value = unknown,
  Props extends ActiveRecordsWidgetProps = ActiveRecordsWidgetProps
> extends BaseDataWidget<Props> {
  private tableInstance: OioTableInstance | undefined;

  public getTableInstance() {
    return this.tableInstance;
  }

  @Widget.Method()
  private setTableInstance(tableInstance: OioTableInstance | undefined) {
    this.tableInstance = tableInstance;
  }

  @Widget.Method()
  @Widget.Inject()
  protected getFieldWidgetComponent: FieldWidgetComponentFunction | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected submitCallChaining: CallChaining<SubmitValue> | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected validatorCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected tableForceEditable: boolean | undefined;

  public initialize(props) {
    super.initialize(props);
    const injectComp = this.getFieldWidgetComponent?.();
    if (injectComp) {
      this.setComponent(toRaw(injectComp));
    } else {
      this.setComponent(DefaultTableColumn);
    }
    return this;
  }

  public getValue(context: RowContext): Value | null | undefined {
    return context.data[this.itemName] as Value;
  }

  public setValue(context: RowContext, val: Value | null | undefined) {
    context.data[this.itemName] = val;
  }

  public compute(context: RowContext): Value | null | undefined {
    return this.getValue(context);
  }

  @Widget.Reactive()
  public get columnType(): string | undefined {
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
    return this.getDsl().className || this.getDsl().class;
  }

  @Widget.Method()
  public headerClassName(context: RenderCellContext): string | string[] | undefined {
    return this.getDsl().headerClassName || this.getDsl().class;
  }

  @Widget.Method()
  public footerClassName(context: RenderCellContext): string | string[] | undefined {
    return this.getDsl().footerClassName || this.getDsl().class;
  }

  @Widget.Reactive()
  public get resizable(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().resizable);
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

  /**
   * 当前视图使用分组结构展示
   * 启动了分组并且有分组字段
   *
   * @see {@link BaseElementListViewWidget}
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected enabledGroupView: boolean | undefined;

  /**
   * 表格配置 -> 启用分组
   * @see {@link BaseElementListViewWidget}
   */
  @Widget.Reactive()
  @Widget.Inject('enableGrouping')
  protected tableEnableGrouping!: boolean;

  /**
   * 分组字段
   * @see {@link BaseElementListViewWidget}
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected groupList!: IGroup[];

  /**
   * 当前字段是否启动的分组
   */
  @Widget.Reactive()
  public get enableGrouping(): boolean {
    const enableGrouping = BooleanHelper.toBoolean(this.getDsl().enableGrouping);
    if (enableGrouping == null) {
      return this.tableEnableGrouping || false;
    }
    return enableGrouping;
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
  protected existExpandRow: boolean | undefined;

  @Widget.Reactive()
  @Widget.Inject('editable')
  protected tableEditable: boolean | undefined;

  /**
   * <h3>可编辑</h3>
   */
  @Widget.Reactive()
  public get editable(): boolean {
    if (this.readonly) {
      return false;
    }
    if (this.currentEditorContext?.forceEditable) {
      return true;
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
  public get editorAutofocus() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().editorAutofocus)).orElse(true);
  }

  @Widget.Method()
  protected get editRender(): Record<string, unknown> | undefined {
    if (this.editorAutofocus) {
      return { autofocus: this.onAutofocus.bind(this) };
    }
    return undefined;
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
  @Widget.Inject('rowEditorClosedBefore')
  protected tableRowEditorClosedBefore: ((context: RowContext | undefined) => Promise<boolean>) | undefined;

  @Widget.Method()
  @Widget.Inject('rowEditorClosed')
  protected tableRowEditorClosed: ((context: RowContext | undefined) => Promise<boolean>) | undefined;

  @Widget.Method()
  protected async rowEditorClosedByEnter(context: RowContext | undefined): Promise<boolean> {
    if (context && !(await this.editorValidateConfirm(context))) {
      return false;
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
  protected editorEnableConfirm(context: RowContext): boolean {
    const enableConfirm = BooleanHelper.toBoolean(this.getDsl().editorEnableConfirm);
    if (isNil(enableConfirm)) {
      return true;
    }
    return enableConfirm;
  }

  @Widget.Method()
  protected editorConfirmType(context: RowContext): ConfirmType | undefined {
    const { editorConfirmType } = this.getDsl();
    if (editorConfirmType) {
      const realConfirmType = ConfirmType[editorConfirmType];
      if (realConfirmType) {
        return realConfirmType;
      }
      return undefined;
    }
    return ConfirmType.POPPER;
  }

  @Widget.Method()
  protected editorConfirm(context: RowContext): string | undefined {
    if (this.editorEnableConfirm(context) && this.editorConfirmType(context) === ConfirmType.POPPER) {
      return this.editorConfirmText(context);
    }
    return undefined;
  }

  @Widget.Method()
  protected async editorCondition(context: RowContext): Promise<boolean | undefined> {
    if (ObjectUtils.isNotEmpty(this.editorConfirm(context))) {
      if (!(await this.tableRowEditorClosedBefore?.(context))) {
        return undefined;
      }
      return true;
    }
    return false;
  }

  @Widget.Method()
  protected editorConfirmText(context: RowContext): string | undefined {
    return Optional.ofNullable(this.getDsl().editorConfirmText || this.getDsl().editorConfirm)
      .map(toString)
      .orElse(undefined);
  }

  @Widget.Method()
  protected editorConfirmPosition(context: RowContext): PopconfirmPlacement {
    return fetchPopconfirmPlacement(this.getDsl().editorConfirmPosition) || PopconfirmPlacement.BM;
  }

  @Widget.Method()
  protected editorEnterText(context: RowContext): string | undefined {
    const { editorEnterText } = this.getDsl();
    if (editorEnterText) {
      return editorEnterText;
    }
    return undefined;
  }

  @Widget.Method()
  protected editorCancelText(context: RowContext): string | undefined {
    const { editorCancelText } = this.getDsl();
    if (editorCancelText) {
      return editorCancelText;
    }
    return undefined;
  }

  @Widget.Method()
  public async editorValidateConfirm(context: RowContext): Promise<boolean> {
    if (this.editorEnableConfirm(context) && this.editorConfirmType(context) === ConfirmType.MODAL) {
      const confirmText = this.editorConfirmText(context);
      if (confirmText) {
        if (!(await this.tableRowEditorClosedBefore?.(context))) {
          return false;
        }
        return executeConfirm({
          confirm: confirmText,
          enterText: this.editorEnterText(context),
          cancelText: this.editorCancelText(context)
        });
      }
    }
    return true;
  }

  @Widget.Method()
  public onAutofocus(params: { cell: HTMLElement }) {
    const { cell } = params;
    if (!cell) {
      return;
    }
    const input = cell.querySelector('input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  /**
   * 修改分组配置
   *  @see {@link BaseElementListViewWidget}
   */
  @Widget.Method()
  @Widget.Inject()
  public onGroupChange!: (list: IGroup[]) => void;

  @Widget.Reactive()
  @Widget.Inject('expandTreeFieldColumn')
  protected tableExpandTreeFieldColumn: string | undefined;

  @Widget.Reactive()
  @Widget.Inject('groupTitleEmptyStyle')
  protected tableGroupTitleEmptyStyle: string | undefined;

  @Widget.Reactive()
  protected get treeNode(): boolean | undefined {
    let treeNode = BooleanHelper.toBoolean(this.getDsl().treeNode);
    if (treeNode == null && this.tableExpandTreeFieldColumn && this.tableExpandTreeFieldColumn === this.itemData) {
      treeNode = true;
    }
    return treeNode;
  }

  protected getColumnWidgets(): BaseTableColumnWidget[] {
    return (this.getParentWidget() as TableWidget).getColumnWidgets();
  }

  protected renderGroupTitleEmptyStyle(context: RowContext): VNode[] | string {
    return this.tableGroupTitleEmptyStyle || '';
  }

  @Widget.Method()
  protected dynamicRenderDefaultSlot(context: RowContext): ((context: RowContext) => VNode[] | string) | undefined {
    const groupProps = (context.data as Record<string, { field: string; value: unknown }>)[GROUP_TREE_KEY.PROPS_KEY];
    const { tableExpandTreeFieldColumn } = this;
    if (!groupProps || !tableExpandTreeFieldColumn) {
      return undefined;
    }
    const { field, value } = groupProps;
    if (!field || value == null || (typeof value === 'string' && !value)) {
      return this.renderGroupTitleEmptyStyle.bind(this);
    }
    const column = this.getColumnWidgets().find((v) => v.itemData === field);
    if (!column) {
      return undefined;
    }
    const internalRender = (column.renderGroupTitleSlot || column.renderDefaultSlot)?.bind(column);
    if (!internalRender) {
      return undefined;
    }
    return (context: RowContext) => {
      return internalRender({
        ...context,
        data: {
          [field]: value
        }
      });
    };
  }

  public renderDefaultSlot?(context: RowContext): VNode[] | string;

  public renderEditSlot?(context: RowContext): VNode[] | string;

  public renderContentSlot?(context: RowContext): VNode[] | string;

  public renderHeaderSlot?(context: RowContext): VNode[] | string;

  public renderGroupTitleSlot?(context: RowContext): VNode[] | string;

  /**
   * @deprecated invalid prop in the table column
   */
  @Widget.Reactive()
  public get readonly() {
    return BooleanHelper.toBoolean(this.getDsl().readonly) || false;
  }
}
