<template>
  <div class="default-download" :class="{ 'default-download--disabled': disabled }">
    <span class="default-download__prefix" v-if="linkDisplayTextPrefix">{{ $translate(linkDisplayTextPrefix) }}</span>
    <a class="default-download__link" :href="value" @click="onDownload">{{ $translate(linkDisplayText) }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  name: 'DefaultDownload',
  props: {
    value: {
      type: String
    },
    linkDisplayTextPrefix: {
      type: String
    },
    linkDisplayText: {
      type: String
    },
    disabled: {
      type: Boolean
    },
    onDownload: {
      type: Function as PropType<(e: Event) => void>
    }
  }
});
</script>
<style lang="scss">
.default-download {
  > .default-download__prefix {
    margin-right: var(--oio-margin-sm);
  }

  > .default-download__link {
    color: var(--oio-primary-color);
    text-decoration: underline;
  }

  &.default-download--disabled {
    cursor: not-allowed;
    color: var(--oio-disabled-color);

    > .default-download__link {
      color: var(--oio-disabled-color);
      cursor: not-allowed;
    }
  }
}
</style>
