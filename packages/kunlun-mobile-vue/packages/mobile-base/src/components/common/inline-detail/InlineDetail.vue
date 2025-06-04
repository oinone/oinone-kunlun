<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import { InlineForm } from '../inline-form';
import { DEFAULT_PREFIX } from '../../../ui/theme';

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
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-inline-detail`])
      },
      this.$slots.default?.() || []
    );
  }
});
</script>
