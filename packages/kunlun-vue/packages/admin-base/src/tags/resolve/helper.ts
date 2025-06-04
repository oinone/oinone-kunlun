import { ViewType } from '@oinone/kunlun-meta';
import { DEFAULT_SLOT_NAME, DslDefinition, DslDefinitionHelper, DslDefinitionType } from '@oinone/kunlun-dsl';
import { DslRender } from '@oinone/kunlun-vue-widget';
import { CSSStyle } from '@oinone/kunlun-shared';
import { DEFAULT_COLS, FlexColMode } from '@oinone/kunlun-vue-ui-common';
import { isNil } from 'lodash-es';
import { Slot, VNode, createVNode } from 'vue';
import { InternalWidget, ResolveMode } from './typing';
import { RowHelper, ColHelper } from './internal/row-col-resolve';

/**
 * 是否创建flex相关元素
 * @param resolveMode 解析模型
 */
export function isCreateFlexElement(resolveMode: ResolveMode | undefined) {
  return !resolveMode || (resolveMode && [ResolveMode.DEFAULT, ResolveMode.FLEX].includes(resolveMode));
}

function collectionAffectiveChildren(dsl: DslDefinition, maxSize?: number, children?: DslDefinition[]) {
  if (isNil(maxSize)) {
    maxSize = -1;
  }
  if (isNil(children)) {
    children = [];
  }
  for (const widget of dsl.widgets || []) {
    if (DslDefinitionHelper.isSlot(widget)) {
      continue;
    }
    if (DslDefinitionHelper.isTemplate(widget)) {
      if (widget.slot === DEFAULT_SLOT_NAME) {
        collectionAffectiveChildren(widget, maxSize, children);
      }
      continue;
    }
    children.push(widget);
    if (maxSize > 0 && children?.length > maxSize) {
      break;
    }
  }
  return children;
}

export function isOnlyOneRowWidget(dsl: DslDefinition | undefined) {
  if (!dsl) {
    return false;
  }
  const children: DslDefinition[] = collectionAffectiveChildren(dsl, 2);
  const len = children.length;
  if (len === 1) {
    const maybeRowWidget = children[0];
    if (maybeRowWidget) {
      const { dslNodeType, widget } = maybeRowWidget;
      if (dslNodeType && widget) {
        return (
          dslNodeType === DslDefinitionType.PACK && [InternalWidget.Row, InternalWidget.Containers].includes(widget)
        );
      }
    }
  }
  return false;
}

export function defaultFlexResolve(template: DslDefinition | undefined, defaultSlot: Slot): VNode[] {
  let defaultChildren = defaultSlot();
  if (template) {
    if (isCreateFlexElement(template.resolveOptions?.mode) && !isOnlyOneRowWidget(template)) {
      const finalDefaultChildren = defaultChildren;
      defaultChildren = [
        DslRender.render(
          {
            ...template,
            dslNodeType: DslDefinitionType.PACK,
            widget: InternalWidget.Row,
            resolveOptions: {
              mode: ResolveMode.NORMAL
            }
          },
          undefined,
          { default: () => finalDefaultChildren }
        )!
      ];
    }
  }
  return defaultChildren;
}

function resolveRowStyle(rowDsl, parentCols?: number): CSSStyle {
  const rowHelper = new RowHelper(rowDsl, parentCols);
  return rowHelper.fetchRowStyle();
}

function resolveColStyle(
  colDsl: DslDefinition,
  parentDsl: DslDefinition,
  parentCols?: number,
  viewType?: ViewType
): CSSStyle {
  const colHelper = new ColHelper(new RowHelper(parentDsl, parentCols), colDsl, viewType);
  return colHelper.fetchColStyle();
}

function fixContainerWidgetSpan(widgets: DslDefinition[]) {
  const isContainer = !!widgets.every((w) => w.widget && w.widget === InternalWidget.Container);

  if (isContainer) {
    const placeSpan = widgets.reduce((span, widget) => {
      return span + (widget.span || 0);
    }, 0);

    const otherSpan = DEFAULT_COLS - placeSpan;

    if (otherSpan > 0) {
      const notSpanWidgets = widgets.filter((w) => !w.span);
      const span = Math.floor(otherSpan / notSpanWidgets.length);
      notSpanWidgets.forEach((w) => {
        w.span = w.span || span;
        w.widthType = w.widthType || FlexColMode.MANUAL;
      });
    }
  }
}

function deepTraverse(template: DslDefinition): DslDefinition[] {
  const widgets = template.widgets;

  fixContainerWidgetSpan(widgets);

  const res: DslDefinition[] = [];
  widgets.forEach((dsl) => {
    if (![InternalWidget.Row, InternalWidget.Col].includes(dsl.widget)) {
      res.push(dsl);
    } else {
      res.push(...deepTraverse(dsl));
    }
  });
  return res;
}

/**
 * 创建flex样式，消除row和col
 * @param template dsl
 * @param originChildren 原本的Children，会因为里面是Row或Col而修改
 * @param parentCols 作为父Cols传递
 * @param ViewType 视图类型，目前只发现SEARCH有特殊处理
 * @param origin 以originChildren为主
 * @returns
 */
export function cssStyleFlexResolve(
  template: DslDefinition | undefined,
  originChildren: VNode[],
  parentCols?: number,
  viewType?: ViewType,
  origin?: boolean
): { defaultChildren: VNode[]; rowStyle?: CSSStyle } {
  let defaultChildren: VNode[] = [],
    rowStyle: CSSStyle = {} as CSSStyle;
  if (template) {
    if (isCreateFlexElement(template.resolveOptions?.mode)) {
      const childDsls: DslDefinition[] = template.widgets;
      if (!childDsls || !childDsls.length) return { defaultChildren, rowStyle };
      if (!originChildren) return { defaultChildren, rowStyle };

      if (origin) {
        const { defaultChildren: resultDefaultChildren, rowStyle: resultRowStyle } = cssStyleFlexR(
          template,
          originChildren,
          parentCols,
          viewType
        );
        defaultChildren = resultDefaultChildren;
        rowStyle = resultRowStyle;
      } else {
        const realDsls = deepTraverse(template);
        const realChildren: VNode[] = (
          DslRender.fetchVNodeSlots({ widgets: realDsls } as DslDefinition) as any
        ).default();
        const { defaultChildren: resultDefaultChildren, rowStyle: resultRowStyle } = cssStyleFlexR(
          template,
          realChildren,
          parentCols,
          viewType
        );
        defaultChildren = resultDefaultChildren;
        rowStyle = resultRowStyle;
      }
    }
  }
  return { defaultChildren, rowStyle };
}

/**
 * 递归创建flex样式
 * @param template dsl
 * @param consumptionVNodes 去掉row和col后的VNode（不带row和col样式）或原始VNode（兼容searchActionBar没有dsl）
 * @param parentCols 作为父Cols传递
 * @param ViewType 视图类型，目前只发现SEARCH有特殊处理
 * @returns
 */
function cssStyleFlexR(
  template: DslDefinition,
  consumptionVNodes: VNode[],
  parentCols?: number,
  viewType?: ViewType
): { defaultChildren: VNode[]; rowStyle: CSSStyle; rowClassList: string[] } {
  let defaultChildren: VNode[] = [],
    rowStyle: CSSStyle = {} as CSSStyle,
    rowClassList: string[] = [];
  const childDsl: DslDefinition[] = template.widgets;

  childDsl.forEach((childDsl, index) => {
    if (childDsl.widget === InternalWidget.Row) {
      rowStyle = resolveRowStyle(childDsl, parentCols);
      const { defaultChildren: childDefaultChildren } = cssStyleFlexR(
        childDsl,
        consumptionVNodes,
        parentCols,
        viewType
      );
      defaultChildren.push(...childDefaultChildren);
      rowClassList.push('oio-row');
    } else if (childDsl.widget === InternalWidget.Col) {
      rowStyle = resolveRowStyle(template, parentCols);
      const {
        defaultChildren: childDefaultChildren,
        rowStyle: childRowStyle,
        rowClassList: childRowClassList
      } = cssStyleFlexR(childDsl, consumptionVNodes);
      const colStyle = resolveColStyle(childDsl, template, parentCols, viewType);
      const childColClassList: string[] = childDsl.class?.split(' ') || [];
      defaultChildren.push(
        createVNode(
          'div',
          { style: { ...childRowStyle, ...colStyle }, class: [...childRowClassList, ...childColClassList, 'oio-col'] },
          childDefaultChildren
        )
      );
    } else if (consumptionVNodes.length) {
      rowStyle = resolveRowStyle(template, parentCols);
      const colStyle = resolveColStyle(childDsl, template, parentCols, viewType);
      const child = consumptionVNodes.shift();
      if (child) {
        child.props = { ...child.props, colStyle };
        defaultChildren.push(child);
      }
    }
  });
  return { defaultChildren, rowStyle, rowClassList };
}
