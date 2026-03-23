import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioEmptyData } from '../index';

describe('OioEmptyData', () => {
  it('在未传 description 和插槽时使用默认文案', () => {
    const wrapper = mount(OioEmptyData, {
      global: {
        stubs: {
          AEmpty: {
            props: ['description'],
            template: '<div class="a-empty">{{ description }}</div>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-empty');
    expect(root.text()).toBe('暂无数据');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-empty-data`);
  });

  it('当 loading 不为 null 时包裹在 OioSpin 中', () => {
    const wrapper = mount(OioEmptyData, {
      props: {
        loading: true
      },
      global: {
        stubs: {
          AEmpty: {
            template: '<div class="a-empty"></div>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          }
        }
      }
    });

    expect(wrapper.find('.oio-spin').exists()).toBe(true);
  });
});
