import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioBlock } from '../index';

describe('OioBlock', () => {
  it('在 flex 模式下会根据 gutter 设置 gap 样式', () => {
    const wrapper = mount(OioBlock, {
      props: {
        flex: true,
        gutter: 8
      }
    });

    const div = wrapper.find('div');
    const style = div.attributes('style') || '';

    expect(div.classes()).toContain(`${DEFAULT_PREFIX}-block-flex`);
    expect(style).toContain('gap: 8px 8px');
  });

  it('在 inline 模式下会追加 inline 类名', () => {
    const wrapper = mount(OioBlock, {
      props: {
        inline: true
      }
    });

    expect(wrapper.find('div').classes()).toContain(`${DEFAULT_PREFIX}-block-inline`);
  });
});
