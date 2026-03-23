import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioList } from '../index';

describe('OioList', () => {
  it('当列表为空时渲染 OioEmptyData', () => {
    const wrapper = mount(OioList, {
      props: {
        list: []
      },
      global: {
        stubs: {
          OioEmptyData: {
            template: '<div class="oio-empty-data"></div>'
          },
          OioCheckbox: {
            template: '<input type="checkbox" class="oio-checkbox" />'
          },
          ARadio: {
            template: '<input type="radio" class="a-radio" />'
          },
          OioIcon: {
            template: '<span class="oio-icon"></span>'
          }
        }
      }
    });

    expect(wrapper.find('.oio-empty-data').exists()).toBe(true);
  });

  it('在多选模式下渲染全选行', () => {
    const wrapper = mount(OioList, {
      props: {
        list: [
          {
            key: '1',
            label: 'Item1',
            value: '1',
            data: {}
          }
        ],
        mode: 'multiple',
        showCheckedAll: true
      },
      global: {
        stubs: {
          OioEmptyData: {
            template: '<div class="oio-empty-data"></div>'
          },
          OioCheckbox: {
            template: '<input type="checkbox" class="oio-checkbox" />'
          },
          ARadio: {
            template: '<input type="radio" class="a-radio" />'
          },
          OioIcon: {
            template: '<span class="oio-icon"></span>'
          }
        }
      }
    });

    expect(wrapper.classes()).toContain(`${DEFAULT_PREFIX}-list`);
    expect(wrapper.text()).toContain('全选');
  });
});
