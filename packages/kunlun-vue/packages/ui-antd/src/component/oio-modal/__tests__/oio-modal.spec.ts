import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioModal } from '../index';

describe('OioModal', () => {
  it('渲染时会在外层追加 modal 前缀类名', () => {
    const wrapper = mount(OioModal, {
      props: {
        visible: true
      },
      slots: {
        default: '<div>content</div>'
      },
      global: {
        stubs: {
          AModal: {
            template: '<div class="a-modal" v-bind="$attrs"><slot /></div>'
          },
          OioButton: {
            template: '<button class="oio-button"><slot /></button>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          },
          OioTooltip: {
            template: '<div class="oio-tooltip"></div>'
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

    const modal = wrapper.find('.a-modal');
    expect(modal.classes()).toContain(`${DEFAULT_PREFIX}-modal`);
  });

  it('当 loading 为布尔值时默认插槽内容包裹在 OioSpin 中', () => {
    const wrapper = mount(OioModal, {
      props: {
        visible: true,
        loading: true
      },
      slots: {
        default: '<div class="modal-body">content</div>'
      },
      global: {
        stubs: {
          AModal: {
            template: '<div class="a-modal"><slot /></div>'
          },
          OioButton: {
            template: '<button class="oio-button"><slot /></button>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          },
          OioTooltip: {
            template: '<div class="oio-tooltip"></div>'
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

    expect(wrapper.find('.oio-spin').exists()).toBe(true);
  });
});
