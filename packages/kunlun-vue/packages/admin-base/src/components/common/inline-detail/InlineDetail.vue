<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import { InlineForm } from '../inline-form';

export default defineComponent({
  name: 'InlineDetail',
  components: {
    InlineForm
  },
  inheritAttrs: false,
  render() {
    return createVNode(
      InlineForm,
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`inline-detail`])
      },
      this.$slots.default?.() || []
    );
  }
});
</script>
