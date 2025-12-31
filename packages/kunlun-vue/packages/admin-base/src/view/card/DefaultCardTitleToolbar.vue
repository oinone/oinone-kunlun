<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { useInjectMetaContext, useProviderMetaContext } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, withModifiers } from 'vue';

export default defineComponent({
  name: 'DefaultCardTitleToolbar',
  setup() {
    const metaContext = useInjectMetaContext();
    useProviderMetaContext({
      ...metaContext,
      inline: computed(() => true)
    });
    return {};
  },
  render() {
    const children = PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default();
    return createVNode(
      'div',
      { class: 'default-card-title-toolbar' },
      children.map((v) => {
        return createVNode(
          'div',
          {
            ...PropRecordHelper.collectionBasicProps(this.$attrs, ['default-card-title-toolbar-item']),
            onClick: withModifiers(() => {}, ['stop', 'prevent'])
          },
          [v]
        );
      })
    );
  }
});
</script>
