import type { Slots, VNode } from 'vue';
import { renderWidgets } from '../render';
import { VueWidget } from '../../basic';

class RenderTestWidget extends VueWidget {
  private renderFn?: (context?: Record<string, unknown>, slots?: Slots) => VNode | VNode[];

  public setRenderFn(fn: (context?: Record<string, unknown>, slots?: Slots) => VNode | VNode[]) {
    this.renderFn = fn;
  }

  public render(context?: Record<string, unknown>, slots?: Slots): VNode | VNode[] {
    if (!this.renderFn) {
      return [] as unknown as VNode[];
    }
    return this.renderFn(context, slots);
  }
}

describe('renderWidgets', () => {
  it('单个 widget 时应使用传入插槽进行渲染', () => {
    const widget = new RenderTestWidget().initialize() as RenderTestWidget;
    let receivedContext: Record<string, unknown> | undefined;
    let receivedSlots: Slots | undefined;

    widget.setRenderFn((context, slots) => {
      receivedContext = context;
      receivedSlots = slots;
      return {} as VNode;
    });

    const ctx = { foo: 'bar' };
    const slots: Slots = {
      default: () => [{ key: 'slot' } as unknown as VNode]
    };

    const vNode = renderWidgets([widget], ctx, slots);

    expect(vNode).toBeTruthy();
    expect(receivedContext).toBe(ctx);
    expect(receivedSlots).toBeDefined();
    expect(receivedSlots && receivedSlots.default).toBe(slots.default);
  });

  it('多个 widget 时应将前一个渲染结果作为下一个的 default 插槽', () => {
    const innerWidget = new RenderTestWidget().initialize() as RenderTestWidget;
    const innerVNode = { key: 'inner' } as unknown as VNode;
    innerWidget.setRenderFn(() => {
      return innerVNode;
    });

    const outerWidget = new RenderTestWidget().initialize() as RenderTestWidget;
    let receivedChildren: VNode[] | undefined;

    outerWidget.setRenderFn((_context, slots) => {
      const children = slots?.default ? (slots.default() as VNode[]) : [];
      receivedChildren = children;
      return { key: 'outer' } as unknown as VNode;
    });

    const ctx = {};

    const vNode = renderWidgets([outerWidget, innerWidget], ctx);

    expect(vNode).toBeTruthy();
    expect(receivedChildren).toBeDefined();
    expect(receivedChildren && receivedChildren[0]).toBe(innerVNode);
  });
});
