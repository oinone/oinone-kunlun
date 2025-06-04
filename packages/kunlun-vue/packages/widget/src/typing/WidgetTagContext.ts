import { DslDefinition } from '@oinone/kunlun-dsl';
import { Slots } from 'vue';
import { VueWidget } from '../basic';
import { DslDefinitionWidgetProps } from '../dsl';

/**
 * 渲染组件
 */
export interface RenderWidget {
  /**
   * 当前组件唯一键
   */
  handle: string;
  /**
   * 主要组件
   */
  widget: VueWidget;
  /**
   * 混入组件
   */
  widgets: VueWidget[];
}

/**
 * 组件标签上下文
 */
export interface WidgetTagContext extends Record<string, unknown> {
  dslDefinition: DslDefinition;

  slotName: string;

  widgetHandle: string;

  widget: VueWidget;

  widgets: VueWidget[];

  slotContext?: Record<string, unknown>;

  getWidgetTag(): string;

  getParentHandle(): string;

  getDslDefinition(): DslDefinition | undefined;

  getSlotName(): string;

  getProps(): DslDefinitionWidgetProps;

  getCurrentSlots(): Slots | undefined;

  createWidget(slots?: Slots): RenderWidget | undefined;
}
