import { SPI } from '@oinone/kunlun-spi';
import { FlexRowJustify } from '@oinone/kunlun-vue-ui-common';
import { OioTableViewState, Widget } from '@oinone/kunlun-vue-widget';
import type { ActionBarWidget, ActionWidget } from '../../action';
import { BaseElementWidget } from '../../basic';
import DefaultViewControl from './DefaultViewControl.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'ViewControl'
  })
)
export class ViewControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultViewControl);
    return this;
  }

  @Widget.Reactive()
  protected get visibleActions(): string[] {
    const actions = (this.viewState as OioTableViewState)?.actionBar?.actions;
    return (
      actions?.filter((v) => {
        const widget = Widget.select<ActionWidget>(v);
        if (widget) {
          return !widget.invisible;
        }
        return false;
      }) || []
    );
  }

  @Widget.Reactive()
  protected get hasActions() {
    return !!this.visibleActions.length;
  }

  @Widget.Reactive()
  protected get actionJustify() {
    let justify: string | undefined;
    const actionBarHandle = (this.viewState as OioTableViewState)?.actionBar?.handle;
    if (actionBarHandle) {
      justify = Widget.select<ActionBarWidget>(actionBarHandle)?.justify;
    }
    if (justify === 'flex-start') {
      return FlexRowJustify.START;
    }
    if (justify === 'flex-end') {
      return FlexRowJustify.END;
    }
    return FlexRowJustify.START;
  }
}
