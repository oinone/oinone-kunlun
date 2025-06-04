<script lang="ts">
import { DslRender } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, Fragment, VNode } from 'vue';
import { useInjectMetaContext, useProviderMetaContext } from '../../tags/context';
import { MetadataViewProps } from './props';

export default defineComponent({
  name: 'MetadataView',
  inheritAttrs: false,
  props: {
    ...MetadataViewProps
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
      metadataHandle: computed(() => props.currentHandle || ''),
      rootHandle: computed(() => props.currentHandle || ''),
      parentHandle: computed(() => props.currentHandle || ''),
      slotName: computed(() => undefined),
      inline: computed(() => props.isVirtual || props.inline)
    });

    return {};
  },
  render() {
    let children: VNode[] | undefined;
    if (!this.isVirtual) {
      const { viewTemplate } = this;
      if (viewTemplate) {
        const vnode = DslRender.render(viewTemplate!, undefined, undefined, { dynamicKey: true });
        if (vnode) {
          children = [vnode];
        }
      }
    }
    if (!children) {
      children = this.$slots.default?.() || [];
    }
    return createVNode(Fragment, undefined, children);
  }
});
</script>
