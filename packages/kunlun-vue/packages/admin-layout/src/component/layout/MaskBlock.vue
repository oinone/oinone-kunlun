<script lang="ts">
import { CSSStyle } from '@kunlun/shared';
import { createVNode, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'MaskBlock',
  inheritAttrs: false,
  props: {
    id: {
      type: String
    },
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
        id: this.id,
        class: this.classNames,
        style: this.style
      },
      this.$slots.default?.()
    );
  }
});
</script>
