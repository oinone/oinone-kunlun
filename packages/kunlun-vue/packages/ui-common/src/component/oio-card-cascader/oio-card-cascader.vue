<script lang="ts">
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { PropRecordHelper } from '../../util';
import { OioCardCascaderProps } from './props';

export default defineComponent({
  name: 'OioCardCascader',
  inheritAttrs: false,
  props: {
    ...OioCardCascaderProps
  },
  slots: ['default'],
  render() {
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-card-cascader`])
      },
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default()
    );
  }
});
</script>
