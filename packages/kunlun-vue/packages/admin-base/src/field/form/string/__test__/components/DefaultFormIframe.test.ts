import { shallowMount } from '@vue/test-utils';
import { InputMediaMode } from '@kunlun/vue-ui-common';
import DefaultFormIframe from '../../iframe/DefaultFormIframe.vue';

describe('DefaultFormIframe', () => {
  test('should render static mode', async () => {
    const wrapper = shallowMount(DefaultFormIframe);
    expect(wrapper.find('.form-iframe').exists()).toBe(true);
    expect(wrapper.find('.oio-empty').exists()).toBe(true);
    await wrapper.setProps({
      defaultValue: 'www.baidu.com'
    });
    expect(wrapper.find('.form-iframe-area-design').exists()).toBe(true);
    await wrapper.setProps({
      defaultValue: 'www.baidu.com',
      value: 'www.baidu.com'
    });
    expect(wrapper.find('iframe').attributes('src')).toBe('www.baidu.com');
  });

  test('should render dynamic mode', async () => {
    const wrapper = shallowMount(DefaultFormIframe);
    await wrapper.setProps({
      defaultValue: 'www.baidu.com',
      mode: InputMediaMode.DYNAMIC
    });
    expect(wrapper.findComponent({ name: 'DefaultString' }).exists()).toBe(true);
    expect(wrapper.find('.form-iframe-area').exists()).toBe(false);
  });
});
