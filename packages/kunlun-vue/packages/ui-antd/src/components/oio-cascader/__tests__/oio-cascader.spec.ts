import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioCascader } from '../index';

describe('OioCascader', () => {
  it('多选模式下会追加 multiple 相关类名', () => {
    const wrapper = mount(OioCascader, {
      props: {
        mode: 'multiple',
        options: [],
        enableSearch: true
      },
      global: {
        stubs: {
          ACascader: {
            template: '<div class="a-cascader"><slot /></div>'
          },
          APopover: {
            template: '<div class="a-popover"><slot /></div>'
          },
          OioEmptyData: {
            template: '<div class="oio-empty"></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-cascader');
    const classAttr = root.attributes('class') || '';

    expect(classAttr.split(' ')).toEqual(
      expect.arrayContaining([
        `${DEFAULT_PREFIX}-select`,
        `${DEFAULT_PREFIX}-cascader`,
        `${DEFAULT_PREFIX}-select-multiple`
      ])
    );
  });
});
