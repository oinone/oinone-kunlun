import { CallChaining, CastHelper } from '@oinone/kunlun-shared';
import { ActiveRecordsWidgetProps, executeInvisible, Widget } from '@oinone/kunlun-vue-widget';
import { BaseActionWidget, BaseElementWidget } from './token';

export class BaseActionGroupWidget<
  T extends ActiveRecordsWidgetProps = ActiveRecordsWidgetProps
> extends BaseElementWidget<T> {
  protected defaultAllInvisible = true;

  /**
   * 挂载时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  /**
   * 刷新时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected refreshCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  protected showActionNames: string[] | undefined;

  protected showActionNamesProcess(): string[] {
    const showActionNames: Set<string> = new Set();
    this.getChildren().forEach((widget) => {
      const showAction = !executeInvisible(CastHelper.cast(widget));
      if (showAction) {
        const name = (widget as BaseActionWidget).action?.name;
        if (name) {
          showActionNames.add(name);
        }
      }
    });
    return [...showActionNames];
  }

  protected resetShowActionNames() {
    this.showActionNames = this.showActionNamesProcess();
  }

  protected $$mounted() {
    super.$$mounted();
    this.resetShowActionNames();
  }

  protected resetInvisible() {
    super.resetInvisible();
    this.resetShowActionNames();
  }
}
