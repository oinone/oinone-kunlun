import { XMLTemplateParser } from '@oinone/kunlun-dsl';
import { ILayoutWidgetProps, IViewProps, TagName } from '@oinone/kunlun-engine';
import { GlobalConfig } from '@oinone/kunlun-meta';
import { instantiate } from '@oinone/kunlun-shared';
import { ViewWidget } from '@oinone/kunlun-vue-widget';
import { IMobileViewFilterOptions, LayoutWidget, MobileViewWidget } from '../basic';
import { MaskTemplate } from '../template';
import { filterProps, isFalsy } from './share';

import { ignoreAttr, IResolveWidget, TagAttrs } from './typing';

const XMLParse = new XMLTemplateParser();

/**
 * @description 根据tagName，获取对应的widget
 *
 * @param {string} tagName 标签名
 *
 * @return {ViewWidget}
 */
const resolveWidgetByTagName = (tagName: string): ViewWidget => {
  const options: IMobileViewFilterOptions = {
    tagName
  };
  const constructor = MobileViewWidget.Selector(options);
  if (!constructor) {
    throw new Error(`XML Parsing failed, The "${tagName}" tag could not be found`);
  }
  return instantiate(constructor);
};

/**
 * @description 递归获取所有的child的widget
 *
 * @param {TagAttrs[]} children child中的widget
 *
 * @returns { IResolveWidget[] }
 */
const resolveChildrenWidget = (children: TagAttrs[]): IResolveWidget[] => {
  if (!children || !children.length) {
    return [];
  }

  return children.map((child, index) => {
    const { tagName: name, ...arg } = child;

    const tagName = name.toLocaleLowerCase();
    const widgetInstance = resolveWidgetByTagName(tagName);

    return {
      ...arg,
      widgetInstance,
      tagName,
      childrenIndex: index,
      children: resolveChildrenWidget(child.children)
    };
  });
};

/**
 * @description 将xml解析成 widget
 *
 * @param {string} template xml
 *
 * @returns {IResolveWidget | undefined}  返回树形结构的数据，包含着对应的widget
 */
const maskXmlToWidget = (template: string): IResolveWidget | undefined => {
  const { mask = '' } = GlobalConfig.getConfig();

  try {
    const xml = template || mask || MaskTemplate;
    const maskDsl = XMLParse.parser(xml);
    const { tagName, children = [], ...arg } = maskDsl.root;
    if (tagName !== TagName.Mask) {
      console.error(`mask xml root tagName must be use 'mask', but here it is \n ${xml}`);
      return maskXmlToWidget(MaskTemplate);
    }

    const widgetInstance = resolveWidgetByTagName(tagName.toLocaleLowerCase());

    const childrenWidget = resolveChildrenWidget(children);

    return {
      ...arg,
      widgetInstance,
      tagName: tagName.toLocaleLowerCase(),
      children: childrenWidget
    };
  } catch (error) {
    console.error(error);
    throw new Error(`XML Parsing failed, ${template}`);
  }
};

/**
 * 渲染xml对应的widget
 *
 * @param {<T>ViewWidget} parentWidget 父widget
 * @param {IResolveWidget} childWidget 子widget
 * @param {IViewProps} props widget 初始化的时候，接受的参数
 *
 * @example
 *
 * const widget = maskXmlToWidget(template)
 * renderWidget(this, widget)
 *
 * renderWidget内部接受this，会调用this的 `createWidget` 方法。
 * 并且根据 childWidget, 动态创建对应的widget
 */
const renderWidget = <T extends ViewWidget>(
  parentWidget: T,
  childWidget: IResolveWidget,
  props: IViewProps = {} as any
) => {
  const { replaceProps = null, replaceTag = null, replaceWidget = null, childrenIndex, children = [] } = childWidget;
  /**
   * * replaceProps * 值域「true、false、null」
   *    如果为true，那么就要动态修改当前widget的props
   *
   * * replaceTag * 值域「true、false、null」
   *    如果为true，那么就要重新重新渲染当前的widget
   * * replaceWidget * 值域「true、false、null」
   *    如果为true，那么就要重新重新渲染当前的widget
   */
  if (replaceProps || replaceTag || replaceWidget) {
    const childrenInstance = parentWidget.getChildrenInstance();
    const index = childrenIndex === undefined ? childrenInstance.length - 1 : childrenIndex;

    const matchWidget = childrenInstance[index] as LayoutWidget | undefined;

    if (replaceTag) {
      /**
       * 如果是替换`标签`
       *  1. 如果有matchWidget，那么就要用新的widget替换老的widget
       *    1.1 否则就是新增的tag
       */

      const specifiedIndex = matchWidget ? index : undefined;
      const widget = parentWidget.createWidget(childWidget.widgetInstance, undefined, props, specifiedIndex, true);
      renderChildrenWidget(widget, children);
    } else if (matchWidget) {
      /**
       * 如果是修改widget：
       *  1. 创建widget，将widget替换原先的widget
       */
      if (replaceWidget) {
        const widget = parentWidget.createWidget(childWidget.widgetInstance, undefined, props, index, true);
        renderChildrenWidget(widget, children);
      } else if (replaceProps) {
        /**
         * 如果是替换`属性`
         *
         * 直接调用 renderStyle 方法， @see {LayoutWidget}
         */
        matchWidget.renderStyle(filterProps(props) as ILayoutWidgetProps);
        renderChildrenWidget(matchWidget as any, children);
      }
    }
  } else {
    /**
     * 如果replaceProps、replaceTag、replaceWidget都为false的时候，就要比较它的子节点，因为子节点可能发生了变化
     */
    if (isFalsy(replaceProps) && isFalsy(replaceTag) && isFalsy(replaceWidget)) {
      const childrenInstance = parentWidget.getChildrenInstance();
      const index = childrenIndex === undefined ? childrenInstance.length - 1 : childrenIndex;
      const matchWidget = childrenInstance[index] as ViewWidget | undefined;

      matchWidget && renderChildrenWidget(matchWidget, children);
      return;
    }

    /**
     * 重新创建对应的widget
     */
    const parent = parentWidget.createWidget(childWidget.widgetInstance, undefined, props, undefined, true);

    renderChildrenWidget(parent, children);
  }
};

function renderChildrenWidget<T extends ViewWidget>(parentWidget: T, children: IResolveWidget[]) {
  const childrenWidgets = parentWidget.getChildren();
  if (children && children.length) {
    const l1 = childrenWidgets.length;
    const l2 = children.length;

    /**
     * 如果上一次widget中的children长度比当前要渲染的children长度大,那么就要销毁掉上一次多余的child
     */
    if (l1 > l2) {
      childrenWidgets.slice(l2).forEach((c) => c.dispose());
    }

    children.forEach((child) => {
      const arrts = {};
      Object.keys(child).forEach((key) => {
        if (!ignoreAttr.includes(key)) {
          const value = child[key];
          if (value == null) {
            arrts[key] = null;
          } else {
            arrts[key] = child[key];
          }
        }
      });

      /**
       *dslNode存储的widgetInstance置为null，因为它存储的是个class，如果数据庞大，可能会导致内存不够。
       */
      renderWidget(parentWidget, child, {
        ...arrts,
        dslNode: {
          ...child,
          children: child.children.map((c) => ({ ...c, widgetInstance: null })) || [],
          widgetInstance: null
        }
      });
    });
  } else {
    /**
     * 如果当前渲染的widget没有children，那么就要把上一次widget中的children全部销毁
     */
    // childrenWidgets.forEach((c) => c.dispose());
  }
}

export { maskXmlToWidget, renderWidget };
