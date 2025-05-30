<script lang="ts">
import { createVNode, defineComponent, Fragment } from 'vue';

export default defineComponent({
  name: 'VueFragment',
  inheritAttrs: false,
  render() {
    return createVNode(Fragment, undefined, this.$slots.default?.() || []);
  }
});
</script>
