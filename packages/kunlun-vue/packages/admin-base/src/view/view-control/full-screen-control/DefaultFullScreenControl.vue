<template>
  <oio-full-screen :value="fullScreen" @change="switchFullScreen" />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { OioFullScreen } from '../../../components';
import { useOioState } from '../../../state';

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
