<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../../basic';

export default defineComponent({
  name: 'InlineTable',
  inheritAttrs: false,
  setup(props, { emit }) {
    const formContext = useInjectOioDefaultFormContext();

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer() {
        return document.body;
      }
    });
    return {};
  },
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
