import { CallChaining, NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ViewType } from '@oinone/kunlun-meta';
import { ActiveRecordsOperator } from '@oinone/kunlun-engine';
import { FlexRowJustify, ListSelectMode } from '@oinone/kunlun-vue-ui-common';
import { ActiveRecordsWidgetProps, Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { VNode } from 'vue';
import { BaseActionGroupWidget, BaseElementWidget } from '../../../basic';
import { ActiveCountEnum } from '../../../typing';
import DefaultActionBar from './DefaultActionBar.vue';
import { isTopViewWidget } from '../../../util';

export interface ActionBarWidgetProps extends ActiveRecordsWidgetProps {
  inline?: boolean;
  subActionBar?: boolean;
  batchOpt?: boolean;
  moreActionRender?: (vnodes: VNode[], subActionBar: boolean, inline: boolean) => VNode;
}

@SPI.ClassFactory(BaseElementWidget.Token({ widget: ['actionBar', 'action-bar', 'ActionBar'] }))
export class ActionBarWidget<
  Props extends ActionBarWidgetProps = ActionBarWidgetProps
> extends BaseActionGroupWidget<Props> {
  public initialize(props: Props) {
    super.initialize(props);
    this.setComponent(DefaultActionBar);
    this.inline = props.inline || false;
    this.subActionBar = props.subActionBar || false;
    this.moreActionRender = props.moreActionRender;
    this.setCurrentActiveRecords(ActiveRecordsOperator.repairRecordsNullable(props.activeRecords));
    return this;
  }

  public mounted() {
    super.mounted();
    if (this.viewType === ViewType.Table && this.inline) {
      this.subActionBar = true;
    }
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected popupScene: string | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected inline: boolean | undefined;

  // 非顶级view下的actionBar
  @Widget.Reactive()
  protected subActionBar?: boolean;

  // 批量管理, 最外层的list类型试图才展示
  @Widget.Reactive()
  protected get batchOpt(): boolean {
    return [ViewType.Table, ViewType.Gallery].includes(this.viewType!) && this.isTopView;
  }

  @Widget.Reactive()
  protected get isTopView(): boolean {
    return isTopViewWidget(this.metadataRuntimeContext);
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected showActionPopup;

  @Widget.Method()
  @Widget.Inject()
  protected onShowActionsPopup;

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

  @Widget.Method()
  protected moreActionRender: ((vnodes: VNode[], inline: boolean, subActionBar: boolean) => VNode) | undefined;

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
