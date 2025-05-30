<script lang="ts">
import { PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../../ui/theme';

export default defineComponent({
  name: 'InlineTable',
  inheritAttrs: false,
  render() {
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-inline-table`])
      },
      this.$slots.default?.() || []
    );
  }
});
</script>
