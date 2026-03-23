import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioDrawer } from '../index';

describe('OioDrawer', () => {
  it('渲染时会带上 drawer 基础类名并渲染默认插槽', () => {
    const wrapper = mount(OioDrawer, {
      props: {
        visible: true
      },
      slots: {
        default: '<div class="content">body</div>'
      },
      global: {
        stubs: {
          ADrawer: {
            template: '<div class="a-drawer"><slot /></div>'
          },
          OioButton: {
            template: '<button class="oio-button"></button>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          },
          OioTooltipHelp: {
            template: '<div class="oio-tooltip-help"></div>'
          },
          OioIcon: {
            template: '<span class="oio-icon"></span>'
          },
          OioCloseIcon: {
            template: '<span class="oio-close-icon"></span>'
          }
        }
      }
    });

    const root = wrapper.find('.a-drawer');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-drawer`);
  });
});
