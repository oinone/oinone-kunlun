import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioDivider } from '../index';

describe('OioDivider', () => {
  it('渲染时会带上 divider 前缀类名并展示内容', () => {
    const wrapper = mount(OioDivider, {
      slots: {
        default: 'divider-text'
      },
      global: {
        stubs: {
          ADivider: {
            template: '<div class="a-divider"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-divider');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-divider`);
    expect(root.text()).toContain('divider-text');
  });
});
