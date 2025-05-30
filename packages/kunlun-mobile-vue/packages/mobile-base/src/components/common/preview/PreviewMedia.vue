<template>
  <van-popup
    class="mobile-internal-preview-component"
    :show="modelValue"
    safe-area-inset-bottom
    teleport="body"
    @close="onClose"
  >
    <video
      v-if="type === 'video'"
      :src="source"
      controls
      controlslist="nodownload"
      autoplay
      disablepictureinpicture
    ></video>
    <van-image :src="source" alt="" style="width: 100%" v-else />
  </van-popup>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Popup as VanPopup, ImagePreview as VanImagePreview, Image as VanImage } from 'vant';

export default defineComponent({
  components: { VanPopup, VanImage },
  props: {
    type: {
      type: String as PropType<'video' | 'image'>,
      default: ''
    },
    source: {
      type: String,
      default: ''
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const onClose = () => {
      emit('update:modelValue', false);
    };

    return { onClose };
  }
});
</script>
<style lang="scss">
.mobile-internal-preview-component.van-popup {
  background: transparent;
  video {
    width: 100%;
    height: 100%;
  }
}
</style>
