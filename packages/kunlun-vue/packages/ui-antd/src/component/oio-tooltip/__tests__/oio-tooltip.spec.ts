import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioTooltip } from '../index';

describe('OioTooltip', () => {
  it('渲染时会追加 tooltip 相关类名', () => {
    const wrapper = mount(OioTooltip, {
      props: {
        title: 'title',
        visible: true
      },
      slots: {
        default: '<span>content</span>'
      },
      global: {
        stubs: {
          ATooltip: {
            props: ['visible', 'overlayClassName'],
            template:
              '<div class="a-tooltip" v-bind="$attrs" :data-visible="visible"><slot /><div class="overlay" :class="overlayClassName"></div></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-tooltip');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-tooltip`);
    expect(wrapper.find('.overlay').classes()).toContain(`${DEFAULT_PREFIX}-tooltip-overlay`);
  });

  it('disabled 时强制设置 visible 为 false', () => {
    const wrapper = mount(OioTooltip, {
      props: {
        title: 'title',
        visible: true,
        disabled: true
      },
      slots: {
        default: '<span>content</span>'
      },
      global: {
        stubs: {
          ATooltip: {
            props: ['visible', 'overlayClassName'],
            template:
              '<div class="a-tooltip" v-bind="$attrs" :data-visible="visible"><slot /><div class="overlay" :class="overlayClassName"></div></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-tooltip');
    expect(root.attributes('data-visible')).toBe('false');
  });
});
