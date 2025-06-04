<script lang="ts">
import { autoRgbaStr, CastHelper, NumberHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioColorPickerProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { ElColorPicker, ElInput } from 'element-plus';
import { isString } from 'lodash-es';
import { computed, createVNode, defineComponent, ref, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioColorPicker',
  components: {
    ElColorPicker,
    ElInput
  },
  inheritAttrs: false,
  props: {
    ...OioColorPickerProps
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    const lastedColors = ref<string[] | undefined>(undefined);

    const lastedColorCount = computed<number>(() => {
      let count = props.lastedColorCount;
      if (count == null) {
        count = 4;
      }
      return NumberHelper.toNumber(count)!;
    });

    function createColors() {
      const storeColors = JSON.parse(localStorage.getItem('lastColors') || '[]') as unknown as string[];
      lastedColors.value = storeColors || [];
    }

    function getLastColors(): string[] {
      if (props.disabledLastedColor) {
        return [];
      }
      if (!lastedColors.value) {
        createColors();
      }
      return lastedColors.value || [];
    }

    function pushLastColors(val: string) {
      if (props.disabledLastedColor) {
        return;
      }
      let colors = lastedColors.value;
      if (!colors) {
        colors = [];
        lastedColors.value = colors;
      }
      colors.push(val);
      if (colors.length > lastedColorCount.value) {
        colors.shift();
      }
      localStorage.setItem('lastColors', JSON.stringify(colors));
    }

    const predefineColors = computed(() => {
      let result = props.predefine || [];
      if (isString(result)) {
        result = JSON.parse(result);
      }
      const rgbaRes = result.map((a) => autoRgbaStr(a));
      const usableColors = getLastColors().map((a) => autoRgbaStr(a));
      return [...new Set([...rgbaRes, ...usableColors])];
    });

    function handleChange(val?: string) {
      if (val && !predefineColors.value.includes(val)) {
        pushLastColors(val);
      }
      emit('change', val);
    }

    return {
      predefineColors,
      handleChange
    };
  },
  render() {
    const colorPickerClassList = [`${DEFAULT_PREFIX}-color-picker`];
    if (this.readonly) {
      colorPickerClassList.push(`${DEFAULT_PREFIX}-color-picker-readonly`);
    }
    const children: VNode[] = [];
    let colorPicker: VNode = createVNode(ElColorPicker, {
      modelValue: this.value,
      defaultValue: this.defaultValue,
      colorFormat: this.colorFormat,
      disabled: this.disabled,
      showAlpha: this.showAlpha,
      predefine: this.predefineColors,
      popperClass: `${DEFAULT_PREFIX}-color-picker-popper`,
      ...PropRecordHelper.collectionBasicProps(this.$attrs, colorPickerClassList),
      'onUpdate:modelValue': (val) => this.$emit('update:value', val),
      onChange: this.handleChange
    });
    if (this.hasInput) {
      colorPicker = createVNode(
        'div',
        {
          class: [
            `${DEFAULT_PREFIX}-color-picker-inner`,
            this.readonly ? `${DEFAULT_PREFIX}-color-picker-inner-readonly` : ''
          ]
        },
        [colorPicker]
      );
      const inputTemplate = {};
      inputTemplate[this.inputPlacement] = () => [colorPicker];
      children.push(
        createVNode(
          ElInput,
          {
            modelValue: this.value,
            placeholder: this.inputPlaceholder,
            readonly: this.inputReadonly || this.readonly,
            disabled: this.disabled
          },
          inputTemplate
        )
      );
    } else {
      children.push(colorPicker);
    }
    return createVNode(
      'div',
      {
        class: StringHelper.append(colorPickerClassList, CastHelper.cast(this.$attrs.class))
      },
      children
    );
  }
});
</script>
