import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioSwitch } from '../index';

describe('OioSwitch', () => {
  it('渲染时会追加 switch 前缀类名', () => {
    const wrapper = mount(OioSwitch, {
      props: {
        checked: false
      },
      global: {
        stubs: {
          ASwitch: {
            template: '<button class="a-switch" v-bind="$attrs"></button>'
          }
        }
      }
    });

    const root = wrapper.find('.a-switch');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-switch`);
  });
});
