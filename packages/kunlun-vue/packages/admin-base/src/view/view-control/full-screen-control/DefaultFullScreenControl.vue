<template>
  <oio-full-screen :value="fullScreen" @change="switchFullScreen" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { OioFullScreen } from '../../../components';

export default defineComponent({
  name: 'DefaultFullScreenControl',
  components: { OioFullScreen },
  props: {
    fullScreen: {
      type: Boolean,
      default: false
    },
    switchFullScreen: {
      type: Function as PropType<() => void>
    }
  }
});
</script>

<style lang="scss"></style>
