import { DslDefinition, DslSlots, DslSlotUtils, UnknownDslDefinition } from '@oinone/kunlun-dsl';
import { WidgetProps } from '@oinone/kunlun-engine';
import { Slots, VNode } from 'vue';
import { VueWidget, Widget } from '../basic';
import { DslRender } from '../util';

/**
 * dsl渲染组件属性
 */
export interface DslRenderWidgetProps extends WidgetProps {
  /**
   * 内部组件
   */
  internal?: boolean;
  /**
   * 模板dsl定义
   */
  template?: DslDefinition;
  /**
   * 在父组件中的插槽名
   */
  slotName?: string;
  /**
   * 支持的插槽名称
   */
  slotNames?: string[];
  /**
   * 插槽上下文
   */
  slotContext?: Record<string, unknown>;
}

export class DslRenderWidget<Props extends DslRenderWidgetProps = DslRenderWidgetProps> extends VueWidget {
  @Widget.Reactive()
  protected internal = false;

  @Widget.Reactive()
  protected template: DslDefinition | undefined;

  @Widget.Reactive()
  protected slotName: string | undefined;

  protected supportedSlotNames!: string[];

  protected dslSlots: DslSlots | undefined;

  protected slots: Slots | null | undefined;

  public initialize(props: Props) {
    super.initialize(props);
    this.internal = props.internal || false;
    this.template = props.template;
    this.slotName = props.slotName;
    this.supportedSlotNames = props.slotNames || [];
    if (this.template && this.supportedSlotNames.length) {
      this.dslSlots = DslSlotUtils.fetchSlotsBySlotNames(this.template, this.supportedSlotNames);
    }
    return this;
  }

  public getDsl(): DslDefinition {
    return this.template || UnknownDslDefinition;
  }

  public getSlotName() {
    return this.slotName;
  }

  public render(ctx?: Record<string, unknown>, slots?: Slots): VNode | VNode[] {
    if (this.template) {
      if (this.slots === undefined) {
        if (this.internal) {
          this.slots = this.internalRender(slots) || null;
        } else {
          this.slots = this.commonRender(slots) || null;
        }
      }
      if (this.slots) {
        return this.rawRender(ctx, this.slots);
      }
    }
    return this.rawRender(ctx, slots);
  }

  protected rawRender(ctx?: Record<string, unknown>, slots?: Slots): VNode | VNode[] {
    return super.render(ctx, slots);
  }

  protected internalRender(slots?: Slots): Slots | undefined {
    if (slots && Object.keys(slots).length) {
      return slots;
    }
    if (this.dslSlots && Object.keys(this.dslSlots).length) {
      return DslRender.renderSlots(this.dslSlots);
    }
  }

  protected commonRender(slots?: Slots): Slots | undefined {
    if (this.dslSlots && Object.keys(this.dslSlots).length) {
      return DslRender.renderSlots(this.dslSlots);
    }
    if (slots && Object.keys(slots).length) {
      return slots;
    }
  }
}
