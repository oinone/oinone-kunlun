import { DEFAULT_SLOT_NAME } from '@oinone/kunlun-dsl';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { DrawerHeight, DrawerPlacement } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { PopupScene } from '../../../typing';
import { PopupWidget, PopupWidgetProps } from '../PopupWidget';
import DefaultDrawer from './DefaultDrawer.vue';

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
  public get title(): string | undefined {
    const title = this.getDsl().title;
    if (!title) {
      return undefined;
    }

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
  protected get wrapperClassName(): string | undefined {
    return this.getDsl().wrapperClassName;
  }

  @Widget.Reactive()
  public get width() {
    return this.getDsl().width;
  }

  @Widget.Reactive()
  public get height() {
    return this.getDsl().height;
  }

  @Widget.Reactive()
  protected get defaultSize(): keyof typeof DrawerHeight {
    return 'medium';
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
