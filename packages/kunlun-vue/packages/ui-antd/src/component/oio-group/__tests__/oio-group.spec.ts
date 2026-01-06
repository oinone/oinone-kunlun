import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioGroup } from '../index';

describe('OioGroup', () => {
  it('根据 props 渲染基础类名与边框样式', () => {
    const wrapper = mount(OioGroup, {
      props: {
        border: true,
        bizStyle: 'style2'
      },
      slots: {
        default: '<div>content</div>'
      },
      global: {
        stubs: {
          OioGroupHelp: {
            template: '<div class="oio-group-help-stub"></div>'
          }
        }
      }
    });

    const root = wrapper.find('div');
    expect(root.classes()).toEqual(
      expect.arrayContaining([
        `${DEFAULT_PREFIX}-group`,
        `${DEFAULT_PREFIX}-group-border`,
        `${DEFAULT_PREFIX}-group-style2`
      ])
    );
  });

  it('当没有标题与工具栏时追加隐藏标题类名', () => {
    const wrapper = mount(OioGroup, {
      slots: {
        default: '<div>content</div>'
      }
    });

    const root = wrapper.find('div');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-group-title-hidden`);
  });
});
