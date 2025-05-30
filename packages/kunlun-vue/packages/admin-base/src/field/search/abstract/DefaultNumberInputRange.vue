<script lang="ts">
import { computed, createVNode, defineComponent, PropType } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { NumberRange } from '../../range';

export default defineComponent({
  name: 'DefaultIntegerInputRange',
  components: {
    NumberRange
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: Array as PropType<string[]>
    },
    precision: {
      type: Number
    },
    startDefaultValue: {
      type: [Number, String]
    },
    endDefaultValue: {
      type: [Number, String]
    },
    startPlaceholder: {
      type: String
    },
    endPlaceholder: {
      type: String
    }
  },
  setup(props) {
    const leftValue = computed(() => props.value?.[0]);
    const rightValue = computed(() => props.value?.[1]);

    const leftChange = (val) => {
      props.change?.([val, rightValue.value]);
    };

    const rightChange = (val) => {
      props.change?.([leftValue.value, val]);
    };

    return {
      leftValue,
      leftChange,

      rightValue,
      rightChange
    };
  },
  render() {
    const {
      readonly,
      disabled,
      precision,
      focus,
      blur,

      leftValue,
      startDefaultValue,
      startPlaceholder,
      leftChange,

      rightValue,
      endDefaultValue,
      endPlaceholder,
      rightChange
    } = this;
    return createVNode(NumberRange, {
      readonly,
      disabled,
      precision,

      leftValue,
      leftDefaultValue: startDefaultValue,
      leftPlaceholder: startPlaceholder,
      leftChange,
      leftFocus: focus,
      leftBlur: blur,

      rightValue,
      rightDefaultValue: endDefaultValue,
      rightPlaceholder: endPlaceholder,
      rightChange,
      rightFocus: focus,
      rightBlur: blur
    });
  }
});
</script>
