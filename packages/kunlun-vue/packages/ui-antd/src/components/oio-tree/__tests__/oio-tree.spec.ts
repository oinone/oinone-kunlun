import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioTree } from '../index';

describe('OioTree', () => {
  it('渲染时会追加 tree 前缀类名', () => {
    const wrapper = mount(OioTree, {
      props: {
        data: []
      },
      global: {
        stubs: {
          ATree: {
            template: '<div class="a-tree"></div>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          }
        }
      }
    });

    const tree = wrapper.find('.a-tree');
    expect(tree.classes()).toContain(`${DEFAULT_PREFIX}-tree`);
    expect(wrapper.find('.oio-spin').exists()).toBe(false);
  });

  it('当 loading 不为 null 时包裹在 OioSpin 中', () => {
    const wrapper = mount(OioTree, {
      props: {
        data: [],
        loading: true
      },
      global: {
        stubs: {
          ATree: {
            template: '<div class="a-tree"></div>'
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
