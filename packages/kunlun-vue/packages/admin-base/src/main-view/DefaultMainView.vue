<script lang="ts">
import { OioSpin } from '@kunlun/vue-ui-antd';
import { OioSpinProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { DslRender } from '@kunlun/vue-widget';
import { computed, createVNode, defineComponent, VNode } from 'vue';
import { MetadataViewProps } from '../basic';
import { useInjectMetaContext, useProviderMetaContext } from '../tags';

export default defineComponent({
  name: 'DefaultMainView',
  inheritAttrs: false,
  props: {
    ...MetadataViewProps,
    ...OioSpinProps
  },
  setup(props) {
    const metaContext = useInjectMetaContext();

    useProviderMetaContext({
      ...metaContext,
      viewType: computed(() => props.viewType || metaContext.viewType.value),
      model: computed(() => props.modelModel || metaContext.model.value),
      modelName: computed(() => props.modelName || metaContext.modelName.value),
      module: computed(() => props.moduleModule || metaContext.module.value),
      moduleName: computed(() => props.moduleName || metaContext.moduleName.value),
      parentHandle: computed(() => props.currentHandle || ''),
      slotName: computed(() => undefined),
      inline: computed(() => props.isVirtual || props.inline)
    });

    return {};
  },
  render() {
    let children: VNode[] | undefined;
    const { viewTemplate, loading } = this;
    if (viewTemplate) {
      const vnode = DslRender.render(viewTemplate, undefined, undefined, { dynamicKey: true });
      if (vnode) {
        children = [vnode];
      }
    }
    if (!children) {
      children = this.$slots.default?.() || [];
    }

    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      {
        origin: 'unauthorized',
        isNotNull: true
      }
    ]);

    const childrenSlots = [...children, ...slots.unauthorized()];

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
        /**
         * 由于 main-view loding 的时机，上一个页面 dom 还没销毁，下一个页面 dom 还没生成，所以高度是上一个页面的高度
         * 这里改个样式，让 loading 时的高度，始终为屏幕高度
         *  */
        wrapperClassName: wrapperClassList.join(' ')
      },
      { default: () => childrenSlots }
    );
  }
});
</script>
