import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioInput } from '../index';

describe('OioInput', () => {
  it('默认使用 new-password 作为 autocomplete 并追加基础类名', () => {
    const wrapper = mount(OioInput, {
      global: {
        stubs: {
          AInput: {
            props: ['autocomplete'],
            template: '<input class="a-input" v-bind="$attrs" :autocomplete="autocomplete" />'
          }
        }
      }
    });

    const input = wrapper.find('input');
    expect(input.attributes('autocomplete')).toBe('new-password');
    expect(input.classes()).toContain(`${DEFAULT_PREFIX}-input`);
  });

  it('readonly 与 allowClear 时追加对应类名', () => {
    const wrapper = mount(OioInput, {
      props: {
        readonly: true,
        allowClear: true,
        value: 'text'
      },
      global: {
        stubs: {
          AInput: {
            props: ['autocomplete'],
            template: '<input class="a-input" v-bind="$attrs" :autocomplete="autocomplete" />'
          }
        }
      }
    });

    const input = wrapper.find('input');
    expect(input.classes()).toEqual(
      expect.arrayContaining([
        `${DEFAULT_PREFIX}-input`,
        `${DEFAULT_PREFIX}-input-readonly`,
        `${DEFAULT_PREFIX}-input-allow-clear`
      ])
    );
  });
});
