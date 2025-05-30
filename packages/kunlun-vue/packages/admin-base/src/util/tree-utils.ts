import {
  DEFAULT_SLOT_NAME,
  DslDefinition,
  DslDefinitionHelper,
  DslDefinitionType,
  DslSlots,
  DslSlotUtils,
  TemplateDslDefinition,
  ViewDslDefinition
} from '@kunlun/dsl';
import {
  createDefaultLayout,
  getRealTtype,
  ModelCache,
  Pagination,
  RuntimeModelField,
  RuntimeRelationField,
  RuntimeView,
  translateValueByKey
} from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { isDev } from '@kunlun/router';
import { StringHelper, uniqueKeyGenerator } from '@kunlun/shared';
import { OioNotification } from '@kunlun/vue-ui-antd';
import { OioTreeNode } from '@kunlun/vue-ui-common';
import { DslRender } from '@kunlun/vue-widget';
import { isNil, isObject, isString, toString } from 'lodash-es';
import { Slot } from 'vue';
import { SimpleTreeModelField, TreeData, TreeNodeMetadata } from '../typing';

export class TreeUtils {
  public static DSL_NODES_TYPE = 'nodes';

  public static DSL_NODE_TYPE = 'node';

  public static convert(dsl: DslDefinition | undefined): TreeNodeMetadata | undefined {
    if (!dsl) {
      return undefined;
    }
    const { widgets } = dsl;
    if (!widgets || !widgets.length) {
      return undefined;
    }
    let root: TreeNodeMetadata | undefined;
    let parent: TreeNodeMetadata | undefined;
    const appendChild = (widget: DslDefinition) => {
      const { model, title, label, labelFields, searchFields, references, selfReferences, filter, search, icon } =
        widget;
      if (!model) {
        return;
      }
      const rowActionsSlot = DslSlotUtils.fetchSlotsBySlotNames(widget, ['rowActions'])?.rowActions;
      let vSlot: Slot | undefined;
      if (rowActionsSlot && rowActionsSlot.widgets?.length) {
        vSlot = DslRender.renderSlots({
          default: rowActionsSlot
        })?.default;
      }
      const metadata: TreeNodeMetadata = {
        ...widget,
        key: uniqueKeyGenerator(),
        title,
        model,
        label,
        labelFields: StringHelper.convertArray(labelFields),
        searchFields: StringHelper.convertArray(searchFields),
        icon,
        filter,
        rowActionsSlot: vSlot
      };
      TreeUtils.convertSimpleTreeModelField(widget, model, references, (val) => (metadata.references = val));
      TreeUtils.convertSimpleTreeModelField(widget, model, selfReferences, (val) => (metadata.selfReferences = val));
      TreeUtils.convertSimpleTreeModelField(widget, model, search, (val) => (metadata.search = val));
      if (parent) {
        parent.child = metadata;
        metadata.parent = parent;
      } else {
        root = metadata;
      }
      parent = metadata;
    };
    for (const widget of widgets) {
      const appendWidget = (targetWidget: DslDefinition) => {
        if (targetWidget.dslNodeType === TreeUtils.DSL_NODES_TYPE) {
          const nodesWidgets = targetWidget.widgets;
          if (nodesWidgets) {
            for (const nodeWidget of nodesWidgets) {
              appendChild(nodeWidget);
            }
          }
        } else if (targetWidget.dslNodeType === TreeUtils.DSL_NODE_TYPE) {
          appendChild(targetWidget);
        } else if (DslDefinitionHelper.isTemplate(targetWidget) && targetWidget.slot === DEFAULT_SLOT_NAME) {
          const nodesWidgets = targetWidget.widgets;
          if (nodesWidgets) {
            for (const nodeWidget of nodesWidgets) {
              appendWidget(nodeWidget);
            }
          }
        }
      };
      appendWidget(widget);
    }
    return root;
  }

  public static convertSimpleTreeModelField(
    dsl: DslDefinition,
    model: string,
    target: string | SimpleTreeModelField,
    setter: (val: SimpleTreeModelField) => void
  ) {
    if (isString(target)) {
      const rs = target.split('#');
      if (rs.length === 2) {
        setter({
          model: rs[0],
          fieldName: rs[1]
        });
      } else {
        setter({
          model,
          fieldName: rs[0]
        });
      }
    } else if (isObject(target)) {
      setter(target);
    }
  }

  public static findMetadataByKey(root: TreeNodeMetadata, key: string): TreeNodeMetadata | undefined {
    let target: TreeNodeMetadata | undefined = root;
    while (target) {
      if (target.key === key) {
        return target;
      }
      target = target.child;
    }
    return undefined;
  }

  public static hasMore(pagination: Pagination | undefined) {
    if (!pagination) {
      return false;
    }
    const { current = 1, pageSize = 0, total = 0 } = pagination;
    return total !== 0 && current * pageSize < total;
  }

  public static LOAD_MORE_NODE_CLASS_NAME = 'default-tree-load-more-node';

  public static SELECT_ALL_CLASS_NAME = 'default-tree-select-all-node';

  public static SELECT_ALL_KEY = 'select-all-key';

  public static createLoadMoreNode<V = unknown>(parent: OioTreeNode<V> | undefined): OioTreeNode<V> {
    return {
      key: uniqueKeyGenerator(),
      value: {} as V,
      parent,
      children: [],
      isLeaf: true,
      class: TreeUtils.LOAD_MORE_NODE_CLASS_NAME,
      title: translateValueByKey('加载更多'),
      loadingMore: false,
      selectable: false
    };
  }

  public static fillLoadMoreAction(children: OioTreeNode<TreeData>[]) {
    const length = children.length;
    if (length) {
      const lastedChild = children[length - 1];
      const hasMore = TreeUtils.hasMore(lastedChild.parent?.value?.pagination);
      if (hasMore) {
        if (lastedChild.class !== TreeUtils.LOAD_MORE_NODE_CLASS_NAME) {
          children = [...children, TreeUtils.createLoadMoreNode(lastedChild.parent)];
        }
      }
      children.forEach((child) => {
        child.children = TreeUtils.fillLoadMoreAction(child.children || []);
      });
    }
    return children;
  }

  public static async getModelFieldMetadata(
    simpleModelField: SimpleTreeModelField,
    targetModel: string
  ): Promise<RuntimeModelField | undefined> {
    const { model, fieldName } = simpleModelField;
    const modelDefinition = await ModelCache.get(model || targetModel);
    return modelDefinition?.modelFields.find((v) => v.data === fieldName);
  }

  public static newCondition(key: string, value: unknown): Condition {
    const condition = new Condition(key);
    if (isNil(value)) {
      condition.isNull();
    } else {
      condition.equal(toString(value));
    }
    return condition;
  }

  public static async consumerReferenceModelField(
    originModel: string,
    modelField: RuntimeRelationField,
    consumer: (originFields: string[], targetFields: string[], index: number, reverse: boolean) => void,
    consumerBefore?: () => void
  ): Promise<boolean> {
    const { name, model: targetModel, references, relationFields, referenceFields } = modelField;
    if (references && relationFields?.length && referenceFields?.length) {
      await consumerBefore?.();
      const { length } = referenceFields;
      const realTtype = getRealTtype(modelField);
      if (realTtype) {
        switch (realTtype) {
          case ModelFieldType.OneToOne:
          case ModelFieldType.ManyToOne:
            if (originModel === references) {
              for (let i = 0; i < length; i++) {
                consumer(referenceFields, relationFields, i, true);
              }
            } else {
              for (let i = 0; i < length; i++) {
                consumer(relationFields, referenceFields, i, false);
              }
            }
            break;
          case ModelFieldType.OneToMany:
            if (originModel === targetModel) {
              for (let i = 0; i < length; i++) {
                consumer(relationFields, referenceFields, i, false);
              }
            } else {
              for (let i = 0; i < length; i++) {
                consumer(referenceFields, relationFields, i, true);
              }
            }
            break;
          case ModelFieldType.ManyToMany:
            if (originModel === references) {
              for (let i = 0; i < length; i++) {
                consumer(
                  referenceFields,
                  referenceFields.map((v) => `${name}.${v}`),
                  i,
                  true
                );
              }
            } else {
              if (isDev()) {
                console.error('Invalid search field.');
              }
              OioNotification.error(
                translateValueByKey('错误'),
                translateValueByKey('搜索字段为多对多类型时，只允许使用主表格中的字段进行搜索')
              );
              return false;
            }
            break;
        }
      }
      return true;
    }
    return false;
  }

  public static seekContentLayout(view: RuntimeView | undefined, viewType: ViewType, inline: boolean) {
    return createDefaultLayout(viewType, inline);
  }

  public static mergeLayoutBySlotName(
    dslSlots: DslSlots,
    slotName: string,
    inline: boolean,
    view: RuntimeView | undefined
  ): { targetSlot: TemplateDslDefinition; viewDsl: ViewDslDefinition; viewTemplate: DslDefinition } | undefined {
    let targetSlot = dslSlots[slotName];
    if (targetSlot) {
      const viewDsl = targetSlot?.widgets?.find((v) => v.dslNodeType === DslDefinitionType.VIEW);
      if (!viewDsl || !DslDefinitionHelper.isView(viewDsl)) {
        return undefined;
      }
      let viewTemplate: DslDefinition;
      const viewLayout = TreeUtils.seekContentLayout(view, viewDsl.type, inline);
      if (viewLayout) {
        viewTemplate = DslSlotUtils.mergeTemplateToLayout(viewLayout, viewDsl);
        targetSlot = {
          dslNodeType: DslDefinitionType.TEMPLATE,
          slot: slotName,
          widgets: [viewTemplate]
        };
      } else {
        viewTemplate = viewDsl;
        if (isDev()) {
          console.warn('Invalid content layout.', view, viewDsl, inline);
        }
      }
      dslSlots[slotName] = targetSlot;
      return { targetSlot, viewDsl, viewTemplate };
    }
    return undefined;
  }
}
