import { mount } from '@vue/test-utils';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioUpload } from '../index';

describe('OioUpload', () => {
  it('根据 readonly 与 disabled 追加对应类名', () => {
    const wrapper = mount(OioUpload, {
      props: {
        uploadList: [],
        readonly: true,
        disabled: true
      },
      slots: {
        default: '<button>upload</button>'
      },
      global: {
        stubs: {
          AUpload: {
            template: '<div class="a-upload" v-bind="$attrs"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-upload');
    expect(root.classes()).toEqual(
      expect.arrayContaining([
        `${DEFAULT_PREFIX}-upload`,
        `${DEFAULT_PREFIX}-upload-readonly`,
        `${DEFAULT_PREFIX}-upload-disabled`
      ])
    );
  });

  it('当 accept 为数组时会拼接为逗号分隔字符串', () => {
    const wrapper = mount(OioUpload, {
      props: {
        uploadList: [],
        accept: ['.jpg', '.png']
      },
      slots: {
        default: '<button>upload</button>'
      },
      global: {
        stubs: {
          AUpload: {
            props: ['accept'],
            template: '<div class="a-upload" v-bind="$attrs" :data-accept="accept"><slot /></div>'
          }
        }
      }
    });

    const root = wrapper.find('.a-upload');
    expect(root.attributes('data-accept')).toBe('.jpg,.png');
  });
});
