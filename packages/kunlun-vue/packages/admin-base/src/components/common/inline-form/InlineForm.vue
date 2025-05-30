<script lang="ts">
import { PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';

export default defineComponent({
  name: 'InlineForm',
  inheritAttrs: false,
  render() {
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`inline-form`])
      },
      this.$slots.default?.() || []
    );
  }
});
</script>
