import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioPagination } from '../index';

describe('OioPagination', () => {
  it('根据配置展示总数信息与页大小选项', () => {
    const wrapper = mount(OioPagination, {
      props: {
        total: 100,
        showTotal: true,
        pageSizeOptions: [10, 20],
        showJumper: true
      },
      global: {
        stubs: {
          APagination: {
            props: ['total', 'pageSizeOptions', 'showTotal', 'locale'],
            template:
              '<div class="a-pagination" v-bind="$attrs">' +
              '{{ showTotal && showTotal(total, []) }} ' +
              '{{ pageSizeOptions && pageSizeOptions.join(",") }} ' +
              '{{ locale && (locale.jump_to + locale.page) }}' +
              '</div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-pagination');
    expect(root.classes()).toContain(`${DEFAULT_PREFIX}-pagination`);
    const text = root.text();
    expect(text).toContain('100');
    expect(text).toContain('条');
    expect(text).toContain('10,20');
    expect(text).toContain('跳至');
    expect(text).toContain('页');
  });
});
