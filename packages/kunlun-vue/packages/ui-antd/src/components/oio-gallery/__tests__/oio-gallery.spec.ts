import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioGallery } from '../index';

describe('OioGallery', () => {
  it('当列表为空时使用 OioEmptyData 展示占位', () => {
    const wrapper = mount(OioGallery, {
      props: {
        list: [],
        itemKey: 'id'
      },
      slots: {
        default: '<div class="gallery-item">item</div>'
      },
      global: {
        stubs: {
          OioRow: {
            template: '<div class="oio-row"><slot /></div>'
          },
          OioCol: {
            template: '<div class="oio-col"><slot /></div>'
          },
          OioEmptyData: {
            template: '<div class="oio-empty-data"></div>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          }
        }
      }
    });

    expect(wrapper.classes()).toContain(`${DEFAULT_PREFIX}-gallery`);
    expect(wrapper.find('.oio-empty-data').exists()).toBe(true);
  });

  it('当存在数据时渲染网格内容并追加类名', () => {
    const wrapper = mount(OioGallery, {
      props: {
        list: [{ id: '1' }],
        itemKey: 'id',
        itemClassName: 'custom-item'
      },
      slots: {
        default: '<div class="gallery-item">item</div>'
      },
      global: {
        stubs: {
          OioRow: {
            template: '<div class="oio-row"><slot /></div>'
          },
          OioCol: {
            template: '<div class="oio-col" v-bind="$attrs"><slot /></div>'
          },
          OioEmptyData: {
            template: '<div class="oio-empty-data"></div>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          }
        }
      }
    });

    const row = wrapper.find('.oio-row');
    const col = wrapper.find('.oio-col');
    expect(row.classes()).toContain(`${DEFAULT_PREFIX}-gallery-content`);
    expect(col.classes()).toEqual(expect.arrayContaining([`${DEFAULT_PREFIX}-gallery-item`, 'custom-item']));
  });

  it('当 loading 不为 null 时外层包裹在 OioSpin 中', () => {
    const wrapper = mount(OioGallery, {
      props: {
        list: [],
        itemKey: 'id',
        loading: true
      },
      slots: {
        default: '<div class="gallery-item">item</div>'
      },
      global: {
        stubs: {
          OioRow: {
            template: '<div class="oio-row"><slot /></div>'
          },
          OioCol: {
            template: '<div class="oio-col"><slot /></div>'
          },
          OioEmptyData: {
            template: '<div class="oio-empty-data"></div>'
          },
          OioSpin: {
            template: '<div class="oio-spin"><slot /></div>'
          }
        }
      }
    });

    expect(wrapper.find('.oio-spin').exists()).toBe(true);
  });
});
