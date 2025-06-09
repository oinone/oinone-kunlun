<template>
  <oio-icon class="oio-close-icon" icon="oinone-guanbi2" :size="size" :style="iconVolumeStyle"></oio-icon>
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
  border-radius: var(--oio-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: var(--oio-close-icon-background);
  }
}
</style>
