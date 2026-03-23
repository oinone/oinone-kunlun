<script lang="ts">
import { OioDividerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Divider as ADivider } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioDivider',
  components: {
    ADivider
  },
  inheritAttrs: false,
  props: {
    ...OioDividerProps
  },
  render() {
    const { type, dashed, plain, orientation } = this;
    return createVNode(
      ADivider,
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-divider`]),
        type,
        dashed,
        plain,
        orientation
      },
      this.$slots.default?.()
    );
  }
});
</script>
