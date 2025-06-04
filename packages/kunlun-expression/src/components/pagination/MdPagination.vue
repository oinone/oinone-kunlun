<template>
  <div class="md-pagination">
    <div class="pagination-content" :class="[currentSizeClass]">
      <span :class="[currentValue === 1 ? 'starts-ends' : 'prev']" @click="prevClick">
        <LeftOutlined :class="[currentValue === 1 ? 'icon-first-last' : 'pagination-icon']" />
      </span>
      <span>
        <oio-input
          :size="size"
          :value="`${currentValue}`"
          @input="onChangeValue"
          @blur="unfocus"
          @keyup.enter="unfocus"
        />
      </span>
      <i>/</i>
      <span>{{ maxPageNum }}</span>
      <span :class="[currentValue === maxPageNum ? 'starts-ends' : 'next']" @click="nextClick">
        <RightOutlined :class="[currentValue === maxPageNum ? 'icon-first-last' : 'pagination-icon']" />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, SetupContext, watch } from 'vue';
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue';
import { ElementSize } from '../../types';
import { OioInput } from '@oinone/kunlun-vue-ui-antd';

export default defineComponent({
  components: {
    LeftOutlined,
    RightOutlined,
    OioInput
  },
  props: {
    current: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      default: ElementSize.MIDDLE
    }
  },

  emits: ['change'],

  setup(props, { emit }: SetupContext) {
    const prevDisable = ref(false);
    const nextDisable = ref(false);
    const currentValue = ref(props.current);

    const currentSizeClass = computed(() => {
      return `md-pagination-${props.size}`;
    });

    const maxPageNum = computed(() => {
      return Math.ceil(props.total / props.pageSize);
    });

    watch(
      () => props.current,
      () => {
        currentValue.value = props.current;
      },
      { immediate: true }
    );

    const unfocus = () => {
      if (currentValue.value < 1) {
        currentValue.value = 1;
      } else if (currentValue.value > maxPageNum.value) {
        currentValue.value = maxPageNum.value;
      }

      emit('change', currentValue.value, props.pageSize);
    };

    const nextClick = () => {
      prevDisable.value = false;
      if (currentValue.value < maxPageNum.value) {
        currentValue.value++;
      } else {
        nextDisable.value = true;
        return;
      }

      emit('change', currentValue.value, props.pageSize);
    };

    const prevClick = () => {
      nextDisable.value = false;
      if (currentValue.value <= 1) {
        prevDisable.value = true;
        return;
      } else {
        --currentValue.value;
      }

      emit('change', currentValue.value, props.pageSize);
    };

    const onChangeValue = (e: Event) => {
      const target = e.target as HTMLInputElement;

      if (!target.value) {
        currentValue.value = null as any;
      } else if (!isNaN(Number(target.value)) && /^[1-9]+$/.test(target.value)) {
        currentValue.value = Number(target.value);
      } else {
        currentValue.value = props.current;
      }

      target.value = String(currentValue.value);
    };

    return {
      currentValue,
      prevDisable,
      nextDisable,
      maxPageNum,
      currentSizeClass,
      onChangeValue,
      unfocus,
      prevClick,
      nextClick
    };
  }
});
</script>
