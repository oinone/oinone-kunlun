import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';
import isNil from 'lodash/isNil';
import {
  DEFAULT_SLOT_NAME,
  DslDefinition,
  DslDefinitionHelper,
  DslDefinitionType,
  DslSlots,
  TemplateDslDefinition
} from '../typing';

export const DEFAULT_CHILDREN_KEY = 'widgets';

export const SLOT_NAME_KEY = 'name';

export const IGNORED_TEMPLATE_DSL_KEYS = ['dslNodeType', 'slot'];

/**
 * dsl插槽工具类
 */
export class DslSlotUtils {
  /**
   * 合并模板dsl到指定dsl
   * @param dsl 指定dsl
   * @param template 模板定义
   */
  public static mergeTemplateToLayout(dsl: DslDefinition, template: DslDefinition): DslDefinition {
    return DslSlotUtils.mergeSlotsToLayout(dsl, template, DslSlotUtils.fetchAllSlots(template));
  }

  /**
   * 合并dsl插槽到指定dsl
   * @param dsl 指定dsl
   * @param template 模板定义
   * @param dslSlots dsl插槽
   * @return 合并后的dsl
   */
  public static mergeSlotsToLayout(dsl: DslDefinition, template: DslDefinition, dslSlots: DslSlots): DslDefinition {
    if (!dsl.dslNodeType) {
      dsl.dslNodeType = DslDefinitionType.VIEW;
    }
    const slotNames: Record<string, boolean> = {};
    Object.keys(dslSlots).forEach((v) => {
      slotNames[v] = false;
    });
    const targetDsl = cloneDeep(dsl);
    const slotName = DslSlotUtils.mergeTemplateProperties(targetDsl, dslSlots);
    if (slotName) {
      const slotNameRepeat = slotNames[slotName];
      if (!isNil(slotNameRepeat)) {
        slotNames[slotName] = true;
      }
    } else {
      DslSlotUtils.mergeProperties(targetDsl, template, [DEFAULT_CHILDREN_KEY]);
    }
    DslSlotUtils.traversalWidgets(dsl, targetDsl, dslSlots, slotNames);
    return targetDsl;
  }

  /**
   * 合并dsl插槽到指定dsl
   * @param originDsl 原始指定dsl
   * @param targetDsl 指定dsl
   * @param dslSlots dsl插槽
   * @param slotNames 插槽名称去重
   * @private
   */
  private static mergeChildSlotsToLayout(
    originDsl: DslDefinition,
    targetDsl: DslDefinition,
    dslSlots: DslSlots,
    slotNames: Record<string, boolean>
  ): void {
    const slotName = DslSlotUtils.mergeTemplateProperties(targetDsl, dslSlots);
    if (slotName) {
      const slotNameRepeat = slotNames[slotName];
      if (!isNil(slotNameRepeat)) {
        if (slotNameRepeat) {
          throw new Error('模板中不允许递归使用插槽进行二次处理');
        } else {
          slotNames[slotName] = true;
        }
      } else {
        console.warn('Invalid slot name.', dslSlots, slotName);
        return;
      }
      if (dslSlots[slotName]?.widgets) {
        DslSlotUtils.reverseMergeChildSlotsToTemplate(originDsl, targetDsl, DslSlotUtils.fetchAllSlots(targetDsl));
      } else {
        DslSlotUtils.traversalWidgets(originDsl, targetDsl, dslSlots, slotNames);
      }
    } else {
      DslSlotUtils.traversalWidgets(originDsl, targetDsl, dslSlots, slotNames);
    }
  }

  /**
   * 反向合并子插槽到指定dsl，仅支持单层，且不进行递归
   * @param originDsl 原始指定dsl
   * @param targetDsl 指定dsl
   * @param dslSlots dsl插槽
   * @private
   */
  private static reverseMergeChildSlotsToTemplate(
    originDsl: DslDefinition,
    targetDsl: DslDefinition,
    dslSlots: DslSlots
  ) {
    originDsl.widgets?.forEach((originChild) => {
      const slotName = DslSlotUtils.fetchSlotName(originChild);
      if (slotName) {
        const dslSlot = dslSlots[slotName];
        if (dslSlot) {
          const targetIndex = targetDsl.widgets?.findIndex(
            (targetChild) => DslSlotUtils.fetchSlotName(targetChild) === slotName
          );
          if (targetIndex != null && targetIndex !== -1) {
            const cloneOriginChild = cloneDeep(originChild);
            DslSlotUtils.mergeProperties(cloneOriginChild, dslSlot, IGNORED_TEMPLATE_DSL_KEYS);
            targetDsl.widgets.splice(targetIndex, 1, cloneOriginChild);
          }
        }
      }
    });
  }

  /**
   * 遍历{@link DslDefinition#widgets}
   * <p>
   * 此方法仅适用于{@link originDsl}和{@link targetDsl}的{@link DslDefinition#widgets}完全一致的情况
   * </p>
   * @param originDsl 原始指定dsl
   * @param targetDsl 指定dsl
   * @param dslSlots dsl插槽
   * @param slotNames 插槽名称去重
   * @private
   */
  private static traversalWidgets(
    originDsl: DslDefinition,
    targetDsl: DslDefinition,
    dslSlots: DslSlots,
    slotNames: Record<string, boolean>
  ): void {
    originDsl.widgets?.forEach((originChild, index) => {
      if (targetDsl.widgets?.length) {
        const targetChild = targetDsl.widgets?.[index];
        if (targetChild) {
          DslSlotUtils.mergeChildSlotsToLayout(originChild, targetChild, dslSlots, slotNames);
        }
      }
    });
  }

  public static fetchSlotsBySlotNames(dsl: DslDefinition | undefined, slotNames: string[]): DslSlots {
    const slots: DslSlots = {} as DslSlots;
    const defaultSlotWidgets: DslDefinition[] = [];
    dsl?.widgets?.forEach((dslDefinition) => {
      if (DslDefinitionHelper.isTemplate(dslDefinition)) {
        const slotName = dslDefinition.slot;
        if (!slotName) {
          console.error('Invalid template definition. slot is required.');
          return;
        }
        if (slotNames.includes(slotName)) {
          slots[slotName] = dslDefinition;
        } else {
          defaultSlotWidgets.push(dslDefinition);
        }
      } else if (DslDefinitionHelper.isSlot(dslDefinition)) {
        dslDefinition.widgets?.forEach((v) => defaultSlotWidgets.push(v));
      } else {
        defaultSlotWidgets.push(dslDefinition);
      }
    });
    DslSlotUtils.defaultSlotAfterProperties(slots, defaultSlotWidgets);
    return slots;
  }

  private static fetchSlotName(dsl: DslDefinition, ignoredKeys?: string[]): string | undefined {
    let slotName: string | undefined;
    if (DslDefinitionHelper.isSlot(dsl)) {
      slotName = dsl.name;
      ignoredKeys?.push(SLOT_NAME_KEY);
    } else {
      slotName = (dsl as TemplateDslDefinition).slot;
    }
    return slotName;
  }

  /**
   * 合并模板属性到指定dsl中
   * @param dsl 指定dsl
   * @param dslSlots dsl插槽
   * @param ignoredKeys 忽略合并键
   * @private
   */
  private static mergeTemplateProperties(
    dsl: DslDefinition,
    dslSlots: DslSlots,
    ignoredKeys?: string[]
  ): string | undefined {
    const finalIgnoredKeys = [...IGNORED_TEMPLATE_DSL_KEYS, ...(ignoredKeys || [])];
    const slotName = DslSlotUtils.fetchSlotName(dsl, finalIgnoredKeys);
    if (slotName) {
      const dslSlot = dslSlots[slotName];
      if (dslSlot) {
        DslSlotUtils.mergeProperties(dsl, dslSlot, finalIgnoredKeys);
        return slotName;
      }
    }
  }

  /**
   * 将目标dsl的属性合并到原dsl定义
   * @param origin 原dsl定义
   * @param target 目标dsl定义
   * @param ignoredKeys 忽略的keys
   * @private
   */
  private static mergeProperties(origin: DslDefinition, target: DslDefinition, ignoredKeys?: string[]): void {
    Object.entries(target).forEach(([key, value]) => {
      if ((ignoredKeys || []).includes(key)) {
        return;
      }
      origin[key] = value;
    });
  }

  /**
   * 合并widgets
   * @param origin
   * @param target
   * @private
   */
  private static mergeWidgets(origin: DslDefinition, target: DslDefinition | DslDefinition[]) {
    let originWidgets = origin.widgets;
    if (!originWidgets) {
      originWidgets = [];
      origin.widgets = originWidgets;
    }
    if (Array.isArray(target)) {
      target.forEach((v) => originWidgets.push(v));
    } else {
      target.widgets?.forEach((v) => originWidgets.push(v));
    }
  }

  /**
   * 获取模板插槽（自动进行合并）
   * @param template 模板定义
   * @private
   */
  private static fetchAllSlots(template: DslDefinition): DslSlots {
    const slots: DslSlots = {} as DslSlots;
    const defaultSlotWidgets: DslDefinition[] = [];
    template.widgets?.forEach((dslDefinition) => {
      if (DslDefinitionHelper.isTemplate(dslDefinition)) {
        const slotName = dslDefinition.slot;
        if (!slotName) {
          console.error('Invalid template definition. slot must be not blank.');
          return;
        }
        let slot = slots[slotName];
        if (slot) {
          const cloneIgnoredKeys = clone(IGNORED_TEMPLATE_DSL_KEYS);
          cloneIgnoredKeys.push(DEFAULT_CHILDREN_KEY);
          DslSlotUtils.mergeProperties(slot, dslDefinition, cloneIgnoredKeys);
          DslSlotUtils.mergeWidgets(slot, dslDefinition);
        } else {
          slot = dslDefinition;
          slots[slotName] = slot;
        }
      } else {
        defaultSlotWidgets.push(dslDefinition);
      }
    });
    DslSlotUtils.defaultSlotAfterProperties(slots, defaultSlotWidgets);
    return slots;
  }

  private static createDefaultSlot(widgets: DslDefinition[]) {
    return { dslNodeType: DslDefinitionType.TEMPLATE, slot: DEFAULT_SLOT_NAME, widgets };
  }

  private static defaultSlotAfterProperties(slots: DslSlots, defaultSlotWidgets: DslDefinition[]) {
    if (defaultSlotWidgets.length) {
      const { default: defaultSlot } = slots;
      if (defaultSlot) {
        const finalDefaultSlot = { ...defaultSlot, widgets: clone(defaultSlot.widgets) };
        DslSlotUtils.mergeWidgets(finalDefaultSlot, defaultSlotWidgets);
        slots.default = finalDefaultSlot;
      } else {
        slots.default = DslSlotUtils.createDefaultSlot(defaultSlotWidgets);
      }
    }
  }
}
