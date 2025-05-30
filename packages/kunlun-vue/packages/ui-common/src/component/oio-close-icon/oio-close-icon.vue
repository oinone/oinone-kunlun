<template>
  <oio-icon class="oio-close-icon" icon="oinone-guanbi1" :size="size" :style="iconVolumeStyle"></oio-icon>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { StyleHelper } from '../../util';
import { OioIcon } from '../oio-icon';

export default defineComponent({
  name: 'OioCloseIcon',
  components: {
    OioIcon
  },
  props: {
    size: {
      type: String,
      default: '10'
    },
    volume: {
      type: String,
      default: '24'
    }
  },
  setup(props) {
    const iconVolumeStyle = computed(() => {
      const volume = StyleHelper.px(props.volume);
      return {
        width: volume,
        height: volume
      };
    });
    return { iconVolumeStyle };
  }
});
</script>
<style lang="scss">
.oio-close-icon {
  background: var(--oio-close-icon-background);
  color: var(--oio-icon-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
