import {
  DEFAULT_SLOT_NAME,
  DslDefinition,
  DslDefinitionHelper,
  DslDefinitionType,
  DslSlots,
  DslSlotUtils,
  ElementDslDefinition,
  PackDslDefinition,
  TemplateDslDefinition
} from '@oinone/kunlun-dsl';
import { StringHelper, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { intersection, isNil, isString } from 'lodash-es';
import { Component, createVNode, resolveDynamicComponent, Slots, VNode, withCtx } from 'vue';

export const DEFAULT_TAG_PREFIX = 'oinone';

export const SLOTS_KEY = '__slots';

export const RENDER_OPTIONS_KEY = '__render__options';

export const SLOT_CONTEXT_KEY = 'slotContext';

const htmlInternalTags: string[] = [
  'div',
  'a',
  'span',
  'table',
  'form',
  'detail',
  'ul',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'thead',
  'tbody',
  'tr',
  'th',
  'td'
];

/**
 * 渲染可选项
 */
export interface DslRenderOptions {
  /**
   * 动态key
   * 当key不存在时进行自动生成
   */
  dynamicKey?: boolean;
  /**
   * 是否强制更新
   * 永远使用新的key进行渲染
   */
  focusUpdate?: boolean;
  /**
   * 是否递归渲染
   * 递归渲染有性能损耗，但可以解决某些渲染问题，建议在明确递归层数的情况下局部使用该参数
   */
  recursion?: boolean;
  /**
   * vue createVNode patchFlag
   */
  patchFlag?: number;
  /**
   * vue createVNode dynamicProps
   */
  dynamicProps?: string[] | null;
  /**
   * vue createVNode isBlockNode
   */
  isBlockNode?: boolean;
  /**
   * 插槽上下文
   */
  slotContext?: Record<string, unknown>;
}

export type DslChildren = string | VNode[] | Slots;

/**
 * dsl扩展属性
 */
export type DslRenderExtendProp = {
  __slots?: DslChildren;
  __render__options?: DslRenderOptions;
};

export type DslRenderDefinition = DslDefinition & DslRenderExtendProp;

export type DslPropType = {
  dslDefinition: DslRenderDefinition;
  slotName: string;
  slotContext?: Record<string, unknown>;

  [key: string]: any;
} & DslRenderExtendProp;

function dslExtendPropProcess<T>(props: DslPropType, key: string, value?: T): T | undefined {
  let finalValue = props[key] as T | undefined;
  delete props[key];
  if (!finalValue && value) {
    finalValue = value;
    const { dslDefinition } = props;
    if (dslDefinition) {
      dslDefinition[key] = value;
    }
  }
  return finalValue;
}

type ResolveComponentType = Component | string;

/**
 * dsl渲染
 */
export class DslRender {
  private static resolveComponentCache: Record<string, ResolveComponentType> = {};

  private static resolveCommonComponentCache: Record<string, ResolveComponentType> = {};

  /**
   * 渲染指定dsl定义到对应插槽
   * @param dsl 指定dsl
   * @param slotName 插槽名称 默认为: default
   * @param children 插槽
   * @param options 渲染可选项
   */
  public static render(
    dsl: DslRenderDefinition,
    slotName = DEFAULT_SLOT_NAME,
    children?: DslChildren,
    options?: DslRenderOptions
  ): VNode | undefined {
    const component = DslRender.fetchComponent(dsl);
    if (!component) {
      return undefined;
    }
    return DslRender.createVNodeWithDslDefinition(component, dsl, slotName, children, options);
  }

  /**
   * 渲染dsl插槽
   * @param dslSlots dsl插槽
   */
  public static renderSlots(dslSlots: DslSlots): Slots {
    const slots = {};
    for (const slotName in dslSlots) {
      slots[slotName] = withCtx((context: Record<string, unknown>) => {
        return DslRender.createVNodeChildren(dslSlots[slotName]?.widgets, slotName, context);
      });
    }
    return slots;
  }

  /**
   * 通过指定dsl获取VNode插槽
   * @param dsl 指定dsl
   * @param supportedSlotNames
   */
  public static fetchVNodeSlots(dsl: DslDefinition | undefined, supportedSlotNames?: string[]): Slots | undefined {
    if (!dsl) {
      return undefined;
    }
    const vSlots = dsl[SLOTS_KEY];
    if (vSlots) {
      return vSlots;
    }
    if (!supportedSlotNames) {
      const finalSupportedSlotNames = [DEFAULT_SLOT_NAME];
      dsl.widgets?.forEach((widget) => {
        if (DslDefinitionHelper.isTemplate(widget)) {
          let slotName = (widget as TemplateDslDefinition).slot;
          if (!slotName) {
            slotName = DEFAULT_SLOT_NAME;
          }
          finalSupportedSlotNames.push(slotName);
        }
      });
      supportedSlotNames = [...new Set(finalSupportedSlotNames)];
    }
    const dslSlots = DslSlotUtils.fetchSlotsBySlotNames(dsl, supportedSlotNames);
    return DslRender.renderSlots(dslSlots);
  }

  /**
   * 根据dsl节点类型获取对应组件
   *
   * @remarks
   * - {@link DslDefinitionType#VIEW} resolve rule: `{@link DEFAULT_TAG_PREFIX}-{@link DslDefinition#dslNodeType}` (Unsupported auto resolve methods)<br />
   * - {@link DslDefinitionType#PACK} resolve rule: `{@link PackDslDefinition#widget}` (Supported auto resolve methods)<br>
   * - {@link DslDefinitionType#ELEMENT} resolve rule: `{@link ElementDslDefinition#widget}` (Supported auto resolve methods)<br>
   * - Others resolve rule: `{@link DslDefinition#dslNodeType}` (Unsupported auto resolve methods)
   *
   * @param dslDefinition dsl定义
   * @return
   * - 正确获取组件时返回: Component | string;
   * - 未知类型、插槽或模板类型返回: null;
   * - 无效的dslNodeType返回: undefined
   */
  public static fetchComponent(dslDefinition: DslDefinition): ResolveComponentType | null | undefined {
    let { dslNodeType } = dslDefinition || {};
    if (!dslNodeType) {
      dslNodeType = DslDefinitionType.ELEMENT;
    }
    let component: ResolveComponentType | null | undefined;
    switch (dslNodeType as DslDefinitionType) {
      case DslDefinitionType.VIEW:
        component = resolveDynamicComponent(`${DEFAULT_TAG_PREFIX}-${dslDefinition.dslNodeType}`) as string;
        break;
      case DslDefinitionType.PACK: {
        const packDslDefinition = dslDefinition as PackDslDefinition;
        component = DslRender.resolveWidgetComponent(`${packDslDefinition.widget || 'group'}`);
        if (typeof component === 'string') {
          component = DslRender.resolveWidgetComponent(`${dslDefinition.dslNodeType}`);
        }
        break;
      }
      case DslDefinitionType.ELEMENT: {
        const elementDslDefinition = dslDefinition as ElementDslDefinition;
        component = DslRender.resolveWidgetComponent(`${elementDslDefinition.widget}`);
        if (typeof component === 'string') {
          component = DslRender.resolveWidgetComponent(`${dslDefinition.dslNodeType}`);
        }
        break;
      }
      case DslDefinitionType.ACTION:
      case DslDefinitionType.FIELD: {
        component = DslRender.resolveWidgetComponent(`${dslDefinition.dslNodeType}`);
        break;
      }
      case DslDefinitionType.UNKNOWN:
      case DslDefinitionType.SLOT:
      case DslDefinitionType.TEMPLATE:
        component = null;
        break;
      default:
        component = DslRender.resolveCommonWidgetComponent(dslNodeType);
        break;
    }
    return component;
  }

  private static createVNodeChildren(
    widgets: DslDefinition[] | undefined,
    slotName?: string,
    context?: Record<string, unknown>,
    offset?: number
  ): VNode[] {
    const children: VNode[] = [];
    if (!widgets) {
      return children;
    }
    if (!slotName) {
      slotName = DEFAULT_SLOT_NAME;
    }
    if (isNil(offset)) {
      offset = 0;
    }
    const { length } = widgets;
    for (let i = 0; i < length; i++) {
      const dslDefinition = widgets[i];
      const component = DslRender.fetchComponent(dslDefinition);
      if (component) {
        children.push(
          DslRender.createVNodeWithDslDefinition(
            component,
            dslDefinition,
            slotName,
            isString(component) ? DslRender.fetchVNodeSlots(dslDefinition) : undefined,
            context ? { slotContext: context } : undefined,
            i + offset
          )
        );
      } else if (component === null) {
        const { dslNodeType } = dslDefinition;
        switch (dslNodeType as DslDefinitionType) {
          case DslDefinitionType.SLOT: {
            const slotChildren = DslRender.createVNodeChildren(dslDefinition.widgets, slotName, context, i + offset);
            offset += slotChildren.length;
            slotChildren.forEach((child) => children.push(child));
            break;
          }
          case DslDefinitionType.UNKNOWN:
          case DslDefinitionType.TEMPLATE:
            // eslint-disable-next-line no-continue
            continue;
          default:
            console.error('Invalid component.');
            break;
        }
      }
    }
    return children;
  }

  private static createVNodeWithDslDefinition(
    component: ResolveComponentType,
    dsl: DslDefinition,
    slotName: string,
    children?: DslChildren,
    options?: DslRenderOptions,
    index?: number
  ) {
    if (!isNil(index) && dsl.__index !== index) {
      dsl.__index = index;
    }
    const isHTMLTag = isString(component);
    const props: DslPropType = isHTMLTag
      ? (PropRecordHelper.collectionBasicProps(dsl) as DslPropType)
      : {
          ...dsl,
          dslDefinition: { ...dsl },
          slotName
        };
    let finalChildren: unknown;
    if (isHTMLTag) {
      finalChildren = dsl.__content || dslExtendPropProcess(props, SLOTS_KEY, children);
    } else {
      finalChildren = dslExtendPropProcess(props, SLOTS_KEY, children);
    }
    const finalOptions = dslExtendPropProcess<DslRenderOptions>(props, RENDER_OPTIONS_KEY, options);
    const slotContext = finalOptions?.slotContext;
    if (slotContext) {
      const newSlotContext = options?.slotContext;
      if (newSlotContext) {
        finalOptions!.slotContext = newSlotContext;
      }
      props.slotContext = slotContext;
    }
    if (DslRenderHelper.predictIsUpdateKey(dsl, finalOptions)) {
      const key = uniqueKeyGenerator();
      dsl.key = key;
      props.key = key;
    }
    if (DslRenderHelper.predictIsRecursion(finalOptions) && !finalChildren && dsl.widgets?.length) {
      finalChildren = DslRender.fetchVNodeSlots(dsl);
    }
    let finalDynamicProps = finalOptions?.dynamicProps;
    if (slotContext) {
      finalDynamicProps = intersection(finalDynamicProps || [], [SLOT_CONTEXT_KEY]);
    }
    return createVNode(
      component,
      props,
      finalChildren,
      finalOptions?.patchFlag,
      finalDynamicProps,
      finalOptions?.isBlockNode
    );
  }

  private static resolveMethods: ((ss: string) => string | undefined)[] = [
    /**
     * 首字母转换为小写
     * @param ss 字符串
     */
    (ss) => {
      if (ss.indexOf('-') === -1) {
        const firstCharCode = ss.charCodeAt(0);
        if (firstCharCode >= StringHelper.UPPER_A_ASCLL && firstCharCode <= StringHelper.UPPER_Z_ASCLL) {
          return `${ss[0].toLowerCase()}${ss.substring(1)}`;
        }
      }
      return undefined;
    },
    /**
     * 首字母转换为大写
     * @param ss 字符串
     */
    (ss) => {
      if (ss.indexOf('-') === -1) {
        const firstCharCode = ss.charCodeAt(0);
        if (firstCharCode >= StringHelper.LOWER_A_ASCLL && firstCharCode <= StringHelper.LOWER_Z_ASCLL) {
          return `${ss[0].toUpperCase()}${ss.substring(1)}`;
        }
      }
      return undefined;
    },
    /**
     * CamelCase转换为KebabCase
     * @param ss 字符串
     */
    (ss) => {
      return StringHelper.camelCaseToKebabCase(ss);
    }
  ];

  private static resolveCommonWidgetComponent(widget: string): ResolveComponentType {
    let component = DslRender.resolveCommonComponentCache[widget];
    if (component) {
      return component;
    }
    if (htmlInternalTags.includes(widget)) {
      return widget;
    }
    component = resolveDynamicComponent(
      `${DEFAULT_TAG_PREFIX}-${StringHelper.camelCaseToKebabCase(widget)}`
    ) as ResolveComponentType;
    if (typeof component === 'string') {
      component = resolveDynamicComponent(widget) as ResolveComponentType;
    }
    DslRender.resolveCommonComponentCache[widget] = component;
    return component;
  }

  private static resolveWidgetComponent(widget: string): ResolveComponentType {
    let component = DslRender.resolveComponentCache[widget];
    if (component) {
      return component;
    }
    if (htmlInternalTags.includes(widget)) {
      return widget;
    }
    component = resolveDynamicComponent(widget) as ResolveComponentType;
    if (typeof component === 'string') {
      for (const resolveMethod of DslRender.resolveMethods) {
        const resolveWidget = resolveMethod(widget);
        if (resolveWidget) {
          const finalComponent = resolveDynamicComponent(resolveWidget) as ResolveComponentType;
          if (typeof finalComponent !== 'string') {
            component = finalComponent;
            break;
          }
        }
      }
    }
    DslRender.resolveComponentCache[widget] = component;
    return component;
  }
}

/**
 * dsl渲染帮助类
 */
class DslRenderHelper {
  /**
   * 判定是否需要更新Key
   * @param dsl 指定dsl
   * @param options 渲染可选项
   */
  public static predictIsUpdateKey(dsl: DslDefinition, options: DslRenderOptions | undefined): boolean {
    const dynamicKey = options?.dynamicKey || false;
    const focusUpdate = options?.focusUpdate || false;
    if (dsl.key) {
      if (focusUpdate) {
        return true;
      }
    } else if (dynamicKey) {
      return true;
    }
    return false;
  }

  public static predictIsRecursion(options: DslRenderOptions | undefined): boolean {
    return options?.recursion || false;
  }
}
