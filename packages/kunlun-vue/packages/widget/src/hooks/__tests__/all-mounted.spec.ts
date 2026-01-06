import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { onAllMounted, reportAllMounted } from '../all-mounted';

describe('onAllMounted & reportAllMounted', () => {
  it('不传回调时应打印警告且不抛错', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // @ts-expect-error
    onAllMounted(undefined);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('所有子组件挂载后应触发 allMounted 回调', async () => {
    const allMounted = jest.fn();
    const allMountedUpdate = jest.fn();

    const Parent = defineComponent({
      setup() {
        onAllMounted({ allMounted, allMountedUpdate });
        return () => h('div', [h(Child), h(Child)]);
      }
    });

    const Child = defineComponent({
      setup() {
        reportAllMounted();
        return () => h('div');
      }
    });

    const wrapper = mount(Parent);

    await nextTick();
    expect(allMounted).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    await nextTick();
    expect(allMountedUpdate).toHaveBeenCalledTimes(0);
  });
});
