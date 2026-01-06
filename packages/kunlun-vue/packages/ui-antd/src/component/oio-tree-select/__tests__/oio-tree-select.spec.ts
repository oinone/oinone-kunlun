import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioTreeSelect } from '../index';

describe('OioTreeSelect', () => {
  it('根据只读与多选状态追加对应类名', () => {
    const wrapper = mount(OioTreeSelect, {
      props: {
        options: [],
        mappingOptions: false,
        mode: 'multiple',
        readonly: true
      },
      global: {
        stubs: {
          ATreeSelect: {
            template: '<div class="a-tree-select" v-bind="$attrs"><slot /></div>'
          },
          APopover: {
            template: '<div class="a-popover"><slot /></div>'
          },
          OioEmptyData: {
            template: '<div class="oio-empty-data"></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-tree-select');
    expect(root.classes()).toEqual(
      expect.arrayContaining([
        `${DEFAULT_PREFIX}-select`,
        `${DEFAULT_PREFIX}-tree-select`,
        `${DEFAULT_PREFIX}-select-readonly`,
        `${DEFAULT_PREFIX}-select-multiple`
      ])
    );
  });
});
