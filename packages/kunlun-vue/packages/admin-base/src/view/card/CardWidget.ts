import {
  type ActionDslDefinition,
  DEFAULT_SLOT_NAME,
  DslDefinitionType,
  type TemplateDslDefinition
} from '@oinone/kunlun-dsl';
import { type ActiveRecord, ActiveRecordsOperator, getCurrentThemeSize } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, NumberHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import type { RowContext } from '@oinone/kunlun-vue-ui';
import {
  DEFAULT_CARD_GUTTERS,
  DEFAULT_COLS,
  DEFAULT_GUTTERS,
  DEFAULT_VERTICAL_GUTTERS,
  ListSelectMode
} from '@oinone/kunlun-vue-ui-common';
import {
  DslDefinitionWidget,
  isGalleryViewState,
  type OioAnyViewState,
  type OioGalleryViewState,
  Widget
} from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import type { ActionWidget } from '../../action';
import { BaseActionWidget, BaseElementWidget, BasePackWidget } from '../../basic';
import { ActiveCountEnum, CARD_WIDGET, type UserTablePrefer } from '../../typing';
import DefaultCard from './DefaultCard.vue';

const CLICK_SLOT_NAME = 'click';

@SPI.ClassFactory(
  BasePackWidget.Token({
    viewType: ViewType.Gallery,
    widget: ['card', CARD_WIDGET]
  })
)
@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: ['card', CARD_WIDGET]
  })
)
export class CardWidget extends BaseElementWidget {
  protected viewState: OioGalleryViewState | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected isCard = true;

  /**
   * 默认间距
   */
  @Widget.Reactive()
  private get defaultGutter() {
    const size = getCurrentThemeSize();

    switch (size) {
      case 'large':
        return DEFAULT_GUTTERS;
      case 'medium':
        return DEFAULT_VERTICAL_GUTTERS;
      default:
        return DEFAULT_CARD_GUTTERS;
    }
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected cols = DEFAULT_COLS;

  @Widget.Reactive()
  protected get formData(): ActiveRecord {
    return this.activeRecords?.[0] || {};
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected rowIndex: number | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected userPrefer?: UserTablePrefer;

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
    return NumberHelper.toNumber(this.getDsl().minHeight) || 338;
  }

  @Widget.Reactive()
  protected get maxHeight() {
    return NumberHelper.toNumber(this.getDsl().maxHeight);
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected selectMode: ListSelectMode | undefined;

  @Widget.Reactive()
  protected get titleProps(): Record<string, unknown> | undefined {
    const titleDsl = this.template?.widgets?.find((v) => (v as TemplateDslDefinition).slot === 'title');
    if (titleDsl) {
      return {
        textWrap: titleDsl.textWrap?.toLowerCase?.()
      };
    }
  }

  @Widget.Reactive()
  protected get contentProps(): Record<string, unknown> | undefined {
    const contentDsl = this.template?.widgets?.find((v) => (v as TemplateDslDefinition).slot === 'content');
    if (contentDsl) {
      return {
        textWrap: contentDsl.textWrap?.toLowerCase?.()
      };
    }
  }

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

  protected $$initViewState(state: OioAnyViewState): void {
    const { currentHandle, rowIndex } = this;
    if (isGalleryViewState(state) && rowIndex != null) {
      if (!state.cards) {
        state.cards = [];
      }
      state.cards[rowIndex] = {
        handle: currentHandle,
        fields: [],
        titleProps: this.titleProps,
        contentProps: this.contentProps
      };
    }
  }

  protected $$unmounted() {
    super.$$unmounted();
    const { viewState, rowIndex } = this;
    if (viewState && rowIndex != null && isGalleryViewState(viewState)) {
      const { cards } = viewState;
      if (cards) {
        cards.splice(rowIndex, 1);
        viewState.cards = [...cards];
      }
    }
  }
}
