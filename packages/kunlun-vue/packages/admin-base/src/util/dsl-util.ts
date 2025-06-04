import { VueWidget, Widget } from '@oinone/kunlun-vue-widget';
import { ActiveRecordExtendKeys } from '@oinone/kunlun-engine';
import { ActionWidget, ActionBarWidget, RowActionBarWidget } from '../action/component';
import { BaseSearchWidget } from '../basic/BaseSearchWidget';
import { DslDefinitionType } from '@oinone/kunlun-dsl';

export const queryDslWidget = <T extends VueWidget>(
  widgets: Widget[] | undefined,
  widgetClazz: new () => T,
  findChildren = false
): null | T => {
  if (!widgets) {
    return null;
  }
  for (const widget of widgets) {
    if (widget instanceof widgetClazz) {
      return widget;
    }
    if (findChildren || ![DslDefinitionType.FIELD, DslDefinitionType.ACTION].includes(widget.getConfig('dslNodeType') as DslDefinitionType)) {
      const find = queryDslWidget(widget.getChildrenInstance(), widgetClazz);
      if (find) {
        return find;
      }
    }
  }
  return null;
};

/**
 * 在表格字段内查找操作栏动作条组件
 * @param widgets
 * @param draftId
 */
export const queryRowActionBar = (widgets: Widget[], draftId: string) => {
  for (const widget of widgets) {
    if (widget instanceof RowActionBarWidget) {
      if (
        (widget as RowActionBarWidget).getOperator<RowActionBarWidget>().activeRecords?.[0][
          ActiveRecordExtendKeys.DRAFT_ID
        ] === draftId
      ) {
        return widget as RowActionBarWidget;
      }
    } else {
      const find = queryRowActionBar(widget.getChildrenInstance(), draftId);
      if (find) {
        return find;
      }
    }
  }
  return null;
};

/**
 * 通过弹窗的视图handle查找弹窗底部的动作
 * @param dialogViewHandle 弹窗内的视图handle
 * @param actionLabel 动作标题
 */
export const queryActionByDialogViewHandle = (dialogViewHandle: string, actionLabel: string): ActionWidget | null => {
  const baseViewWidget = Widget.select(dialogViewHandle);
  const actionBar = baseViewWidget?.nextWidgetSibling();
  return queryActionInActionBar(actionBar!, actionLabel);
};

/**
 * 通过视图handle查找弹窗底部的动作
 * @param viewHandle 视图handle
 * @param actionLabel 动作标题
 */
export const queryActionByViewHandle = (viewHandle: string, actionLabel: string): ActionWidget | null => {
  const baseViewWidget = Widget.select(viewHandle);
  const actionBar = queryDslWidget(baseViewWidget?.getChildrenInstance(), ActionBarWidget);
  return queryActionInActionBar(actionBar!, actionLabel);
};

export const queryActionInActionBar = (actionBar: Widget, actionLabel: string): ActionWidget | null => {
  if (actionBar instanceof ActionBarWidget) {
    const actionWidget = actionBar?.getChildrenInstance()?.find((a) => (a as ActionWidget).action.label === actionLabel);
    if (actionWidget instanceof ActionWidget) {
      return actionWidget;
    }
  }
  return null;
};

/**
 * 通过视图handle查找搜索组件
 * @param viewHandle
 */
export const querySearchWidgetByViewHandle = (viewHandle: string): BaseSearchWidget | null => {
  const baseViewWidget = Widget.select(viewHandle);
  const searchWidget = queryDslWidget(baseViewWidget?.getChildrenInstance(), BaseSearchWidget);
  if (searchWidget) {
    return searchWidget as unknown as BaseSearchWidget;
  }
  return null;
};
