<template>
  <div>
    <span v-if="readonly">{{ realLabel }}</span>
    <van-checkbox v-else v-model="modelValue" @change="change" />
  </div>
</template>
<script lang="ts">
import { BooleanHelper } from '@kunlun/shared';
import { defineComponent, computed, ref, watch } from 'vue';
import { Checkbox as VanCheckbox } from 'vant';
import { OioCommonProps, OioMetadataProps, useBoolean } from '../../../basic';

export default defineComponent({
  components: { VanCheckbox },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [Boolean, String]
    }
  },
  setup(props) {
    const modelValue = ref<boolean | undefined>(false);
    const currentValue = computed(() => {
      if (props.value === 'false') {
        return false;
      }
      return props.value;
    });

    watch(
      () => props.value,
      () => {
        if (props.value === 'false') {
          modelValue.value = false;
          return;
        }
        modelValue.value = BooleanHelper.toBoolean(props.value);
      },
      { immediate: true }
    );

    const readonly = computed(() => BooleanHelper.toBoolean(props.readonly));

    const disabled = computed(() => BooleanHelper.toBoolean(props.disabled));

    const { realLabel } = useBoolean(props);

    return {
      modelValue,
      readonly,
      disabled,
      currentValue,
      realLabel
    };
  }
});
</script>
