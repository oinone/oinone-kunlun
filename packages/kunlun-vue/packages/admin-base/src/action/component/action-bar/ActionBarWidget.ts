import { CallChaining, NumberHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { FlexRowJustify, ListSelectMode, OioDropdownTrigger } from '@kunlun/vue-ui-common';
import { ActiveRecordsWidgetProps, Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { BaseActionGroupWidget, BaseElementWidget } from '../../../basic';
import { ActiveCountEnum, MoreActionRender } from '../../../typing';
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
  protected get isFloat():boolean | undefined{
    const { isFloat } = this.getDsl()
    return isFloat
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
  protected get justify(): string | undefined {
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
}
