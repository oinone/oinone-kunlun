import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { RenderCellContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../basic';
import DefaultColgroupColumn from './DefaultColgroupColumn.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['colgroup']
  })
)
export class TableColgroupColumnWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultColgroupColumn);
    return this;
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
  public get invisible() {
    return this.clientInvisible || BooleanHelper.toBoolean(this.getDsl().invisible) || false;
  }

  @Widget.Reactive()
  protected get clientInvisible(): boolean {
    return !this.isSupportCurrentClient;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected existExpandRow: boolean | undefined;
}
