<template>
  <div>
    <span v-if="readonly">{{ realLabel }}</span>
    <a-checkbox v-else :checked="currentValue" @update:checked="change" />
  </div>
</template>
<script lang="ts">
import { BooleanHelper } from '@oinone/kunlun-shared';
import { computed, defineComponent } from 'vue';
import { Checkbox as ACheckbox } from 'ant-design-vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { useBoolean } from '../../../basic/field/boolean';

export default defineComponent({
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [Boolean, String]
    }
  },
  components: {
    ACheckbox
  },
  setup(props) {
    const currentValue = computed(() => {
      if (props.value === 'false') {
        return false;
      }

      return props.value;
    });

    const readonly = computed(() => BooleanHelper.toBoolean(props.readonly));

    const disabled = computed(() => BooleanHelper.toBoolean(props.disabled));

    const { realLabel } = useBoolean(props);

    return {
      readonly,
      disabled,
      currentValue,
      realLabel
    };
  }
});
</script>
