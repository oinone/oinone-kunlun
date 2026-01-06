import { Widget } from '../Widget';
import type { WidgetBehaviorSubjection } from '../Widget';

class TestWidget extends Widget<{ value: number }, null> {
  @Widget.Reactive({ displayName: 'displayValue' })
  public value = 0;

  @Widget.Method('increment')
  public increment() {
    this.value += 1;
    return this.value;
  }

  @Widget.Watch('displayValue')
  public onValueChange() {}

  public render() {
    return null;
  }
}

const behaviorIdentifier = Symbol('behavior-sub-context');

class BehaviorWidget extends Widget<{}, null> {
  @Widget.BehaviorSubContext(behaviorIdentifier)
  public channel!: WidgetBehaviorSubjection<{ value: string }>;

  public render() {
    return null;
  }
}

describe('Widget 基类', () => {
  it('Reactive/Method 装饰器应注册属性元数据', () => {
    const widget = new TestWidget().initialize({ value: 1 } as any) as TestWidget;
    const attrs = widget.getAttributes();
    const props = (widget as any).getProps();

    expect(attrs.get('displayValue')).toBe('value');
    expect(props).toContain('displayValue');

    const handle = widget.getHandle();
    const selected = Widget.select<TestWidget>(handle);
    expect(selected).toBe(widget);
  });

  it('Watch 装饰器应注册监听配置', () => {
    const widget = new TestWidget().initialize({ value: 1 } as any) as TestWidget;
    const watchers = widget.getWatchers();

    expect(watchers.length).toBeGreaterThan(0);
    expect(watchers.some((w) => w.path === 'displayValue')).toBe(true);
  });

  it('dispose 应从全局注册表中移除实例', () => {
    const widget = new TestWidget().initialize({ value: 1 } as any) as TestWidget;
    const handle = widget.getHandle();

    expect(Widget.select(handle)).toBe(widget);

    widget.dispose();

    expect(Widget.select(handle)).toBeUndefined();
  });

  it('BehaviorSubContext 应支持组件间通信', () => {
    const publisher = new BehaviorWidget().initialize() as BehaviorWidget;
    const subscriber = new BehaviorWidget().initialize() as BehaviorWidget;

    const received: string[] = [];

    subscriber.channel.subscribe((data) => {
      if (data) {
        received.push(data.value);
      }
    });

    publisher.channel.subject.next({ value: 'hello' });

    expect(received).toContain('hello');
  });
});
