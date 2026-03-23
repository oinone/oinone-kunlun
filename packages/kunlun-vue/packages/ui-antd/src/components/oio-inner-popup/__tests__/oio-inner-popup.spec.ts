import { mount } from '@vue/test-utils';

import { OioInnerPopup } from '../index';

describe('OioInnerPopup', () => {
  it('挂载时会在 teleport 目标上追加标记类名', () => {
    const target = document.createElement('div');
    target.id = 'inner-popup-target';
    document.body.appendChild(target);

    mount(OioInnerPopup, {
      props: {
        visible: true,
        teleport: () => target
      },
      slots: {
        default: '<div>content</div>'
      },
      global: {
        stubs: {
          OioButton: {
            template: '<button class="oio-button"><slot /></button>'
          },
          OioIcon: {
            template: '<span class="oio-icon"></span>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          },
          OioTooltipHelp: {
            template: '<div class="oio-tooltip-help"></div>'
          },
          OioCloseIcon: {
            template: '<span class="oio-close-icon"></span>'
          }
        }
      }
    });

    expect(target.classList.contains('oio-inner-popup-target')).toBe(true);
  });
});
