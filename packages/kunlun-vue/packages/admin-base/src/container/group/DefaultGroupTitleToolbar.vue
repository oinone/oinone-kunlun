<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { useInjectMetaContext, useProviderMetaContext } from '@oinone/kunlun-vue-widget';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultGroupTitleToolbar',
  setup() {
    const metaContext = useInjectMetaContext();
    useProviderMetaContext({
      ...metaContext,
      slotName: computed(() => 'titleToolbar')
    });
    return {};
  },
  render() {
    return PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default();
  }
});
</script>
