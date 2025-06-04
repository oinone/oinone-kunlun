import { DEFAULT_SLOT_NAME } from '@oinone/kunlun-dsl';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { DrawerHeight, DrawerPlacement, DrawerWidth, OioDrawerProps } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { PopupScene } from '../../../typing';
import { PopupWidget, PopupWidgetProps } from '../PopupWidget';
import DefaultDrawer from './DefaultDrawer.vue';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';

export type DrawerWidgetProps = PopupWidgetProps;

export class DrawerWidget<Props extends DrawerWidgetProps = DrawerWidgetProps> extends PopupWidget<Props> {
  protected getPopupScene(): string {
    return PopupScene.drawer;
  }

  public initialize(props: Props) {
    if (!props.slotNames) {
      props.slotNames = ['header', DEFAULT_SLOT_NAME, 'footer'];
    }
    super.initialize(props);
    this.setComponent(DefaultDrawer);
    return this;
  }

  @Widget.Reactive()
  public get destroyOnClose(): boolean {
    return true;
  }

  @Widget.Reactive()
  public get title() {
    const title = this.getDsl().title || OioDrawerProps.title.default;

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
  public get help() {
    return this.getDsl().help;
  }

  @Widget.Reactive()
  public get placement() {
    return this.getDsl().placement?.toLowerCase?.() || DrawerPlacement.right;
  }

  @Widget.Reactive()
  public get width() {
    return '100%';
    // return this.getDsl().width || DrawerWidth.small;
  }

  @Widget.Reactive()
  public get height() {
    return this.getDsl().height || DrawerHeight.small;
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
}
