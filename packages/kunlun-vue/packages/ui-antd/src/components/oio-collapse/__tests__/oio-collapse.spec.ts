import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioCollapse } from '../index';

describe('OioCollapse', () => {
  it('根据 type 设置 bordered 和 ghost 属性以及类名', () => {
    const wrapper = mount(OioCollapse, {
      props: {
        type: 'ghost',
        activeKey: [],
        componentData: {}
      },
      global: {
        stubs: {
          ACollapse: {
            template: '<div class="a-collapse"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-collapse');
    const classAttr = root.attributes('class') || '';

    expect(classAttr.split(' ')).toEqual(
      expect.arrayContaining([`${DEFAULT_PREFIX}-collapse`, `${DEFAULT_PREFIX}-collapse-ghost`])
    );
  });
});
