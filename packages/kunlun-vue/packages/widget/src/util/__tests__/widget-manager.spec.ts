import { VueWidget } from '../../basic';
import { getWidget, getWidgetNotNull, newVueWidget } from '../widget-manager';

describe('widget-manager', () => {
  it('newVueWidget 应创建 VueWidget 实例', () => {
    const widget = newVueWidget();

    expect(widget).toBeInstanceOf(VueWidget);
  });

  it('getWidget 应根据 handle 返回已注册的 Widget 实例', () => {
    const widget = new VueWidget().initialize();
    const handle = widget.getHandle();

    const result = getWidget(handle);

    expect(result).toBe(widget);
  });

  it('getWidgetNotNull 在未找到 handle 时返回新的 VueWidget', () => {
    const handle = 'not-exist-handle';

    const result = getWidgetNotNull(handle);

    expect(result).toBeInstanceOf(VueWidget);
  });
});
