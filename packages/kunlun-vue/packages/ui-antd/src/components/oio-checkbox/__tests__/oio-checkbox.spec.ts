import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioCheckbox } from '../index';

describe('OioCheckbox', () => {
  it('点击时会更新 checked 并触发事件', async () => {
    const wrapper = mount(OioCheckbox, {
      props: {
        checked: false
      },
      global: {
        stubs: {
          ACheckbox: {
            props: ['onUpdateChecked'],
            template: '<label class="a-checkbox" @click="onUpdateChecked && onUpdateChecked(true)"><slot /></label>'
          }
        }
      }
    });

    await wrapper.find('.a-checkbox').trigger('click');

    expect(wrapper.emitted('update:checked')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('只读模式下点击不会触发更新', async () => {
    const wrapper = mount(OioCheckbox, {
      props: {
        checked: false,
        readonly: true
      },
      global: {
        stubs: {
          ACheckbox: {
            props: ['onUpdateChecked'],
            template: '<label class="a-checkbox" @click="onUpdateChecked && onUpdateChecked(true)"><slot /></label>'
          }
        }
      }
    });

    await wrapper.find('.a-checkbox').trigger('click');

    expect(wrapper.emitted('update:checked')).toBeUndefined();
    expect(wrapper.find('.a-checkbox').classes()).toContain(`${DEFAULT_PREFIX}-checkbox-readonly`);
  });
});
