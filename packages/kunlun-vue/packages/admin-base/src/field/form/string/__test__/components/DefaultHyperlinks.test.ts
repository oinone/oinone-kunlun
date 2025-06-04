import { shallowMount } from '@vue/test-utils';
import { InputMediaMode } from '@oinone/kunlun-vue-ui-common';
import DefaultHyperlinks from '../../hyperlinks/DefaultHyperlinks.vue';

describe('DefaultHyperlinks', () => {
  test('DefaultHyperlinks', async () => {
    const comp = shallowMount(DefaultHyperlinks, {
      props: {
        mode: InputMediaMode.STATIC
      }
    });
    expect(comp.find('.oio-empty').exists()).toBe(true);

    await comp.setProps({
      mode: InputMediaMode.STATIC,
      text: 'test',
      target: '_blank'
    });
    expect(comp.find('.form-string-hyperlinks').exists()).toBe(true);
    expect(comp.find('.oio-hyperlinks').exists()).toBe(false);
    expect(comp.get('a')).toBeDefined();

    await comp.setProps({
      mode: InputMediaMode.DYNAMIC,
      text: 'test',
      target: '_self'
    });
    expect(comp.findComponent({ name: 'DefaultString' }).exists()).toBe(true);
  });
});
