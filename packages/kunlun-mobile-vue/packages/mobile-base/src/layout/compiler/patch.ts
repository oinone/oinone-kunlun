import { TagAttrs, IResolveWidget } from './typing';
import { filterProps } from './share';

/**
 *  mask比较
 *
 *  1. 如果当前xml中标签的tag不一致，就要重新渲染
 *  2. 比较widget，如果不一致，就重新渲染widget
 *  3. 如果标签一致并且widget一致,就要比较属性
 *
 * @param {IResolveWidget} newWidget 新的widget
 * @param {IResolveWidget} oldWidget 就的widget
 *
 * @returns {IResolveWidget} 比较后的widget
 */
const patch = (newWidget: IResolveWidget, oldWidget?: IResolveWidget) => {
  if (!oldWidget) {
    newWidget.replaceTag = true;
    return newWidget;
  }

  const { tagName, children, widget, widgetInstance, ...attrs } = newWidget;
  const {
    tagName: oldTagName,
    children: oldChildren,
    widget: oW,
    widgetInstance: oldWidgetInstance,
    ...oldAttrs
  } = oldWidget;

  if (tagName !== oldWidget.tagName) {
    newWidget.replaceTag = true;
  } else {
    newWidget.replaceTag = false;

    if (widget !== oW) {
      newWidget.replaceWidget = true;
    } else {
      newWidget.replaceWidget = false;

      const ignoreNewProps: TagAttrs = filterProps(attrs) as TagAttrs;
      const ignoreOldProps: TagAttrs = filterProps(oldAttrs) as TagAttrs;

      const replaceProps = patchProps(ignoreNewProps as TagAttrs, ignoreOldProps as TagAttrs);
      newWidget.replaceProps = !!replaceProps;
    }

    const c = patchWidgetChildren(children, oldWidget.children);
    newWidget.children = c;
  }

  return newWidget;
};

const patchWidgetChildren = (newChildrenWidget: IResolveWidget[] = [], oldChildrenWidget: IResolveWidget[] = []) => {
  return newChildrenWidget.map((children, index) => {
    return patch(children, oldChildrenWidget[index]);
  });
};

/**
 * 属性比较, 如果属性一致，返回false，代表着属性不需要替换
 *  否则就替换属性
 *
 * `属性比较不会处理widget`
 *
 * @param {TagAttrs} newProps 新的属性
 * @param {TagAttrs} oldProps 旧的属性
 *
 *  @returns boolean
 */
const patchProps = (newProps: TagAttrs, oldProps: TagAttrs): boolean => {
  const l1 = Object.keys(newProps).length;
  const l2 = Object.keys(oldProps).length;

  let replaceProps = false;

  if (l1 !== l2) {
    replaceProps = true;
  } else if (l1 === l2) {
    for (const key in newProps) {
      if (Object.prototype.hasOwnProperty.call(newProps, key)) {
        if (oldProps[key] === newProps[key] || newProps[key] === 'widget') {
          // eslint-disable-next-line no-continue
          continue;
        }

        replaceProps = true;
      }
    }
  }
  return replaceProps;
};

export { patch };
