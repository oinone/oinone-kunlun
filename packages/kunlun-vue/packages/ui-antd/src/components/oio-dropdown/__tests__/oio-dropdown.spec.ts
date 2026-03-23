import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioDropdown } from '../index';

describe('OioDropdown', () => {
  it('默认触发方式同时包含 hover 与 click', () => {
    const wrapper = mount(OioDropdown, {
      slots: {
        default: '<button>trigger</button>',
        overlay: '<div>menu</div>'
      },
      global: {
        stubs: {
          ADropdown: {
            props: ['trigger'],
            template: '<div class="a-dropdown">{{ trigger.join(",") }}<slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-dropdown');
    expect(root.text()).toContain('hover');
    expect(root.text()).toContain('click');
  });

  it('受控模式下关闭事件通过 update:value 抛出', async () => {
    const wrapper = mount(OioDropdown, {
      props: {
        value: true
      },
      slots: {
        default: '<button>trigger</button>',
        overlay: '<div>menu</div>'
      },
      global: {
        stubs: {
          ADropdown: {
            props: ['onOpenChange'],
            template: '<div class="a-dropdown" @click="onOpenChange && onOpenChange(false)"><slot /></div>'
          }
        }
      }
    });

    await wrapper.find('.a-dropdown').trigger('click');

    expect(wrapper.emitted('update:value')?.[0]).toEqual([false]);
  });

  it('渲染时会带上 dropdown 前缀类名', () => {
    const wrapper = mount(OioDropdown, {
      slots: {
        default: '<button>trigger</button>',
        overlay: '<div>menu</div>'
      },
      global: {
        stubs: {
          ADropdown: {
            template: '<div class="a-dropdown"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-dropdown');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-dropdown`);
  });
});
