import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { BaseElementWidget } from '../../../basic';
import { ActionBarWidget, ActionBarWidgetProps } from './ActionBarWidget';

export interface RowActionBarWidgetProps extends ActionBarWidgetProps {
  rowIndex: number;
}

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: [
      'actionBar',
      'action-bar',
      'ActionBar',
      'action-column',
      'ActionColumn',
      'actionColumn',
      'row-action',
      'RowAction',
      'rowAction',
      'row-actions',
      'RowActions',
      'rowActions'
    ],
    inline: true
  })
)
export class RowActionBarWidget<
  Props extends RowActionBarWidgetProps = RowActionBarWidgetProps
> extends ActionBarWidget<Props> {
  public initialize(props: Props) {
    super.initialize(props);
    this.rowIndex = props.rowIndex;
    return this;
  }

  @Widget.Provide()
  @Widget.Reactive()
  protected rowIndex!: number;

  @Widget.Reactive()
  @Widget.Inject('activeCount')
  protected parentActiveCount: number | undefined;

  @Widget.Reactive()
  @Widget.Inject('inlineActiveCount')
  protected parentInlineActiveCount: number | undefined;

  @Widget.Reactive()
  protected get activeCount(): number | undefined {
    if (this.inline) {
      if (isNil(this.parentInlineActiveCount)) {
        return super.activeCount;
      }
      return this.parentInlineActiveCount;
    }
    if (isNil(this.parentActiveCount)) {
      return super.activeCount;
    }
    return this.parentActiveCount;
  }
}
