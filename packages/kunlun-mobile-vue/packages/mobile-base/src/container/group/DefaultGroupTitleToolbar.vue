<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent } from 'vue';
import { useInjectMetaContext, useProviderMetaContext } from '../../tags';

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
