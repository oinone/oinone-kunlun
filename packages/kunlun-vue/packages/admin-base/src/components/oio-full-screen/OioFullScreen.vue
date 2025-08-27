<template>
  <div class="table-full-screen">
    <oio-icon :icon="icon" @click="onChange" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';

export default defineComponent({
  components: {
    OioIcon
  },
  emits: ['update:value', 'change'],
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const icon = computed(() => {
      return props.value ? 'oinone-shousuo' : 'oinone-quanping';
    });

    const onChange = () => {
      emit('update:value', !props.value);
      emit('change', !props.value);
    };

    return { icon, onChange };
  }
});
</script>
