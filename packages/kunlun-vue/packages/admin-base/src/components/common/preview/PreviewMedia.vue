<template>
  <div class="internal-preview-component" v-if="modelValue">
    <video
      v-if="type === 'video'"
      :src="source"
      controls
      controlslist="nodownload"
      autoplay
      disablepictureinpicture
    ></video>
    <img :src="source" alt="" v-else />

    <div class="close-preview" @click="onClose">
      <i class="iconfont oinone-guanbi1"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    type: {
      type: String as PropType<'video' | 'imag'>,
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
.internal-preview-component {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);

  video,
  img {
    position: absolute;
    left: 50%;
    top: 50%;
    max-width: calc(100% - 210px);
    max-height: 100%;
    background: #fff;
    transform: translate(-50%, -50%);
  }

  .close-preview {
    position: absolute;
    top: 36px;
    right: 36px;
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;

    i {
      color: #fff;
      font-size: 18px;
    }
  }
}
</style>
