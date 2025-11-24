import { isMinimalismTheme } from '@oinone/kunlun-engine';
import { CallChaining, NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import {
  ButtonBizStyle,
  ButtonType,
  FlexRowJustify,
  ListSelectMode,
  OioDropdownTrigger
} from '@oinone/kunlun-vue-ui-common';
import {
  ActiveRecordsWidgetProps,
  hasActionBarViewState,
  isListViewState,
  OioAnyViewState,
  Widget
} from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { BaseActionGroupWidget, BaseElementWidget } from '../../../basic';
import { ActiveCountEnum, MoreActionRender } from '../../../typing';
import { ActionBarBizStyle } from '../typing';
import DefaultActionBar from './DefaultActionBar.vue';

export interface ActionBarWidgetProps extends ActiveRecordsWidgetProps {
  inline?: boolean;
  moreActionRender?: MoreActionRender;
}

@SPI.ClassFactory(BaseElementWidget.Token({ widget: ['actionBar', 'action-bar', 'ActionBar'] }))
export class ActionBarWidget<
  Props extends ActionBarWidgetProps = ActionBarWidgetProps
> extends BaseActionGroupWidget<Props> {
  public initialize(props: Props) {
    super.initialize(props);
    this.setComponent(DefaultActionBar);
    this.inline = props.inline || false;
    this.moreActionRender = props.moreActionRender;
    return this;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected popupScene: string | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected inline: boolean | undefined;

  @Widget.Reactive()
  protected get isFloat(): boolean | undefined {
    const { isFloat } = this.getDsl();
    return isFloat;
  }

  @Widget.Reactive()
  protected get activeCount(): number | undefined {
    let { activeCount } = this.getDsl();
    if (isNil(activeCount)) {
      activeCount = this.metadataRuntimeContext.viewTemplate?.activeCount;
      if (isNil(activeCount)) {
        return undefined;
      }
    }
    const activeCountNumber = NumberHelper.toNumber(activeCount);
    if (isNil(activeCountNumber)) {
      return ActiveCountEnum[activeCount as string];
    }
    return activeCountNumber;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get buttonType() {
    return this.getDsl().buttonType?.toLowerCase?.();
  }

  @Widget.Reactive()
  protected get bizStyle(): string | undefined {
    const { viewState, inline } = this;
    if (inline) {
      // 行内动作不支持配置样式
      return undefined;
    }
    if (viewState && hasActionBarViewState(viewState)) {
      return viewState.actionBar?.bizStyle;
    }
  }

  @Widget.Reactive()
  public get justify(): string | undefined {
    if (this.popupScene != null) {
      return undefined;
    }
    const { justify } = this.getDsl();
    if (justify) {
      const value = FlexRowJustify[justify.toUpperCase()];
      if (value) {
        if (FlexRowJustify.START === value) {
          return 'flex-start';
        }
        if (FlexRowJustify.END === value) {
          return 'flex-end';
        }
        return value;
      }
    }
    return justify;
  }

  @Widget.Reactive()
  protected get moreActionTriggers(): OioDropdownTrigger[] {
    const moreActionTriggersStr = this.getDsl().moreActionTriggers?.();
    if (!moreActionTriggersStr) {
      return [OioDropdownTrigger.click, OioDropdownTrigger.hover];
    }
    return moreActionTriggersStr.split(',') as unknown[] as OioDropdownTrigger[];
  }

  @Widget.Method()
  protected moreActionRender: MoreActionRender | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected selectMode: ListSelectMode | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected selectModeCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected checkboxAllCallChaining: CallChaining | undefined;

  @Widget.Method()
  protected onSelectModeChange(mode: ListSelectMode | undefined) {
    this.reloadActiveRecords([]);
    this.selectModeCallChaining?.call(mode);
  }

  @Widget.Method()
  protected onCheckboxAll(selected: boolean) {
    this.checkboxAllCallChaining?.call(selected);
  }

  protected initBizStyle(): string | undefined {
    const { viewState } = this;
    let { bizStyle } = this.getDsl();
    if (bizStyle == null) {
      if (viewState && isListViewState(viewState) && isMinimalismTheme()) {
        bizStyle = ActionBarBizStyle.style2;
      }
    }
    return bizStyle;
  }

  protected getActionBarBizStyle(actionHandle: string): { type: ButtonType; bizStyle: ButtonBizStyle } | undefined {
    if (this.inline) {
      // 行内动作不支持配置样式
      return undefined;
    }
    const actionBarState = this.viewState?.getActionBarState();
    if (!actionBarState) {
      return undefined;
    }
    const { bizStyle, visibleActions } = actionBarState;
    if (!bizStyle) {
      return undefined;
    }
    if (bizStyle === ActionBarBizStyle.style2) {
      const index = visibleActions.findIndex((v) => v === actionHandle);
      if (index === 0) {
        return { type: ButtonType.primary, bizStyle: ButtonBizStyle.default };
      }
      return { type: ButtonType.text, bizStyle: ButtonBizStyle.default };
    }
  }

  protected $$initViewState(state: OioAnyViewState): void {
    const { currentHandle } = this;
    if (hasActionBarViewState(state)) {
      if (!state.actionBar) {
        state.actionBar = state.createActionBarState({
          handle: currentHandle,
          bizStyle: this.initBizStyle(),
          getActionBarBizStyle: this.getActionBarBizStyle.bind(this)
        });
      }
    }
  }
}
