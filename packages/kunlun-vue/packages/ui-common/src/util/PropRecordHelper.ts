import { CastHelper, CSSStyle, StringHelper } from '@kunlun/shared';
import { isArray, isFunction, isNil, isObject, isString } from 'lodash-es';
import { Slot, Slots, VNodeProps } from 'vue';
import { StyleHelper } from './style';

/**
 * Slot映射
 */
export interface SlotMapping {
  /**
   * 原Slot名称
   */
  origin: string;
  /**
   * 转换后的Slot名称，不设置默认为原Slot名称
   */
  target?: string;
  /**
   * 是否不空，默认提供<code>() => []</code>空插槽，同<code>default = (() => [])</code>
   */
  isNotNull?: boolean;
  /**
   * 如果原Slot为空，则使用默认Slot
   */
  default?: Slot;
}

/**
 * Slot名称组合类型
 * string 直接按名称获取Slot
 * [string, string] 按[0]获取Slot后将名称改为[1]并返回
 * SlotMapping 根据映射规则进行相应的转换
 */
export type SlotName = string | [string, string] | SlotMapping;

/**
 * 属性记录帮助类
 */
export class PropRecordHelper {
  /**
   * 根据属性定义进行相应的转换，自动过滤空值
   * @param propsDefine props定义
   * @param values 值的集合
   * @param defaultValues 默认值
   */
  public static convert(
    propsDefine: Record<string, unknown> & VNodeProps,
    values: Record<string, unknown>,
    defaultValues?: Record<string, unknown>
  ): Record<string, unknown> {
    let data = defaultValues;
    if (isNil(data)) {
      data = {};
    }
    Object.keys(propsDefine).forEach((key) => {
      const value = values[key];
      if (isNil(value)) {
        return;
      }
      data![key] = value;
    });
    return data;
  }

  /**
   * 收集Slots
   * @param self render中通过this传入
   * @param slotNames 插槽名称
   */
  public static collectionRenderSlots(
    self: {
      $slots: Slots;
    } & any,
    slotNames: SlotName[]
  ): Record<string, Slot> {
    const { $slots: slots } = self;
    const slotMap: Record<string, Slot> = {};
    for (const slotName of slotNames) {
      let slot: Slot | undefined;
      let target: string;
      if (isString(slotName)) {
        slot = PropRecordHelper.$$collectionSlots(slotName, slots, self);
        target = slotName;
      } else if (isArray(slotName)) {
        slot = PropRecordHelper.$$collectionSlots(slotName[0], slots, self);
        target = slotName[1];
      } else {
        const originSlotName = slotName.origin;
        slot = PropRecordHelper.$$collectionSlots(originSlotName, slots, self);
        target = slotName.target || originSlotName;
        if (!slot) {
          if (slotName.default) {
            slot = slotName.default;
          }
          if (!slot) {
            if (slotName.isNotNull) {
              slot = () => [];
            }
          }
        }
      }
      if (slot) {
        slotMap[target] = slot;
      }
    }
    return slotMap;
  }

  private static $$collectionSlots(slotName: string, slots: Slots, props: Record<string, unknown>): Slot | undefined {
    let slot: Slot | undefined = slots[slotName];
    if (!slot) {
      const propSlot = props[slotName];
      if (propSlot != null) {
        if (typeof propSlot === 'function') {
          slot = propSlot as Slot;
        } else {
          slot = (() => propSlot) as Slot;
        }
      }
    }
    return slot;
  }

  /**
   * 收集Slots
   * @param slots Slots render中通过this.$slots传入
   * @param slotNames 插槽名称
   */
  public static collectionSlots(slots: Slots, slotNames: SlotName[]): Record<string, Slot> {
    const slotMap: Record<string, Slot> = {};
    for (const slotName of slotNames) {
      let slot: Slot | undefined;
      let target: string;
      if (isString(slotName)) {
        slot = slots[slotName];
        target = slotName;
      } else if (isArray(slotName)) {
        slot = slots[slotName[0]];
        target = slotName[1];
      } else {
        const originSlotName = slotName.origin;
        slot = slots[originSlotName];
        target = slotName.target || originSlotName;
        if (!slot) {
          if (slotName.default) {
            slot = slotName.default;
          }
          if (!slot) {
            if (slotName.isNotNull) {
              slot = () => [];
            }
          }
        }
      }
      if (slot) {
        slotMap[target] = slot;
      }
    }
    return slotMap;
  }

  private static HTML_INTERNAL_ATTRIBUTES = ['id', 'title', 'unselectable', 'href', 'target'];

  public static collectionBasicProps(
    attrs: Record<string, unknown>,
    classNames?: string[],
    style?: string | CSSStyle
  ): Record<string, unknown> {
    let basicProps: Record<string, unknown> = {};
    classNames = StringHelper.append(classNames || [], CastHelper.cast(attrs.class));
    const attrStyle = attrs.style as CSSStyle;
    if (style) {
      if (isObject(attrStyle)) {
        style = {
          ...(StyleHelper.parse(style) || {}),
          ...attrStyle
        };
      }
    } else {
      style = attrStyle;
    }
    if (classNames.length) {
      basicProps.class = classNames;
    }
    if (style && Object.keys(style).length) {
      basicProps.style = style;
    }
    PropRecordHelper.HTML_INTERNAL_ATTRIBUTES.forEach((key) => {
      const value = attrs[key];
      if (!isNil(value)) {
        basicProps[key] = value;
      }
    });
    basicProps = {
      ...basicProps,
      ...PropRecordHelper.collectionHTMLAttributes(attrs)
    };
    return basicProps;
  }

  private static HTML_ATTRIBUTES_PREFIX = ['data-', 'aria-'];

  private static collectionHTMLAttributes(attr: Record<string, unknown>): Record<string, unknown> {
    const coll: Record<string, unknown> = {};
    Object.entries(attr).forEach(([key, value]) => {
      if (PropRecordHelper.HTML_ATTRIBUTES_PREFIX.some((v) => key.startsWith(v)) && !isNil(value)) {
        coll[key] = value;
      }
      if (key.startsWith('on') && isFunction(value)) {
        coll[key] = value;
      }
    });
    return coll;
  }
}
