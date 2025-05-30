<script lang="ts">
import { Consumer, Executor } from '@kunlun/shared';
import { OioSpin } from '@kunlun/vue-ui-antd';
import {
  Component,
  createVNode,
  defineComponent,
  KeepAlive,
  markRaw,
  PropType,
  Ref,
  resolveDynamicComponent,
  shallowRef,
  toRaw
} from 'vue';
import { useMultiTabKeepAliveStore } from './store';

export default defineComponent({
  name: 'MultiTabsContainer',
  inheritAttrs: false,
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disabledCache: {
      type: Boolean,
      default: undefined
    },
    setKeepAliveStore: {
      type: Function as PropType<Consumer<Ref<string[]>>>
    },
    setSetterActiveTabComponent: {
      type: Function as PropType<Consumer<(component: Component | undefined, isKeepAlive: boolean) => void>>
    },
    setRemoveTabComponent: {
      type: Function as PropType<Consumer<Consumer<string>>>
    },
    setClearTabComponent: {
      type: Function as PropType<Consumer<Executor>>
    }
  },
  setup(props) {
    const { store, add, remove, clear } = useMultiTabKeepAliveStore();

    const activeTabComponent = shallowRef<Component>();

    const setActiveTabComponent = (component: Component | undefined, isKeepAlive: boolean) => {
      const name = component?.name;
      if (name) {
        if (!isKeepAlive) {
          remove(name);
        } else {
          add(name);
        }
      }
      activeTabComponent.value = component ? markRaw(component) : component;
    };

    const removeTabComponent = (name: string) => {
      remove(name);
    };

    const clearTabComponent = () => {
      clear();
    };

    props.setKeepAliveStore?.(store);
    props.setSetterActiveTabComponent?.(setActiveTabComponent);
    props.setRemoveTabComponent?.(removeTabComponent);
    props.setClearTabComponent?.(clearTabComponent);

    return {
      store,

      finalComponent: toRaw(activeTabComponent)
    };
  },
  render() {
    const { store, finalComponent, loading, disabledCache } = this;

    /**
     * 由于 main-view loding 的时机，上一个页面 dom 还没销毁，下一个页面 dom 还没生成，所以高度是上一个页面的高度
     * 这里改个样式，让 loading 时的高度，始终为屏幕高度
     *  */
    const wrapperClassList = ['default-main-view-wrapper', loading ? 'view-height-loading-wrapper' : ''];

    return createVNode(
      OioSpin,
      {
        class: 'default-main-view-spin',
        loading,
        wrapperClassName: wrapperClassList.join(' ')
      },
      {
        default: () => [
          createVNode(
            KeepAlive,
            {
              include: store
            },
            disabledCache ? [] : [createVNode(resolveDynamicComponent(finalComponent))]
          )
        ]
      }
    );
  }
});
</script>
