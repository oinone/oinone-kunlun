<template>
  <detail-common-field class="default-detail-html" :value="realValue" :empty-style="emptyStyle">
    <template #default>
      <preview-html :html="realValue" :style="realValue && 'min-height: 300px'" />
    </template>
  </detail-common-field>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import DetailCommonField from '../common/DetailCommonField.vue';
import { PreviewHtml } from '../../../components/common';

export default defineComponent({
  components: { DetailCommonField, PreviewHtml },
  props: {
    value: {
      type: String
    },
    encode: {
      type: Boolean
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    const realValue = computed(() => {
      if (props.encode && props.value) {
        return decodeURI(props.value);
      }
      return props.value;
    });
    return {
      realValue
    };
  }
});
</script>
