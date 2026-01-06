<script lang="ts">
import type { CSSStyle } from '@oinone/kunlun-shared';
import { createVNode, defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'MaskBlock',
  inheritAttrs: false,
  props: {
    classNames: {
      type: [String, Array] as PropType<string | string[]>
    },
    style: {
      type: [String, Object] as PropType<string | CSSStyle>
    }
  },
  render() {
    return createVNode(
      'div',
      {
        class: this.classNames,
        style: this.style
      },
      this.$slots.default?.()
    );
  }
});
</script>
