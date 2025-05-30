import { Component, defineComponent } from 'vue';
import { useWidgetTag, UseWidgetTagMixin } from '../mixin';
import { CreateCustomWidgetFunction, registerCustomWidgetFunction } from '../resolve';
import { createCommonCustomWidget, createElementWidget, createPackWidget } from '../resolve/internal';

const CUSTOM_VIEW_TAG_MAP = new Map<Component, string | string[]>();

function registerViewTag(component: Component, name: string | string[]) {
  CUSTOM_VIEW_TAG_MAP.set(component, name);
}

function getViewTagMap() {
  return CUSTOM_VIEW_TAG_MAP;
}

function registerElementTag(
  widgetName: string,
  component?: Component,
  tagName?: string | string[],
  createTagWidgetFn?: CreateCustomWidgetFunction
) {
  registerViewTagFull(createTagWidgetFn || createElementWidget, widgetName, component, tagName);
}

function registerPackTag(
  widgetName: string,
  component?: Component,
  tagName?: string | string[],
  createTagWidgetFn?: CreateCustomWidgetFunction
) {
  registerViewTagFull(createTagWidgetFn || createPackWidget, widgetName, component, tagName);
}

function registerCustomTag(
  widgetName: string,
  component?: Component,
  tagName?: string | string[],
  createTagWidgetFn?: CreateCustomWidgetFunction
) {
  registerViewTagFull(createTagWidgetFn || createCommonCustomWidget, widgetName, component, tagName);
}

function registerViewTagFull(
  createTagWidgetFn: CreateCustomWidgetFunction,
  widgetName: string,
  component?: Component,
  tagName?: string | string[]
) {
  tagName = !tagName ? widgetName : tagName;
  if (!component) {
    component = defineComponent({
      name: widgetName,
      mixins: [UseWidgetTagMixin],
      inheritAttrs: false,
      setup(props, context) {
        return useWidgetTag(props, context, {
          getWidgetTag() {
            return widgetName;
          }
        });
      }
    });
  }

  registerViewTag(component, tagName);

  registerCustomWidgetFunction(widgetName, createTagWidgetFn);
}

export { registerViewTag, getViewTagMap, registerElementTag, registerPackTag, registerCustomTag };
