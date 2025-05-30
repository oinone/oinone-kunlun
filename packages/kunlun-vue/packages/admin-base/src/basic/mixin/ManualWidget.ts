import { ComponentOptionsMixin, computed } from 'vue';
import { useInjectMetaContext, useProviderMetaContext } from '../../tags/context';

export const ManualWidget: ComponentOptionsMixin = {
  props: {
    metadataHandle: {
      type: String
    },
    rootHandle: {
      type: String
    },
    currentHandle: {
      type: String
    }
  },
  data() {
    const metaContext = useInjectMetaContext();
    useProviderMetaContext({
      ...metaContext,
      metadataHandle: computed(() => this.metadataHandle || metaContext.metadataHandle.value),
      rootHandle: computed(() => this.rootHandle || metaContext.rootHandle.value),
      parentHandle: computed(() => this.currentHandle || metaContext.parentHandle.value)
    });
    return {};
  }
};
