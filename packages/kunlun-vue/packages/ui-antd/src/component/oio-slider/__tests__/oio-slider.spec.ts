import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioSlider } from '../index';

describe('OioSlider', () => {
  it('根据 direction 计算垂直方向并追加类名', () => {
    const wrapper = mount(OioSlider, {
      props: {
        direction: 'vertical',
        min: 0,
        max: 100
      },
      global: {
        stubs: {
          ASlider: {
            props: ['vertical'],
            template: '<div class="a-slider" v-bind="$attrs" :data-vertical="vertical"></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-slider');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-slider`);
    expect(root.attributes('data-vertical')).toBe('true');
  });
});
