<template>
  <div :class="classList" @click="showPopup">
    <oio-custom-input
      :class="`${DEFAULT_PREFIX}-input van-field__control`"
      readonly
      :value="value"
      :placeholder="inputPlaceholder"
    />
    <div :class="`${DEFAULT_PREFIX}-color-preview-wrapper`">
      <oio-color-preview :value="value" />
    </div>
    <teleport to="body">
      <color-picker
        v-if="(!readonly || !disabled) && show"
        ref="colorPickerRef"
        :color="color"
        :spare-color="predefineColors"
        @confirm="handleChange"
        @show="(val) => (show = val)"
      />
    </teleport>
  </div>
</template>
<script lang="ts">
import { autoRgba, autoRgbaStr } from '@oinone/kunlun-shared';
import { OioColorPickerProps } from '@oinone/kunlun-vue-ui-common';
import ColorPicker from './ColorPicker.vue';
import OioColorPreview from './oio-color-preview.vue';
import { computed, defineComponent, nextTick, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import OioCustomInput from '../oio-input/oio-custome-input.vue';

export default defineComponent({
  name: 'OioColorPicker',
  components: {
    ColorPicker,
    OioColorPreview,
    OioCustomInput
  },
  inheritAttrs: false,
  props: {
    ...OioColorPickerProps
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    // 最近选择的颜色
    const lastColors = ref<string[]>([]);
    const lastPickMax = 4;

    const predefineColors = computed(() => {
      const result = props.predefine || [];
      // 统一转成rgba格式比较 TODO hsl hsla模式未处理
      const rgbaRes = result.map((a) => autoRgbaStr(a));
      const usableColors = lastColors.value.filter((a) => !rgbaRes.includes(autoRgbaStr(a)));
      return [...rgbaRes, ...usableColors].map((a) => autoRgba(a));
    });

    function handleChange(res: { rgba: any; hex: string }) {
      const rgba = res.rgba;
      const val = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
      if (val && !(props.predefine || []).includes(val) && !lastColors.value.includes(val)) {
        lastColors.value.push(val);
        if (lastColors.value.length > lastPickMax) {
          lastColors.value.shift();
        }
        localStorage.setItem('lastColors', JSON.stringify(lastColors.value));
      }
      emit('change', val);
    }

    function createColors() {
      const storeColors = JSON.parse(localStorage.getItem('lastColors') || '[]') as unknown as string[];
      lastColors.value = storeColors || [];
    }

    const colorPickerRef = ref(null as any);
    const show = ref(false);
    function showPopup() {
      if (!props.disabled && !props.readonly) {
        show.value = true;
        nextTick(() => {
          colorPickerRef.value.open();
        });
      }
    }

    const classList = [`${DEFAULT_PREFIX}-color-picker`];
    if (props.readonly) {
      classList.push(`${DEFAULT_PREFIX}-color-picker-readonly`);
    }

    const color = computed(() => autoRgba(props.value!));

    return {
      show,
      color,
      DEFAULT_PREFIX,
      classList,
      predefineColors,
      colorPickerRef,
      createColors,
      handleChange,
      showPopup
    };
  }
});
</script>
