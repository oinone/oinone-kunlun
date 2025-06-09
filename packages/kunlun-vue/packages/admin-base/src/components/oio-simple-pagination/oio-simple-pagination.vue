<template>
  <div class="oio-simple-pagination">
    <oio-icon
      icon="oinone-zuofanye"
      :class="[disablePre && 'oio-icon-disabled']"
      :color="disablePre ? 'rgba(0, 0, 0, 0.25)' : undefined"
      :size="16"
      @click="onChange('pre')"
    ></oio-icon>
    <span>
      <span>{{ current }}</span>
      <span>/</span>
      <span>{{ total }}</span>
    </span>
    <oio-icon
      icon="oinone-youfanye"
      :class="[disableNext && 'oio-icon-disabled']"
      :color="disableNext ? 'rgba(0, 0, 0, 0.25)' : undefined"
      :size="16"
      @click="onChange('next')"
    ></oio-icon>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';

export default defineComponent({
  name: 'OioSimplePagination',
  components: {
    OioIcon
  },
  props: {
    total: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 1
    },
    current: {
      type: Number,
      default: 1
    }
  },
  emits: ['change', 'update:current'],

  setup(props, { emit }) {
    const disablePre = computed(() => {
      return props.current <= 1;
    });

    const disableNext = computed(() => {
      return props.current >= props.total;
    });

    const onChange = (type: 'pre' | 'next') => {
      if (type === 'pre' && props.current > 1) {
        const val = props.current - 1;
        emit('change', val);
        emit('update:current', val);
      } else if (type === 'next' && props.current < props.total) {
        const val = props.current + 1;
        emit('change', val);
        emit('update:current', val);
      }
    };

    return { disablePre, disableNext, onChange };
  }
});
</script>

<style lang="scss">
.oio-simple-pagination {
  display: flex;
  column-gap: 8px;
  align-items: center;
  .oio-icon {
    cursor: pointer;

    &.oio-icon-disabled {
      cursor: not-allowed;
    }
  }
}
</style>
