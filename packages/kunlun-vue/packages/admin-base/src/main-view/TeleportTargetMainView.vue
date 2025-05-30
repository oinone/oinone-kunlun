<script lang="ts">
import { createVNode, defineComponent, renderSlot, VNode } from 'vue';

export default defineComponent({
  name: 'TeleportTargetMainView',
  inheritAttrs: false,
  props: {
    teleportTarget: {
      type: String,
      required: true
    }
  },
  render() {
    const slot: VNode[] = [renderSlot(this.$slots, 'unauthorized')];

    return createVNode(
      'div',
      {
        class: 'k-layout-teleport-target',
        id: this.teleportTarget
      },
      slot
    );
  }
});
</script>
