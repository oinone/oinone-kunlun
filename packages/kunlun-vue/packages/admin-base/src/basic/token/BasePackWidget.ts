import { Expression, ExpressionRunParam } from '@kunlun/expression';
import { ViewType } from '@kunlun/meta';
import { Constructor, NumberHelper } from '@kunlun/shared';
import { SPI, SPIOptions, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { PathWidgetProps, Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { PopupScene } from '../../typing';
import { BaseRuntimePropertiesWidget } from '../common';

/**
 * Pack组件注册可选项
 */
export interface BasePackOptions extends SPIOptions {
  /**
   * 指定视图类型
   */
  viewType?: ViewType | ViewType[];
  /**
   * 指定组件名称或别称
   */
  widget?: string | string[];
  /**
   * 指定是否内敛组件
   */
  inline?: boolean;
  /**
   * 指定模型
   */
  model?: string | string[];
  /**
   * 指定视图名称
   */
  viewName?: string | string[];
}

@SPI.Base('Pack', ['viewType', 'widget', 'inline', 'model', 'viewName'])
export class BasePackWidget<
  Props extends PathWidgetProps = PathWidgetProps
> extends BaseRuntimePropertiesWidget<Props> {
  public static Token: SPITokenFactory<BasePackOptions>;

  public static Selector: SPISingleSelector<BasePackOptions, Constructor<BasePackWidget>>;

  protected defaultAllInvisible = true;

  @Widget.Reactive()
  @Widget.Inject('viewType')
  protected parentViewType: ViewType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get viewType(): ViewType | undefined {
    return this.view?.type || this.parentViewType;
  }

  @Widget.Reactive()
  protected get formData() {
    return this.activeRecords?.[0] || {};
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected popupScene: string | undefined;

  protected get isDialog() {
    return this.popupScene === PopupScene.dialog;
  }

  protected get isDrawer() {
    return this.popupScene === PopupScene.drawer;
  }

  @Widget.Reactive()
  @Widget.Inject('cols')
  private parentCols: number | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get cols() {
    let cols = NumberHelper.toNumber(this.getDsl().cols) as number | undefined;
    if (isNil(cols)) {
      cols = this.parentCols;
    }
    if (isNil(cols)) {
      cols = 1;
    }
    return cols;
  }

  @Widget.Reactive()
  public get help() {
    return this.getDsl().help;
  }

  protected invisibleProcess(invisible: boolean | string): boolean | undefined {
    if (typeof invisible === 'boolean') {
      return invisible;
    }
    return !!this.executeExpression<boolean>(invisible, false);
  }

  protected executeLabelExpression(label: string): string | undefined {
    if (Expression.isExpressionStr(label as string)) {
      return this.executeExpression(Expression.getExpressionStr(label));
    }
    return Expression.hasKeywords(label as string) ? this.executeExpression(label) : label;
  }

  public executeExpression<T>(expression: string, errorValue?: T): T | string | undefined {
    return Expression.run(
      {
        activeRecords: [this.formData || {}],
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene: this.scene
      } as ExpressionRunParam,
      expression,
      errorValue
    );
  }
}
