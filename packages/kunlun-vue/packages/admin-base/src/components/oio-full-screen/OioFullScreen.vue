<template>
  <div class="default-view-control-item default-view-control-full-screen">
    <oio-tooltip v-model:visible="visible" placement="bm" :title="tooltipTitle">
      <oio-icon size="16" :icon="icon" @click="onChange" />
    </oio-tooltip>
  </div>
</template>

<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioIcon, OioTooltip } from '@oinone/kunlun-vue-ui-antd';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    OioIcon,
    OioTooltip
  },
  emits: ['update:value', 'change'],
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const visible = ref(false);

    const icon = computed(() => {
      return props.value ? 'oinone-fullscreen-exit-outlined' : 'oinone-fullscreen-outlined';
    });

    const tooltipTitle = computed(() => {
      if (props.value) {
        return translateValueByKey('取消全屏');
      }
      return translateValueByKey('全屏');
    });

    const onChange = () => {
      visible.value = false;
      emit('update:value', !props.value);
      emit('change', !props.value);
    };

    return {
      visible,
      icon,
      tooltipTitle,
      onChange
    };
  }
});
</script>
