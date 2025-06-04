<template>
  <div :class="[`${DEFAULT_PREFIX}-spin-nested-loading`, wrapperClassName]">
    <div v-if="loading">
      <div :class="`${DEFAULT_PREFIX}-spin ${DEFAULT_PREFIX}-spin-spinning`">
        <van-loading :spinning="loading" vertical />
      </div>
    </div>
    <div :class="{ [`${DEFAULT_PREFIX}-spin-container`]: true, [`${DEFAULT_PREFIX}-spin-blur`]: loading }">
      <slot />
    </div>
  </div>
</template>
<script lang="ts">
import { StringHelper } from '@oinone/kunlun-shared';
import { Loading as VanLoading } from 'vant';
import { computed, defineComponent, PropType } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioSpin',
  components: {
    VanLoading
  },
  inheritAttrs: false,
  props: {
    loading: Boolean,
    wrapperClassName: {
      type: [String, Array] as PropType<string | string[]>
    }
  },
  slots: ['default'],
  setup(props) {
    const wrapperClassName = computed(() => {
      return StringHelper.append([`${DEFAULT_PREFIX}-spin-wrapper`], props.wrapperClassName).join(' ');
    });

    return {
      wrapperClassName,
      DEFAULT_PREFIX
    };
  }
});
</script>
