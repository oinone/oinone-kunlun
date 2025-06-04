import { RelationUpdateType, RuntimeAction, SubmitType, SubmitValue } from '@oinone/kunlun-engine';
import { ActionType, ViewActionTarget, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { CallChaining, Constructor } from '@oinone/kunlun-shared';
import { SPI, SPISingleSelector, SPITokenFactory } from '@oinone/kunlun-spi';
import { useRouter } from '@oinone/kunlun-vue-router';
import { ActiveRecordsWidgetProps, InnerWidgetType, Widget } from '@oinone/kunlun-vue-widget';
import { PopupScene } from '../../typing';
import { BaseRuntimePropertiesWidget } from '../common';
import { MobileSPIOptions } from '../types';

export interface BaseActionWidgetProps<Action extends RuntimeAction = RuntimeAction> extends ActiveRecordsWidgetProps {
  viewType?: ViewType;
  action?: Action;
}

export interface BaseActionOptions extends MobileSPIOptions {
  viewType?: ViewType | ViewType[];
  viewName?: string | string[];
  actionType?: ActionType | ActionType[];
  model?: string[] | string;
  target?: ViewActionTarget | string | string[];
  name?: string | string[];
  widget?: string[] | string;
}

@SPI.Base(Symbol('Action'), ['viewType', 'actionType', 'target', 'widget', 'model', 'viewName', 'name'])
export class BaseActionWidget<
  Action extends RuntimeAction = RuntimeAction,
  Props extends BaseActionWidgetProps<Action> = BaseActionWidgetProps<Action>
> extends BaseRuntimePropertiesWidget<Props> {
  protected $$innerWidgetType = InnerWidgetType.Action;

  public static Token: SPITokenFactory<BaseActionOptions>;

  public static Selector: SPISingleSelector<BaseActionOptions, Constructor<BaseActionWidget>>;

  protected $matched: Matched | undefined;

  protected $router: Router | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected viewType: ViewType | undefined;

  @Widget.Reactive()
  @Widget.Inject('viewMode')
  protected parentViewMode: ViewMode | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get viewMode(): ViewMode | undefined {
    return this.parentViewMode;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected submitType: SubmitType | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected relationUpdateType: RelationUpdateType | undefined;

  protected runtimeAction: Action | undefined;

  @Widget.Reactive()
  public get action(): Action {
    const action = this.runtimeAction;
    if (!action) {
      throw new Error('Invalid action define.');
    }
    return action;
  }

  @Widget.Reactive()
  protected get isAsync() {
    return true;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected popupScene: PopupScene | string | undefined;

  @Widget.Reactive()
  protected get isDialog() {
    return this.popupScene === PopupScene.dialog;
  }

  @Widget.Reactive()
  protected get isDrawer() {
    return this.popupScene === PopupScene.drawer;
  }

  @Widget.Reactive()
  protected get isInnerPopup() {
    return this.popupScene === PopupScene.inner;
  }

  /**
   * 数据提交
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected submitCallChaining: CallChaining<SubmitValue> | undefined;

  /**
   * 数据校验
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected validatorCallChaining: CallChaining<boolean> | undefined;

  /**
   * 刷新时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected refreshCallChaining: CallChaining<boolean> | undefined;

  public initialize(props: Props) {
    super.initialize(props);
    this.runtimeAction = props.action;
    return this;
  }

  public async load<R>(fn: (...args) => R, ...args): Promise<R> {
    if (this.isAsync) {
      return super.load(fn, ...args);
    }
    return fn(...args);
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    if (!this.$matched) {
      const { matched } = useMatched();
      this.$matched = matched;
    }
    if (!this.$router) {
      this.$router = useRouter().router as Router;
    }
  }
}
