<template>
  <div class="default-signature">
    <oio-spin :loading="loading">
      <div class="default-signature__container">
        <span class="signature-container__placeholder" v-show="showPlaceholder">{{ $translate(placeholder) }}</span>
        <canvas class="canvas-signature" ref="signatureCanvas"></canvas>
        <img v-if="value" class="signature-container__img" :src="value" alt="" />
      </div>
      <div class="default-signature__actionbar">
        <oio-button v-if="showClearButton" class="signature-action__clear" @click="onClear">
          {{ $translate(clearButtonText) }}
        </oio-button>
        <oio-button v-if="showSaveButton" class="signature-action__submit" @click="onSaveSignature">
          {{ $translate(saveButtonText) }}
        </oio-button>
      </div>
    </oio-spin>
  </div>
</template>

<script lang="ts">
import { OioSpin, OioButton } from '@oinone/kunlun-vue-ui-mobile-vant';
import SmoothSignature from 'smooth-signature';
import { defineComponent, nextTick, onMounted, PropType, ref } from 'vue';

export default defineComponent({
  name: 'FormStringSignatureField',
  components: { OioSpin, OioButton },
  props: {
    value: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    showPlaceholder: { type: Boolean, default: true },
    placeholder: { type: String },
    showClearButton: { type: Boolean, default: true },
    clearButtonText: { type: String, default: '清除' },
    showSaveButton: { type: Boolean, default: true },
    saveButtonText: { type: String, default: '保存' },
    signatureFontColor: { type: String, default: 'black' },
    signatureBackGroundColor: { type: String, default: 'white' },
    setSmoothSignature: { type: Function, default: () => {} },
    onClear: { type: Function as PropType<(e: any) => void>, default: () => {} },
    onSaveSignature: { type: Function as PropType<(e: any) => void>, default: () => {} },
    onStart: { type: Function as PropType<(e: any) => void>, default: () => {} }
  },
  setup(props) {
    const signatureCanvas = ref();
    const smoothSignature = ref<SmoothSignature | undefined>(undefined);

    onMounted(() => {
      nextTick(() => {
        if (signatureCanvas.value) {
          smoothSignature.value = new SmoothSignature(signatureCanvas.value, {
            color: props.signatureFontColor,
            bgColor: props.signatureBackGroundColor,
            onStart: props.onStart
          });
          props.setSmoothSignature(smoothSignature.value);
        }
      });
    });

    return {
      signatureCanvas
    };
  }
});
</script>

<style lang="scss">
.default-signature {
  .default-signature__container {
    width: 100%;
    position: relative;

    .canvas-signature {
      width: 100%;
      border: 1px dashed;
    }

    .signature-container__placeholder {
      position: absolute;
      color: var(--oio-placeholder-color);
      left: var(--oio-margin-sm);
      top: var(--oio-margin-sm);
    }

    .signature-container__img {
      position: absolute;
      width: 100%;
      height: 100%;
      padding-bottom: 5px;
      left: 0;
      top: 0;
    }
  }

  .default-signature__actionbar {
    display: flex;
    justify-content: flex-end;
    gap: var(--oio-row-gap);
  }
}
</style>
