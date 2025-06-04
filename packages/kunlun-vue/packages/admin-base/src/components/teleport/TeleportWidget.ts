import { WidgetProps } from '@oinone/kunlun-engine';
import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import DefaultTeleport from './DefaultTeleport.vue';

export interface TeleportWidgetProps extends WidgetProps {
  teleport?: string;
  visible?: boolean;
  disabled?: boolean;
}

/**
 * teleport widget
 */
export class TeleportWidget extends VueWidget<TeleportWidgetProps> {
  @Widget.Reactive()
  protected teleport: string | undefined;

  @Widget.Reactive()
  protected visible = false;

  @Widget.Reactive()
  protected disabled = false;

  public initialize(props: TeleportWidgetProps) {
    super.initialize(props);
    this.setComponent(DefaultTeleport);
    this.teleport = props.teleport;
    this.visible = props.visible || false;
    if (this.teleport) {
      this.disabled = props.disabled || false;
    } else {
      this.disabled = true;
    }
    return this;
  }

  public isVisible() {
    return this.visible;
  }

  public show() {
    this.visible = true;
  }

  public hide() {
    this.visible = false;
  }

  public getTeleport(): string | undefined {
    return this.teleport;
  }

  public setTeleport(teleport: string | undefined) {
    this.teleport = teleport;
    if (!teleport) {
      this.disabled = true;
    }
  }

  public isDisabled() {
    return this.disabled;
  }

  public enable() {
    this.disabled = false;
  }

  public disable() {
    this.disabled = true;
  }
}
