<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { useProviderMaskContext } from '@oinone/kunlun-vue-admin-layout';
import { OioSpin, OioSpinProps } from '@oinone/kunlun-vue-ui-antd';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { DslRender } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, PropType, VNode } from 'vue';
import { MetadataViewProps } from '../basic';
import { useProviderMetaContext } from '../tags';

export default defineComponent({
  name: 'DefaultMetadataMainView',
  components: {
    OioSpin
  },
  inheritAttrs: false,
  props: {
    ...MetadataViewProps,
    ...OioSpinProps,
    maskTemplate: {
      type: Object as PropType<DslDefinition>
    },
    translateToolBox: {
      type: Object as PropType<VNode | undefined>
    }
  },
  setup(props, { slots }) {
    useProviderMaskContext({
      parentHandle: computed(() => props.currentHandle || '')
    });

    useProviderMetaContext({
      metadataHandle: computed(() => props.currentHandle || ''),
      rootHandle: computed(() => props.currentHandle || ''),
      parentHandle: computed(() => props.currentHandle || '')
    });

    const childrenVNode = computed(() => {
      const $slots = PropRecordHelper.collectionSlots(slots, [
        {
          origin: 'multiTabs',
          isNotNull: true
        }
      ]);
      const children = [...$slots.multiTabs()];

      let maskVNode: VNode | undefined;
      if (props.maskTemplate) {
        maskVNode = DslRender.render(props.maskTemplate);
      }
      if (maskVNode) {
        children.push(maskVNode);
      }

      if (props.translateToolBox) {
        children.push(props.translateToolBox);
      }
      return children;
    });

    return { childrenVNode };
  },
  render() {
    const { childrenVNode, loading } = this;
    return createVNode(
      OioSpin,
      {
        class: 'default-metadata-main-view-spin',
        loading,
        wrapperClassName: 'default-metadata-main-view-wrapper'
      },
      { default: () => childrenVNode }
    );
  }
});
</script>
