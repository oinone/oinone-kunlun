<template>
  <oio-full-screen :value="fullScreen" @change="switchFullScreen" />
</template>

<script lang="ts">
import { useOioState } from '@oinone/kunlun-vue-widget';
import { computed, defineComponent } from 'vue';
import { OioFullScreen } from '../../../components';

export default defineComponent({
  name: 'DefaultFullScreenControl',
  components: {
    OioFullScreen
  },
  setup() {
    const { viewState } = useOioState();

    return {
      fullScreen: computed(() => !!viewState?.fullscreen),
      switchFullScreen: (val: boolean) => {
        if (viewState) {
          viewState.fullscreen = val;
        }
      }
    };
  }
});
</script>
