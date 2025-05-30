<template>
  <div class="oio-debug-runtime-context-fields">这是一个自定义组件</div>
</template>
<script lang="ts">
import { RuntimeModelField } from '@kunlun/engine';
import { defineComponent, PropType } from 'vue';
import { DebugInfoProps } from '../../../typing';

interface SimplifyFields {
  handle: string;
  modelFields: RuntimeModelField[];
  childrenContext: SimplifyFields[];
}

export default defineComponent({
  name: 'DebugRuntimeFieldComponent',
  components: {},
  inheritAttrs: false,
  props: {
    ...DebugInfoProps,
    simplifyFields: {
      type: Object as PropType<SimplifyFields>
    }
  },
  setup() {
    return {};
  }
});
</script>
