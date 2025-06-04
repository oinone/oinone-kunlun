import { DEFAULT_SLOT_NAME, DslDefinition, DslDefinitionHelper, DslDefinitionType } from '@oinone/kunlun-dsl';
import { DslRender } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { Slot, VNode } from 'vue';
import { InternalWidget, ResolveMode } from './typing';

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
