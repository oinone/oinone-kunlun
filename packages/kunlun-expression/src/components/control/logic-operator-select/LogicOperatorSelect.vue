<template>
  <div class="logic-operator-select" @click="onChange">
    <template v-if="selectedItem">
      {{ showValueLabel ? selectedItem.value : translateExpValue(selectedItem.label) }}
    </template>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { DEFAULT_CONDITION_OPT, ExpressionRsqlLogicOperatorList, IExpSelectOption } from '../../../types';
import { translateExpValue } from '../../../share';
/**
 * 逻辑运算符选择
 */
export default defineComponent({
  props: {
    options: {
      type: Array as PropType<IExpSelectOption[]>,
      default: () => ExpressionRsqlLogicOperatorList
    },
    value: {
      type: String,
      default: DEFAULT_CONDITION_OPT
    },
    showValueLabel: Boolean
  },
  emits: ['update:value', 'change'],
  setup(props, context) {
    const selectedItem = computed(() => {
      return props.options.find((a) => a.value === props.value);
    });
    const onChange = () => {
      const index = props.options.findIndex((a) => a.value === props.value);
      if (index > -1) {
        if (index < props.options.length - 1) {
          context.emit('update:value', props.options[index + 1].value);
          context.emit('change', props.options[index + 1].value);
        } else {
          context.emit('update:value', props.options[0].value);
          context.emit('change', props.options[0].value);
        }
      }
    };
    return {
      selectedItem,
      onChange,
      translateExpValue
    };
  }
});
</script>
