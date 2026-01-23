import { Optional } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { hasRowActionBarViewState, OioAnyViewState, Widget } from '@oinone/kunlun-vue-widget';
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
  public rowIndex!: number;

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

  @Widget.Reactive()
  @Widget.Inject()
  protected operatorColumnDirection: string | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected operatorColumnButtonType: string | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get buttonType(): string | undefined {
    return Optional.ofNullable(super.buttonType).orElse(this.operatorColumnButtonType?.toLowerCase?.());
  }

  protected $$initViewStatePosition(state: OioAnyViewState): void {
    state.__position.push({ handle: this.currentHandle, slotName: this.getSlotName(), rowIndex: this.rowIndex });
  }

  protected $$initViewState(state: OioAnyViewState): void {
    const { currentHandle, rowIndex } = this;
    if (hasRowActionBarViewState(state)) {
      if (!state.inlineActionBars) {
        state.inlineActionBars = [];
      }
      state.inlineActionBars[rowIndex] = state.createActionBarState({
        handle: currentHandle,
        inline: true
      });
    }
    if (!this.actionBarState) {
      this.actionBarState = this.viewState?.getActionBarState(rowIndex);
    }
  }

  protected $$unmounted() {
    super.$$unmounted();
    const { viewState, currentHandle } = this;
    if (viewState && hasRowActionBarViewState(viewState)) {
      const { inlineActionBars } = viewState;
      if (inlineActionBars) {
        const rowIndex = inlineActionBars.findIndex((v) => v.handle === currentHandle);
        if (rowIndex !== -1) {
          inlineActionBars.splice(rowIndex, 1);
          viewState.inlineActionBars = [...inlineActionBars];
        }
      }
    }
  }
}
