<template>
  <div class="mobile-common-input-prefix-suffix" :style="style">
    <oio-icon v-if="contentType === InputPreSuffixType.ICON" :icon="content" :color="color" :size="fontSize" />
    <div v-else-if="contentType === InputPreSuffixType.TEXT" class="mobile-common-input-prefix-suffix-text">
      <pre style="margin: unset">{{ content }}</pre>
    </div>
  </div>
</template>
<script lang="ts">
import { OioIcon } from '@kunlun/vue-ui-mobile-vant';
import { defineComponent, PropType } from 'vue';
import { InputPreSuffixType } from '../abstract/FormInputAbstractFieldWidget';

export default defineComponent({
  name: 'InputPreSuffix',
  components: { OioIcon },
  inheritAttrs: false,
  props: {
    contentType: {
      type: String
    },
    fixMode: {
      type: String
    },
    content: {
      type: String
    },
    style: {
      type: Object as PropType<CSSStyleDeclaration>
    },
    color: {
      type: String,
      default: 'var(--oio-text-color)'
    },
    fontSize: {
      type: String,
      default: 'var(--oio-font-size)'
    }
  },
  setup() {
    return { InputPreSuffixType };
  }
});
</script>
