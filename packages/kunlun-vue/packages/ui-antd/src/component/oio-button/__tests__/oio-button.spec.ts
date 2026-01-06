import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

import { DEFAULT_PREFIX } from '../../../theme';
import { OioButton } from '../index';

describe('OioButton', () => {
  const createWrapper = (
    options: { props?: Record<string, unknown>; onClick?: (...args: unknown[]) => unknown } = {}
  ) => {
    const { props, onClick } = options;
    return mount(OioButton, {
      props,
      attrs: {
        onClick
      },
      global: {
        stubs: {
          AButton: {
            props: ['onClick'],
            template: '<button class="a-button" @click="onClick && onClick($event)"><slot /></button>'
          },
          OioIcon: {
            template: '<span class="oio-icon"></span>'
          }
        }
      }
    });
  };

  it('异步点击时会自动管理 loading 状态', async () => {
    const onClick = jest.fn();
    const wrapper = createWrapper({
      props: {
        async: true
      },
      onClick
    });

    await wrapper.find('button').trigger('click');
    await nextTick();
    await nextTick();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:loading')?.[0]).toEqual([true]);
    expect(wrapper.emitted('update:loading')?.[1]).toEqual([false]);
  });

  it('点击时根据 selected 状态发出 update:selected 事件', async () => {
    const onClick = jest.fn();
    const wrapper = createWrapper({
      props: {
        selected: false
      },
      onClick
    });

    await wrapper.find('button').trigger('click');

    expect(wrapper.emitted('update:selected')?.[0]).toEqual([true]);
  });

  it('只有图标内容时会添加 icon-only 样式类', async () => {
    const wrapper = createWrapper({
      props: {
        icon: 'test-icon'
      }
    });

    const button = wrapper.find('button');
    const classAttr = button.attributes('class') || '';
    const classList = classAttr.split(' ').filter(Boolean);

    expect(classList).toEqual(
      expect.arrayContaining([`${DEFAULT_PREFIX}-button`, `${DEFAULT_PREFIX}-button-icon-only`])
    );
  });
});
