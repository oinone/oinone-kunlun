<script lang="ts">
import type { DslDefinition } from '@oinone/kunlun-dsl';
import { DslRender, useInjectMetaContext, useProviderMetaContext } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, Fragment, type PropType, type VNode } from 'vue';
import { MetadataViewProps } from '../basic';
import { useProviderMaskContext } from '../layout';

export default defineComponent({
  name: 'DefaultMetadataMainView',
  inheritAttrs: false,
  props: {
    ...MetadataViewProps,
    maskTemplate: {
      type: Object as PropType<DslDefinition>
    }
  },
  setup(props) {
    useProviderMaskContext({
      parentHandle: computed(() => props.currentHandle || '')
    });

    const metaContext = useInjectMetaContext();

    useProviderMetaContext({
      ...metaContext,
      metadataHandle: computed(() => props.currentHandle || ''),
      rootHandle: computed(() => props.currentHandle || ''),
      parentHandle: computed(() => props.currentHandle || '')
    });

    return {};
  },
  render() {
    const { maskTemplate } = this;
    const children: VNode[] = [];

    let maskVNode: VNode | undefined;
    if (maskTemplate) {
      maskVNode = DslRender.render(maskTemplate);
    }
    if (maskVNode) {
      children.push(maskVNode);
    }

    return createVNode(Fragment, undefined, children);
  }
});
</script>
