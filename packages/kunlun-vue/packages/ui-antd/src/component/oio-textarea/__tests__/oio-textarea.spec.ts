import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioTextarea } from '../index';

describe('OioTextarea', () => {
  it('readonly 与 allowClear 时追加对应类名', () => {
    const wrapper = mount(OioTextarea, {
      props: {
        readonly: true,
        allowClear: true,
        value: 'text'
      },
      global: {
        stubs: {
          ATextarea: {
            template: '<textarea class="a-textarea" v-bind="$attrs"></textarea>'
          }
        }
      }
    });

    const textarea = wrapper.find('textarea');
    expect(textarea.classes()).toEqual(
      expect.arrayContaining([
        `${DEFAULT_PREFIX}-textarea`,
        `${DEFAULT_PREFIX}-textarea-readonly`,
        `${DEFAULT_PREFIX}-textarea-allow-clear`
      ])
    );
  });

  it('开启 showCount 时在外层追加统计信息', () => {
    const wrapper = mount(OioTextarea, {
      props: {
        showCount: true,
        maxlength: 10,
        value: 'abc'
      },
      global: {
        stubs: {
          ATextarea: {
            template: '<textarea class="a-textarea" v-bind="$attrs"></textarea>'
          }
        }
      }
    });

    const wrapperDiv = wrapper.find(`.${DEFAULT_PREFIX}-textarea-show-count`);
    expect(wrapperDiv.exists()).toBe(true);
    expect(wrapperDiv.attributes('data-count')).toBe('3');
    expect(wrapperDiv.attributes('data-total')).toBe('10');
  });
});
