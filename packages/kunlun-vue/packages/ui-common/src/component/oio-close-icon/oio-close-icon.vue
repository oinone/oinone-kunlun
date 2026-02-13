<template>
  <oio-icon class="oio-close-icon" icon="oinone-close-outlined" :size="size" :style="iconVolumeStyle"></oio-icon>
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
      default: '16'
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
