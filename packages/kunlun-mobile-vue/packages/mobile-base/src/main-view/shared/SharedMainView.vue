<script lang="ts">
import { OioSpin, PropRecordHelper } from '@oinone/kunlun-vue-ui-mobile-vant';
import { OioSpinProps } from '@oinone/kunlun-vue-ui-common';
import { computed, createVNode, defineComponent } from 'vue';
import { useProviderMaskContext } from '../../layout';
import { useProviderMetaContext } from '../../tags';

export default defineComponent({
  name: 'SharedMainView',
  components: {
    OioSpin
  },
  inheritAttrs: false,
  props: {
    ...OioSpinProps,
    metadataHandle: {
      type: String
    }
  },
  setup(props) {
    useProviderMaskContext({
      parentHandle: computed(() => props.metadataHandle || '')
    });

    useProviderMetaContext({
      metadataHandle: computed(() => props.metadataHandle || ''),
      rootHandle: computed(() => props.metadataHandle || ''),
      parentHandle: computed(() => props.metadataHandle || '')
    });

    return {};
  },
  render() {
    const { loading } = this;
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]);
    return createVNode(
      OioSpin,
      {
        class: 'oio-shared-main-view',
        loading,
        wrapperClassName: 'oio-shared-main-view-wrapper'
      },
      {
        default: () => slots.default()
      }
    );
  }
});
</script>
<style lang="scss">
.oio-shared-main-view-wrapper {
  height: 100%;
  padding: 24px 128px;
  background-color: var(--oio-body-background);
  overflow: auto;

  & > .ant-spin-container {
    padding: 24px;
    background-color: var(--oio-main-background);
    border-radius: 4px;
  }
}
</style>
