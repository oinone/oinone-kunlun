import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioTabs } from '../index';

describe('OioTabs', () => {
  it('渲染时会追加 tabs 前缀类名', () => {
    const wrapper = mount(OioTabs, {
      props: {
        activeKey: 'tab1'
      },
      slots: {
        default: '<div>tab</div>'
      },
      global: {
        stubs: {
          ATabs: {
            props: ['id', 'activeKey', 'tabPosition'],
            template:
              '<div class="a-tabs" v-bind="$attrs" :data-id="id" :data-active="activeKey" :data-position="tabPosition"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-tabs');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-tabs`);
  });

  it('当 invisible 为 true 时通过 v-show 隐藏', () => {
    const wrapper = mount(OioTabs, {
      props: {
        activeKey: 'tab1',
        invisible: true
      },
      slots: {
        default: '<div>tab</div>'
      },
      global: {
        stubs: {
          ATabs: {
            props: ['id', 'activeKey', 'tabPosition'],
            template:
              '<div class="a-tabs" v-bind="$attrs" :data-id="id" :data-active="activeKey" :data-position="tabPosition"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-tabs');
    expect((root.element as HTMLElement).style.display).toBe('none');
  });
});
