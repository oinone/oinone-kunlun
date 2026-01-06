import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioPopconfirm } from '../index';

describe('OioPopconfirm', () => {
  it('根据 placement 计算出最终的弹出位置并附加 overlay 类名', () => {
    const wrapper = mount(OioPopconfirm, {
      props: {
        placement: 'tl',
        title: '标题',
        text: '内容',
        enterText: '确定',
        cancelText: '取消'
      },
      slots: {
        default: '<button>trigger</button>'
      },
      global: {
        stubs: {
          APopconfirm: {
            props: ['placement', 'open', 'overlayClassName'],
            template:
              '<div class="a-popconfirm" :data-placement="placement" :data-open="open" :class="overlayClassName"><slot /></div>'
          },
          APopover: {
            template: '<div class="a-popover"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-popconfirm');
    expect(root.attributes('data-placement')).toBe('topLeft');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-popconfirm-overlay`);
  });
});
