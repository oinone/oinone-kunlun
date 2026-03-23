import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioForm } from '../index';

describe('OioForm', () => {
  it('渲染时会带上 form 前缀类名', () => {
    const wrapper = mount(OioForm, {
      props: {
        data: {}
      },
      slots: {
        default: '<div class="form-content">content</div>'
      },
      global: {
        stubs: {
          AForm: {
            template: '<form class="a-form"><slot /></form>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          }
        }
      }
    });

    const form = wrapper.find('.a-form');
    expect(form.exists()).toBe(true);
    expect(form.classes()).toContain(`${DEFAULT_PREFIX}-form`);
  });

  it('当 loading 不为 null 时包裹在 OioSpin 中', () => {
    const wrapper = mount(OioForm, {
      props: {
        data: {},
        loading: true
      },
      slots: {
        default: '<div class="form-content">content</div>'
      },
      global: {
        stubs: {
          AForm: {
            template: '<form class="a-form"><slot /></form>'
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
