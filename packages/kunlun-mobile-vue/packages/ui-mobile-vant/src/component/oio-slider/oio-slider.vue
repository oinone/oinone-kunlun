<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  convertAntdTooltipPlacement,
  OioSliderProps,
  SliderDirection
} from '@kunlun/vue-ui-common';
import { Slider as VanSlider } from 'vant';
import { computed, createVNode, defineComponent, onBeforeMount, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioSlider',
  components: {
    VanSlider
  },
  inheritAttrs: false,
  props: {
    ...OioSliderProps
  },
  emits: ['update:value'],
  setup(props, context) {
    const value = ref<number | undefined>();
    const realValue = computed<number | undefined>({
      get() {
        if (props.value == null) {
          return value.value;
        }
        return props.value;
      },
      set(val) {
        value.value = val;
        context.emit('update:value', val);
      }
    });

    onBeforeMount(() => {
      value.value = props.defaultValue;
    });

    const vertical = computed(() => {
      if (props.direction) {
        return undefined;
      }
      return props.direction === SliderDirection.VERTICAL;
    });

    const tooltipPlacement = computed<string | undefined>(() => {
      return convertAntdTooltipPlacement(props.tooltipPlacement);
    });

    const onUpdateValue = (val: number) => {
      realValue.value = val;
    };

    return {
      realValue,
      vertical,
      tooltipPlacement,

      onUpdateValue
    };
  },
  render() {
    return createVNode(VanSlider, {
      modelValue: this.realValue,
      min: this.min,
      max: this.max,
      step: this.step,
      vertical: this.vertical,
      marks: this.marks,
      dots: this.dots,
      reverse: this.reverse,
      range: this.range,
      tooltipVisible: this.tooltipVisible,
      tooltipPlacement: this.tooltipPlacement,
      tipFormatter: this.tooltipFormatter,
      getTooltipPopupContainer: this.getTooltipTriggerContainer,
      ...this.$attrs,
      class: StringHelper.append([`${DEFAULT_PREFIX}-slider`], CastHelper.cast(this.$attrs.class)),
      'onUpdate:modelValue': this.onUpdateValue
    });
  }
});
</script>
