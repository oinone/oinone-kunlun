import { DEFAULT_SLOT_NAME } from '@kunlun/dsl';
import { BooleanHelper } from '@kunlun/shared';
import { ModalWidth, OioModalProps } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { PopupScene } from '../../../typing';
import { PopupWidget, PopupWidgetProps } from '../PopupWidget';
import DefaultDialog from './DefaultDialog.vue';
import { Expression, ExpressionRunParam } from '@kunlun/expression';

export type DialogWidgetProps = PopupWidgetProps;

export class DialogWidget<Props extends DialogWidgetProps = DialogWidgetProps> extends PopupWidget<Props> {
  protected getPopupScene(): string {
    return PopupScene.dialog;
  }

  public initialize(props: Props) {
    if (!props.slotNames) {
      props.slotNames = ['header', DEFAULT_SLOT_NAME, 'footer'];
    }
    super.initialize(props);
    this.setComponent(DefaultDialog);
    return this;
  }

  @Widget.Reactive()
  public get destroyOnClose(): boolean {
    return true;
  }

  @Widget.Reactive()
  public get title() {
    const title = this.getDsl().title || OioModalProps.title.default;

    return Expression.run(
      {
        activeRecords: this.activeRecords,
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        activeRecord: this.activeRecords?.[0] || {},
        parentRecord: this.parentViewActiveRecords?.[0] || {}
      } as ExpressionRunParam,
      title,
      title
    );
  }

  @Widget.Reactive()
  protected get help() {
    return this.getDsl().help;
  }

  @Widget.Reactive()
  public get draggable(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().draggable) || false;
  }

  @Widget.Reactive()
  public get width() {
    return '100%';
    // return this.getDsl().width || ModalWidth.medium;
  }

  @Widget.Reactive()
  public get maskClosable(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().maskClosable) || false;
  }

  @Widget.Reactive()
  public get okText() {
    return this.getDsl().okText;
  }

  @Widget.Reactive()
  public get cancelText() {
    return this.getDsl().cancelText;
  }

  @Widget.Reactive()
  protected teleport: () => HTMLElement = () => document.body;
}
