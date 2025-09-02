<template>
  <div class="default-view-control-item default-view-control-full-screen">
    <oio-icon size="16" :icon="icon" @click="onChange" />
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
      return props.value ? 'icon-fullscreen-exit-outlined' : 'icon-fullscreen-outlined';
    });

    const onChange = () => {
      emit('update:value', !props.value);
      emit('change', !props.value);
    };

    return { icon, onChange };
  }
});
</script>
