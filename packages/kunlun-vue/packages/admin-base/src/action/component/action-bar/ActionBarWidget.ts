import { DEFAULT_SLOT_NAME } from '@oinone/kunlun-dsl';
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
  type ActiveRecordsWidgetProps,
  hasActionBarViewState,
  isListViewState,
  type OioActionBarState,
  type OioAnyViewState,
  useOioState,
  Widget
} from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { BaseActionGroupWidget, BaseElementWidget } from '../../../basic';
import { ActiveCountEnum, type MoreActionRender } from '../../../typing';
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
  protected actionBarState: OioActionBarState | undefined;

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
      return [OioDropdownTrigger.hover];
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

  protected $$initViewStatePosition(state: OioAnyViewState): void {
    state.__position.push({ handle: this.currentHandle, slotName: this.getSlotName() });
  }

  protected $$clearViewStatePosition(state: OioAnyViewState): void {
    const index = state.__position.findIndex((v) => v.handle === this.currentHandle);
    if (index !== -1) {
      state.__position.splice(index, 1);
    }
  }

  protected $$initViewState(state: OioAnyViewState): void {
    if (hasActionBarViewState(state)) {
      const slotName = this.getSlotName();
      if (!slotName || slotName === DEFAULT_SLOT_NAME) {
        if (!state.actionBar) {
          state.actionBar = this.createActionBarState(state);
        }
      } else {
        let { actionBars } = state;
        if (!actionBars) {
          actionBars = {};
          state.actionBars = actionBars;
        }
        if (!actionBars[slotName]) {
          actionBars[slotName] = this.createActionBarState(state);
        }
      }
    }
    if (!this.actionBarState) {
      this.actionBarState = this.viewState?.getActionBarState();
    }
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    let isInitStatePosition = !!this.viewState;
    if (!this.viewState && this.popupScene) {
      this.viewState = useOioState(this.seekPopupMainRuntimeContext().handle).viewState;
      if (this.viewState) {
        isInitStatePosition = true;
        this.$$initViewStatePosition(this.viewState);
        this.$$initViewState(this.viewState);
      }
    }
    if (this.viewState && !isInitStatePosition) {
      this.$$initViewStatePosition(this.viewState);
    }
  }

  protected createActionBarState(state: OioAnyViewState): OioActionBarState {
    const actionBarState = state.createActionBarState({
      handle: this.currentHandle,
      bizStyle: this.initBizStyle()
    });
    actionBarState.getActionBarBizStyle = this.createGetActionBarBizStyleMethod(this).bind(actionBarState);
    return actionBarState;
  }

  protected createGetActionBarBizStyleMethod(self: ActionBarWidget): (
    this: OioActionBarState,
    actionHandle: string
  ) =>
    | {
        type: ButtonType;
        bizStyle: ButtonBizStyle;
      }
    | undefined {
    return function getActionBarBizStyle(this: OioActionBarState, actionHandle: string) {
      if (this.inline || self.popupScene) {
        // 行内动作不支持配置样式
        return undefined;
      }
      const { bizStyle, visibleActions } = this;
      if (bizStyle === ActionBarBizStyle.style2) {
        const index = visibleActions.findIndex((v) => v === actionHandle);
        if (index === 0) {
          return { type: ButtonType.primary, bizStyle: ButtonBizStyle.default };
        }
        return { type: ButtonType.text, bizStyle: ButtonBizStyle.default };
      }
    };
  }
}
