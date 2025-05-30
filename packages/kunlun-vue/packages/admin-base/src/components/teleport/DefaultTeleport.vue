<script lang="ts">
import { PatchFlags } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent, Teleport, VNodeProps } from 'vue';

export default defineComponent({
  name: 'DefaultTeleport',
  inheritAttrs: false,
  props: {
    teleport: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: undefined
    }
  },
  render() {
    const divProps: Record<string, unknown> = {};
    if (!this.visible) {
      divProps.style = {
        display: 'none'
      };
    }
    const teleportProps: Record<string, unknown> = {};
    if (this.disabled) {
      teleportProps.disabled = true;
    } else {
      teleportProps.to = this.teleport;
    }
    return createVNode(
      'div',
      divProps,
      [createVNode(Teleport as VNodeProps, teleportProps, this.$slots.default?.() || [])],
      PatchFlags.STABLE_FRAGMENT
    );
  }
});
</script>
