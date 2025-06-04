import { ActionDslDefinition, DEFAULT_SLOT_NAME, DslDefinitionType, TemplateDslDefinition } from '@oinone/kunlun-dsl';
import { ActiveRecord, ActiveRecordsOperator } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { RowContext } from '../../ui';
import { DEFAULT_COLS, ListSelectMode } from '@oinone/kunlun-vue-ui-common';
import { DslDefinitionWidget, Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { ActionWidget } from '../../action';
import { BaseActionWidget, BaseElementWidget } from '../../basic';
import { ActiveCountEnum } from '../../typing';
import DefaultCard from './DefaultCard.vue';

const CLICK_SLOT_NAME = 'click';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'card'
  })
)
export class CardWidget extends BaseElementWidget {
  @Widget.Reactive()
  @Widget.Provide()
  protected isCard = true;

  @Widget.Reactive()
  @Widget.Provide()
  protected cols = DEFAULT_COLS;

  @Widget.Reactive()
  protected get formData(): ActiveRecord {
    return this.activeRecords?.[0] || {};
  }

  @Widget.Reactive()
  protected hideTitle = false;

  @Widget.Reactive()
  @Widget.Provide()
  protected onHideTitle(hideTitle: boolean) {
    this.hideTitle = hideTitle;
  }

  @Widget.Reactive()
  protected rowIndex: number | undefined;

  public initialize(props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME, 'title', 'titleToolbar', 'content', 'rowActions', CLICK_SLOT_NAME];
    }
    const slotContext = props.slotContext as RowContext;
    if (slotContext) {
      props.activeRecords = ActiveRecordsOperator.repairRecords(slotContext.data);
      this.rowIndex = slotContext.index;
    }
    super.initialize(props);
    this.setComponent(DefaultCard);
    return this;
  }

  @Widget.Reactive()
  protected get minWidth() {
    return NumberHelper.toNumber(this.getDsl().minWidth);
  }

  @Widget.Reactive()
  protected get maxWidth() {
    return NumberHelper.toNumber(this.getDsl().maxWidth);
  }

  @Widget.Reactive()
  protected get width() {
    return NumberHelper.toNumber(this.getDsl().width);
  }

  @Widget.Reactive()
  protected get height() {
    return NumberHelper.toNumber(this.getDsl().height);
  }

  @Widget.Reactive()
  protected get minHeight() {
    return NumberHelper.toNumber(this.getDsl().minHeight) || 40;
  }

  @Widget.Reactive()
  protected get maxHeight() {
    return NumberHelper.toNumber(this.getDsl().maxHeight);
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected selectMode: ListSelectMode | undefined;

  @Widget.Reactive()
  protected get clickActionDslDefinition(): ActionDslDefinition | undefined {
    const { clickActionName, widgets } = this.getDsl();
    const clickTemplateDslDefinition = widgets?.find(
      (v) => v.dslNodeType === DslDefinitionType.TEMPLATE && (v as TemplateDslDefinition).slot === CLICK_SLOT_NAME
    );
    if (clickTemplateDslDefinition) {
      let clickDslDefinition: ActionDslDefinition | undefined;
      if (clickActionName) {
        clickDslDefinition = clickTemplateDslDefinition.widgets?.find(
          (v) => v.dslNodeType === DslDefinitionType.ACTION && (v as ActionDslDefinition).name === clickActionName
        ) as ActionDslDefinition;
      } else if (clickTemplateDslDefinition.widgets?.length === 1) {
        return clickTemplateDslDefinition.widgets?.[0] as ActionDslDefinition;
      }
      return clickDslDefinition;
    }
  }

  @Widget.Reactive()
  protected get allowClick(): boolean {
    const allowClick = BooleanHelper.toBoolean(this.getDsl().allowClick);
    if (isNil(allowClick) || allowClick) {
      return !!this.clickActionDslDefinition;
    }
    return false;
  }

  @Widget.Method()
  protected async onClick() {
    if (!this.allowClick) {
      return;
    }
    const actionName = this.clickActionDslDefinition?.name;
    if (actionName) {
      await this.load(async () => {
        const actionWidget = this.getChildren()?.find((v) => {
          if (v instanceof DslDefinitionWidget) {
            const { slotName } = v.getDsl();
            if (slotName === CLICK_SLOT_NAME && v instanceof BaseActionWidget) {
              return v.action?.name === actionName;
            }
          }
          return false;
        }) as ActionWidget;
        await actionWidget?.click();
        actionWidget?.forceUpdate();
      });
    }
  }

  @Widget.Reactive()
  protected get isSelected(): boolean {
    const record = this.getCurrentActiveRecords()?.[0];
    if (!record) {
      return false;
    }
    const result = this.parentActiveRecords?.findIndex((v) => record.__draftId === v.__draftId);
    if (result == null) {
      return false;
    }
    return result !== -1;
  }

  @Widget.Method()
  protected onCheckboxChange(val: boolean) {
    const record = this.getCurrentActiveRecords()?.[0];
    if (!record) {
      return;
    }
    if (val) {
      this.parentPushActiveRecords?.(record);
    } else {
      this.parentDeleteActiveRecordsByEntity?.(record);
    }
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get inlineActiveCount(): number | undefined {
    const { inlineActiveCount } = this.getDsl();
    if (isNil(inlineActiveCount)) {
      return undefined;
    }
    const inlineActiveCountNumber = NumberHelper.toNumber(inlineActiveCount);
    if (isNil(inlineActiveCountNumber)) {
      return ActiveCountEnum[inlineActiveCount as string];
    }
    return inlineActiveCountNumber;
  }
}
