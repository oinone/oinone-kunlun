<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../../ui/theme';

export default defineComponent({
  name: 'InlineForm',
  inheritAttrs: false,
  render() {
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-inline-form`])
      },
      this.$slots.default?.() || []
    );
  }
});
</script>
