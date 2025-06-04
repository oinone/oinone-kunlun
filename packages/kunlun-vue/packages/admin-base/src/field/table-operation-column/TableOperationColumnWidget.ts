import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { BooleanHelper, Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { RenderCellContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget, getTableThemeConfig } from '../../basic';
import { BaseTableColumnWidget } from '../../basic/table-column';
import { OperationColumnDirection, UserTablePrefer } from '../../typing';
import { getTableColumnWidth } from '../../util';
import TableOperationColumn from './TableOperationColumn.vue';

function hasAction(dsl: DslDefinition | undefined) {
  const widgets = dsl?.widgets || [];
  for (const widget of widgets) {
    switch (widget.dslNodeType as DslDefinitionType) {
      case DslDefinitionType.VIEW:
      case DslDefinitionType.TEMPLATE:
        continue;
      case DslDefinitionType.ACTION:
        return true;
    }
    if (hasAction(widget)) {
      return true;
    }
  }
  return false;
}

/**
 * @deprecated deleted
 */
export const tableOperationColumnWidgetName = 'TableOperationColumnWidget';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['operation-column', 'OperationColumn', 'OperationColumn', 'TableOperationColumnWidget']
  })
)
export class TableOperationColumnWidget extends BaseTableColumnWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(TableOperationColumn);
    return this;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected operatorColumnDirection: OperationColumnDirection | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected operatorColumnWidth: number | string | undefined;

  @Widget.Reactive()
  public get width() {
    const { fieldWidth } = this.userPrefer || ({} as UserTablePrefer);
    let width = getTableColumnWidth(fieldWidth, this.itemData, undefined);
    if (width == null) {
      width = Optional.ofNullable(super.width).orElseGet(() =>
        Optional.ofNullable(this.operatorColumnWidth).orElseGet(
          () => getTableThemeConfig()?.column?.operation?.width || 165
        )
      );
    }
    return width;
  }

  @Widget.Reactive()
  public get minWidth(): string | number | undefined {
    return Optional.ofNullable(super.minWidth).orElseGet(
      () => getTableThemeConfig()?.column?.operation?.minWidth || 120
    );
  }

  @Widget.Reactive()
  public get direction(): OperationColumnDirection | undefined {
    return Optional.ofNullable(this.getDsl().direction).orElse(this.operatorColumnDirection);
  }

  @Widget.Reactive()
  public get invisible() {
    const invisible = BooleanHelper.toBoolean(this.getDsl().invisible);
    if (invisible) {
      return true;
    }
    return !hasAction(this.template);
  }

  @Widget.Reactive()
  public get itemData(): string {
    return '$$internalOperator';
  }

  @Widget.Reactive()
  @Widget.Inject()
  private userPrefer?: UserTablePrefer;

  @Widget.Method()
  public headerClassName(context: RenderCellContext): string | string[] | undefined {
    return StringHelper.append(['oio-column', 'table-header-column-operation'], super.headerClassName(context));
  }
}
