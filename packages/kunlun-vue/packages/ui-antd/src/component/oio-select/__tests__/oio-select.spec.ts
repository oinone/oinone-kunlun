import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioSelect } from '../index';

describe('OioSelect', () => {
  it('渲染时会追加 select 与 dropdown 前缀类名', () => {
    const wrapper = mount(OioSelect, {
      props: {
        options: []
      },
      global: {
        stubs: {
          ASelect: {
            props: ['popupClassName'],
            template: '<div class="a-select" v-bind="$attrs" :class="popupClassName"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-select');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-select`);
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-select-dropdown`);
  });
});
