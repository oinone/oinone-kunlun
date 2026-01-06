import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioBreadcrumb } from '../index';

describe('OioBreadcrumb', () => {
  it('渲染时会带上 oio 前缀类名并透传插槽', () => {
    const wrapper = mount(OioBreadcrumb, {
      slots: {
        default: '<span class="breadcrumb-content">item</span>'
      },
      global: {
        stubs: {
          ABreadcrumb: {
            template: '<nav class="a-breadcrumb"><slot /></nav>'
          }
        }
      }
    });

    const nav = wrapper.find('nav');
    expect(nav.classes()).toContain(`${DEFAULT_PREFIX}-breadcrumb`);
    expect(nav.text()).toContain('item');
  });
});
