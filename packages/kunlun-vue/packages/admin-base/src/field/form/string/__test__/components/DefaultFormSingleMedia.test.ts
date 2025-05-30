import { shallowMount } from '@vue/test-utils';
import { InputMediaMode } from '@kunlun/vue-ui-common';
import DefaultFormSingleMedia from '../../media/DefaultFormSingleMedia.vue';
import { UploadCom, UploadCommonProps } from '../../../../../components';
import DefaultString from '../../DefaultString.vue';
import MediaSingle from '../../../../../components/common/media-single/MediaSingle.vue';

describe('DefaultFormSingleMedia', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallowMount(DefaultFormSingleMedia, {
      props: {
        mode: InputMediaMode.DYNAMIC,
        fileSource: 'UPLOAD',
        ...UploadCommonProps
      }
    });
  });

  describe('render method', () => {
    test('should render UploadCom when mode is DYNAMIC and fileSource is UPLOAD', () => {
      expect(wrapper.findComponent(UploadCom).exists()).toBe(true);
    });

    test('should render DefaultString when mode is DYNAMIC and fileSource is not UPLOAD', async () => {
      await wrapper.setProps({ fileSource: 'OTHER' });
      expect(wrapper.findComponent(UploadCom).exists()).toBe(false);
      expect(wrapper.findComponent(DefaultString).exists()).toBe(true);
    });

    test('should render MediaSingle when mode is not DYNAMIC', async () => {
      await wrapper.setProps({ mode: 'STATIC', value: 'Test Value' });
      expect(wrapper.findComponent(UploadCom).exists()).toBe(false);
      expect(wrapper.findComponent(DefaultString).exists()).toBe(false);
      expect(wrapper.findComponent(MediaSingle).exists()).toBe(true);
    });
  });
});
