<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent } from 'vue';

export default defineComponent({
  name: 'InlineTable',
  inheritAttrs: false,
  render() {
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`inline-table`])
      },
      this.$slots.default?.() || []
    );
  }
});
</script>
