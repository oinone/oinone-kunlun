<script lang="ts">
import { DslRender } from '@oinone/kunlun-vue-widget';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent, Fragment, VNode } from 'vue';
import { MetadataViewProps } from '../basic';
import { useInjectMetaContext, useProviderMetaContext } from '../tags';

export default defineComponent({
  name: 'DefaultMainView',
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
      parentHandle: computed(() => props.currentHandle || ''),
      slotName: computed(() => undefined),
      inline: computed(() => props.isVirtual || props.inline)
    });

    return {};
  },
  render() {
    let children: VNode[] | undefined;
    const { viewTemplate } = this;
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

    return createVNode(Fragment, undefined, childrenSlots);
  }
});
</script>
