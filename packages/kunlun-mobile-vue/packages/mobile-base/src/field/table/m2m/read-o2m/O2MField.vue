<template>
  <span>{{ displayValue }}22</span>
</template>
<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import { getModel } from '@oinone/kunlun-service';

export default defineComponent({
  props: ['displayName', 'field', 'value'],
  setup(props) {
    const displayValue = ref('');
    const getDisplayName = async () => {
      if (!props.field) {
        return '';
      }
      const refModel = await getModel(props.field.references!);
      const label = (refModel && refModel.labelFields && refModel.labelFields[0]) || 'displayName';
      return ((props.value as any[]) || []).map((v) => v[label]).join(',');
    };
    watch(
      () => props.value,
      async () => {
        displayValue.value = await getDisplayName();
      },
      {
        deep: true,
        immediate: true
      }
    );
    return { displayValue };
  }
});
</script>
